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
   The page should display "Module ready" once the WASM module is initialized.

## How to Decompile a File

To perform an actual decompilation, the decompiler needs two things:
1. **The Architecture Specification**: Ghidra uses compiled SLEIGH files (`.sla`). You can find these in the standard `Processors/` directory. For example, for x86 64-bit: `Processors/x86/data/languages/x86-64.sla`.
2. **The Binary Image**: The decompiler needs the bytes to decompile.

### Step-by-Step Example in Browser:
1. Open the browser example (`example_wasm.html`).
2. Upload an `.sla` file (e.g., `Processors/x86/data/languages/x86.sla`).
3. Upload any binary file you wish to decompile.
4. Click "Run Decompiler".
5. The example bridge will confirm receipt of the files and display their sizes.

## Native Standalone Usage
You can also use the native tool to decompile via XML-based image descriptions:
```bash
./decomp_standalone
[decomp]> load file my_image.xml
[decomp]> decompile
```

## Implementation Notes
- BFD dependency has been removed in this fork via `GHIDRA_NO_BFD` conditional compilation to simplify standalone usage and WASM compatibility.
- Pre-generated parser files are used to avoid dependency on `bison` and `flex`.
- `wasm_wrapper.cc` provides the entry point for WebAssembly exports.
