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
A complete example showing how to load and use the WASM module in a browser is provided in the `wasm_examples/` directory:
- `wasm_examples/example_wasm.html`
- `wasm_examples/example_wasm.js`

### Detailed Steps to Run the Example:

1. **Build the WASM module**:
   Ensure you have Emscripten installed, then run:
   ```bash
   make -f Makefile.wasm
   ```
   This will generate `ghidra_decompiler.js` and `ghidra_decompiler.wasm` in the root directory.

2. **Serve the repository**:
   WebAssembly modules must be served via HTTP(S) to be loaded correctly by browsers. You can use any local web server. For example, using Python:
   ```bash
   python3 -m http.server 8000
   ```

3. **Open the example in a browser**:
   Navigate to `http://localhost:8000/wasm_examples/example_wasm.html`.

4. **Verify the output**:
   The page should display "Decompiler WASM Module Loaded Successfully" once the module is initialized.

## Implementation Notes
- BFD dependency has been removed in this fork to simplify standalone usage and WASM compatibility.
- Pre-generated parser files are used to avoid dependency on `bison` and `flex`.
- `wasm_wrapper.cc` provides the entry point for WebAssembly exports.
