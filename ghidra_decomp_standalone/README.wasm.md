# Ghidra C++ Decompiler Standalone & WebAssembly

This directory contains a standalone extraction of the Ghidra C++ decompiler.

## Components Extracted
- Core P-code engine
- Sleigh disassembler/emulator
- C decompiler
- Interface for console and library usage

## Native Build
To build the standalone library and console executable:
```bash
make
```
This will produce:
- `libdecomp.a`: Static library for embedding.
- `decomp_opt`: Console-based decompiler tool.

## WebAssembly Build
The build for WebAssembly uses Emscripten.

### Requirements
- [Emscripten SDK (emsdk)](https://emscripten.org/docs/getting_started/downloads.html)

### Build Instructions
```bash
make -f Makefile.wasm
```
This will produce `ghidra_decompiler.js` and `ghidra_decompiler.wasm`.

### Usage in Browser
```javascript
import GhidraDecompiler from './ghidra_decompiler.js';

GhidraDecompiler().then(Module => {
    const decompile = Module.cwrap('decompile_pcode', 'string', ['string', 'string', 'string']);
    const result = decompile(slaContent, pspecContent, imageXml);
    console.log(result);
});
```

## Implementation Notes
- BFD dependency has been removed to simplify standalone usage and WASM compatibility.
- Pre-generated parser files are included to avoid dependency on `bison` and `flex`.
- `wasm_wrapper.cc` provides the entry point for WebAssembly exports.
