/*
 * ADDITION IN THIS FORK:
 * This file provides a bridge between the Ghidra decompiler C++ logic
 * and WebAssembly exports for browser usage.
 *
 * MODIFICATION IN THIS FORK:
 * Implemented a full memory-based Architecture and Sleigh translator
 * to support real decompilation in the browser without a file system.
 */
#include "libdecomp.hh"
#include "printc.hh"
#include "loadimage_xml.hh"
#include "inject_sleigh.hh"
#include "xml_arch.hh"
#include <string>
#include <cstring>
#include <iostream>
#include <sstream>
#include <vector>

using namespace ghidra;

namespace ghidra {

/**
 * Custom Sleigh translator that loads .sla data from a memory buffer.
 */
class WasmSleigh : public Sleigh {
    const uint8_t* sla_data;
    int sla_size;
public:
    WasmSleigh(LoadImage *ld, ContextDatabase *c_db, const uint8_t* data, int size)
        : Sleigh(ld, c_db), sla_data(data), sla_size(size) {}

    virtual void initialize(DocumentStorage &store) override {
        if (!isInitialized()) {
            // Sleigh::initialize usually reads from a file path in the 'sleigh' tag.
            // We bypass that and use FormatDecode directly on our memory buffer.
            sla::FormatDecode decoder(this);
            std::string content((const char*)sla_data, sla_size);
            std::istringstream s(content, std::ios_base::binary);
            decoder.ingestStream(s);
            decode(decoder);
        } else {
            reregisterContext();
        }

        // Initialize disassembly cache (logic copied from Sleigh::initialize)
        uint4 parser_cachesize = 2;
        uint4 parser_windowsize = 32;
        if ((maxdelayslotbytes > 1) || (unique_allocatemask != 0)) {
            parser_cachesize = 8;
            parser_windowsize = 256;
        }
        discache = new DisassemblyCache(this, cache, getConstantSpace(), parser_cachesize, parser_windowsize);
    }
};

/**
 * Custom Architecture that loads PSPEC and CSPEC from strings and uses WasmSleigh.
 */
class WasmArchitecture : public SleighArchitecture {
    const uint8_t* sla_data;
    int sla_size;
    std::string pspec_content;
    std::string cspec_content;
    std::ostringstream messages;
public:
    WasmArchitecture(const std::string &fname, const std::string &targ,
                     const uint8_t* sla_ptr, int sla_sz,
                     const std::string &pspec_str, const std::string &cspec_str)
        : SleighArchitecture(fname, targ, &messages),
          sla_data(sla_ptr), sla_size(sla_sz),
          pspec_content(pspec_str), cspec_content(cspec_str) {}

    virtual void buildLoader(DocumentStorage &store) override {
        const Element *el = store.getTag("binaryimage");
        if (el == (const Element *)0) {
            throw LowlevelError("Could not find binaryimage tag in DocumentStorage");
        }
        loader = new LoadImageXml(getFilename(), el);
    }

    virtual void resolveArchitecture(void) override {
        archid = "wasm:le:32:default";
    }

    virtual void buildSpecFile(DocumentStorage &store) override {
        std::istringstream pspec_s(pspec_content);
        Document *pdoc = store.parseDocument(pspec_s);
        store.registerTag(pdoc->getRoot());

        std::istringstream cspec_s(cspec_content);
        Document *cdoc = store.parseDocument(cspec_s);
        store.registerTag(cdoc->getRoot());

        std::istringstream s("<sleigh>mem</sleigh>");
        Document *sdoc = store.parseDocument(s);
        store.registerTag(sdoc->getRoot());
    }

    virtual Translate* buildTranslator(DocumentStorage &store) override {
        return new WasmSleigh(loader, context, sla_data, sla_size);
    }

    virtual PcodeInjectLibrary* buildPcodeInjectLibrary(void) override {
        return new PcodeInjectLibrarySleigh(this);
    }

    virtual void buildTypegrp(DocumentStorage &store) override {
        types = new TypeFactory(this);
    }

    virtual void buildCoreTypes(DocumentStorage &store) override {
        SleighArchitecture::buildCoreTypes(store);
    }

    virtual void buildCommentDB(DocumentStorage &store) override {
        commentdb = new CommentDatabaseInternal();
    }

    virtual void buildStringManager(DocumentStorage &store) override {
        stringManager = new StringManagerUnicode(this, 2048);
    }

    virtual void buildConstantPool(DocumentStorage &store) override {
        cpool = new ConstantPoolInternal();
    }

    virtual void buildContext(DocumentStorage &store) override {
        context = new ContextInternal();
    }

    virtual void buildSymbols(DocumentStorage &store) override {
        // Handled by LoadImageXml and auto-discovery
    }

    virtual void modifySpaces(Translate *trans) override {
    }

    virtual void postSpecFile(void) override {
        SleighArchitecture::postSpecFile();
        ((LoadImageXml *)loader)->open(this);
    }

    virtual void printMessage(const string &message) const override {
        const_cast<std::ostringstream&>(messages) << message << std::endl;
    }

    std::string getMessages() const { return messages.str(); }
};

} // namespace ghidra

extern "C" {

void init_decompiler() {
    startDecompilerLibrary(NULL);
}

const char* decompile_pcode(const uint8_t* sla_data, int sla_size,
                            const char* pspec_content, const char* cspec_content,
                            const char* image_xml, const char* func_name) {
    std::string result;

    try {
        DocumentStorage store;
        std::istringstream image_stream(image_xml);
        Document *doc = store.parseDocument(image_stream);
        store.registerTag(doc->getRoot());

        WasmArchitecture *glb = new WasmArchitecture("wasm_image", "default",
                                                   sla_data, sla_size,
                                                   pspec_content, cspec_content);
        glb->init(store);

        Funcdata *fd = NULL;
        fd = glb->symboltab->getGlobalScope()->queryFunction(func_name);

        if (fd == NULL) {
            try {
                Address addr = glb->parseAddressSimple(func_name);
                fd = glb->symboltab->getGlobalScope()->queryFunction(addr);
                if (fd == NULL) {
                    // Create function if not found but address is valid
                    fd = glb->symboltab->getGlobalScope()->addFunction(addr, func_name)->getFunction();
                }
            } catch (...) {}
        }

        if (fd == NULL) {
            result = "Error: Could not find or create function '" + std::string(func_name) + "'.\n";
            result += "Decompiler Messages:\n" + glb->getMessages();
        } else {
            glb->allacts.getCurrent()->reset(*fd);
            glb->allacts.getCurrent()->perform(*fd);

            std::ostringstream ss;
            glb->print->setOutputStream(&ss);
            glb->print->docFunction(fd);
            result = ss.str();

            std::string msgs = glb->getMessages();
            if (!msgs.empty()) {
                result = "/* Decompiler Messages:\n" + msgs + "*/\n" + result;
            }
        }

        delete glb;
    } catch (LowlevelError &e) {
        result = "Lowlevel Error: " + e.explain;
    } catch (std::exception &e) {
        result = "Standard Exception: " + std::string(e.what());
    } catch (...) {
        result = "Unknown error occurred during decompilation.";
    }

    char* cstr = (char*)malloc(result.size() + 1);
    std::strcpy(cstr, result.c_str());
    return cstr;
}

void free_string(char* str) {
    free(str);
}

}
