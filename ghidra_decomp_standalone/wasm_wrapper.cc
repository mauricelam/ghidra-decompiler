#include "libdecomp.hh"
#include <string>
#include <iostream>
#include <sstream>

using namespace ghidra;

extern "C" {

// Basic wrapper to initialize and run a decompiler task
// In a real usage, you'd want more fine-grained control over the architecture and load image.
// This is a simplified example.

const char* decompile_pcode(const char* sla_content, const char* pspec_content, const char* image_xml) {
    // This function would ideally:
    // 1. Initialize the library
    // 2. Set up a SleighArchitecture from the provided XML/SLA
    // 3. Load the image
    // 4. Decompile a specific function
    // 5. Return the result as a C string

    // For now, it's a stub demonstrating the WASM interface pattern
    std::string result = "Decompilation result would be here.\n";
    result += "Received SLA size: " + std::to_string(strlen(sla_content)) + "\n";

    char* cstr = (char*)malloc(result.size() + 1);
    strcpy(cstr, result.c_str());
    return cstr;
}

void free_string(char* str) {
    free(str);
}

}
