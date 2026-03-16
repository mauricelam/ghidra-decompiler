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
 * Perform decompilation of a function (Bridge function).
 */
const char* decompile_pcode(const char* sla_content, const char* pspec_content, const char* image_xml) {
    // This is a placeholder for the actual decompilation logic.
    // Integration requires initializing a SleighArchitecture with the provided XML contents.

    std::string result = "Decompiler WASM Module Loaded Successfully.\n";
    result += "Ready for browser-side integration.\n";

    char* cstr = (char*)malloc(result.size() + 1);
    std::strcpy(cstr, result.c_str());
    return cstr;
}

void free_string(char* str) {
    free(str);
}

}
