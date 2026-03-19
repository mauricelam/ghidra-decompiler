# Ghidra C++ Decompiler Standalone & WebAssembly
# ADDITION IN THIS FORK: Documentation for standalone and WebAssembly support.

This project provides a standalone build configuration and a WebAssembly bridge in this fork.

## Standalone Native Build
To build the decompiler as a standalone static library and executable:
```bash
make -f Makefile.standalone
```
This builds `libdecomp.a` and `decomp_standalone`.

### Native Verification
You can verify the decompiler functionality natively by running the verification script:
```bash
bash verify_native.sh
```
This script compiles a small C program and uses `decomp_standalone` to decompile it.

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

2. **Serve the repository**:
   **IMPORTANT**: WebAssembly modules must be served via HTTP(S) to be loaded correctly by browsers. Opening the HTML file directly from your disk (`file://`) will NOT work due to security restrictions.

   Use any local web server. For example, using Python:
   ```bash
   python3 -m http.server 8000
   ```

3. **Open the example in a browser**:
   Navigate to `http://localhost:8000/wasm_examples/example_wasm.html`.

4. **Verify the output**:
   - The page should display "Module ready" once the WASM module is initialized.
   - Upload a binary (e.g., an ELF or PE file).
   - The system will attempt to **auto-detect** the architecture.
   - Click "Run Decompiler".

## Implementation Notes
- **Memory-based**: The WASM implementation (`wasm_wrapper.cc`) uses custom `WasmArchitecture` and `WasmSleigh` classes to load all specifications from memory, bypassing the need for a virtual file system.
- **Auto-detection**: The bridge includes logic to identify ELF and PE headers and automatically select the correct Ghidra language ID.
- **Standalone compatibility**: The `GHIDRA_NO_BFD` macro is used to ensure portability and avoid GPL3 requirements.
