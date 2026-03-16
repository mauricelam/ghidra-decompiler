#include <iostream>
#include <string>
#include <vector>
#include "libdecomp.hh"

using namespace ghidra;

int main() {
    std::cout << "Ghidra Decompiler Standalone" << std::endl;
    startDecompilerLibrary(".");
    std::cout << "Library started successfully" << std::endl;
    shutdownDecompilerLibrary();
    return 0;
}
