/*
 * ADDITION IN THIS FORK:
 * This file provides a bridge between the Ghidra decompiler C++ logic
 * and WebAssembly exports for browser usage.
 */
#include "libdecomp.hh"
#include <string>
#include <cstring>
#include <iostream>

using namespace ghidra;

extern "C" {

/**
 * Initialize the decompiler library.
 * This must be called once before any decompilation.
 */
void init_decompiler() {
    startDecompilerLibrary(NULL);
}

/**
 * Perform decompilation of a function.
 *
 * To decompile a file in the browser, you typically:
 * 1. Load the compiled SLEIGH specification (.sla) for the architecture.
 * 2. Load the binary data.
 * 3. Call this function with the XML representation of the image and the specs.
 *
 * @param sla_content The content of the SLEIGH specification file (.sla)
 * @param pspec_content The content of the processor specification file (.pspec)
 * @param image_xml XML describing the binary image to load (LoadImageXml format).
 * @return A C-string containing the decompiled code (must be freed by the caller).
 */
const char* decompile_pcode(const char* sla_content, const char* pspec_content, const char* image_xml) {
    // This is where the core logic would reside.
    // Full integration involves:
    // 1. Parsing the SLA/PSPEC strings into memory.
    // 2. Initializing a SleighArchitecture.
    // 3. Initializing a LoadImageXml with the image_xml.
    // 4. Running the Funcdata analysis.

    std::string result = "/* Decompiler WASM Bridge */\n";
    result += "// Implementation Note: To perform a real decompilation, you must\n";
    result += "// instantiate a SleighArchitecture using the provided specification strings.\n";
    result += "// The module has successfully received the following inputs:\n";
    result += "// SLA size: " + std::to_string(std::strlen(sla_content)) + " bytes\n";
    result += "// Image XML size: " + std::to_string(std::strlen(image_xml)) + " bytes\n";

    char* cstr = (char*)malloc(result.size() + 1);
    std::strcpy(cstr, result.c_str());
    return cstr;
}

/**
 * Free a string allocated by the module.
 */
void free_string(char* str) {
    free(str);
}

}
