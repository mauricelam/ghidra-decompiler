# Ghidra C++ Decompiler Standalone & WebAssembly
# ADDITION IN THIS FORK: Documentation for standalone and WebAssembly support.

This project provides a standalone build configuration in this fork.

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

## Browser Usage Example
A complete example showing how to load and use the WASM module in a browser is provided in:
- `example_wasm.html`
- `example_wasm.js`

To run the example, serve the repository root via a web server (to handle WASM mime types correctly) and open `example_wasm.html`.

## Implementation Notes
- BFD dependency has been removed in this fork to simplify standalone usage and WASM compatibility.
- Pre-generated parser files are used to avoid dependency on `bison` and `flex`.
- `wasm_wrapper.cc` provides the entry point for WebAssembly exports.
