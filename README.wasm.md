# Ghidra C++ Decompiler Standalone & WebAssembly

This project provides a standalone build configuration for the Ghidra C++ decompiler, including support for WebAssembly.

## Standalone Native Build
To build the decompiler as a standalone static library and executable:
```bash
make -f Makefile.standalone
```
This builds `libdecomp.a` and `decomp_standalone`.

## WebAssembly Build
To build for the browser using Emscripten:
```bash
make -f Makefile.wasm
```
Produces `ghidra_decompiler.js` and `ghidra_decompiler.wasm`.

## Usage
The WASM module exposes a `decompile_pcode` function that can be called from JavaScript.
