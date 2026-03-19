#!/bin/bash
# Native verification script for Ghidra decompiler

set -e

echo "1. Compiling hello world..."
echo '#include <stdio.h>
int main() {
    printf("Hello, World!\n");
    return 0;
}' > hello.c
gcc -O2 hello.c -o hello

echo "2. Building standalone decompiler and bridge test..."
make -f Makefile.standalone
g++ -O2 test_wasm_bridge.cc wasm_wrapper.cc libdecomp.a -lz -DGHIDRA_NO_BFD -std=c++11 -I. -o test_bridge

echo "3. Running decompiler on main..."
# x86-64:LE:64:default
MAIN_ADDR=$(nm hello | grep ' T main' | awk '{print "0x"$1}')
echo "Found main at $MAIN_ADDR"

./decomp_standalone -s Processors/x86/data/languages <<EOF
load file x86:LE:64:default hello
load addr $MAIN_ADDR
decompile
print C
quit
EOF

echo "4. Running WASM bridge native test..."
./test_bridge hello Processors/x86/data/languages/x86-64.sla Processors/x86/data/languages/x86-64.pspec Processors/x86/data/languages/x86-64-gcc.cspec main

echo "5. Verification complete."
rm hello.c hello test_bridge
