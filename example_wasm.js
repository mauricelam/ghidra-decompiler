/*
 * ADDITION IN THIS FORK:
 * This file provides a browser-side example of using the Ghidra decompiler
 * WebAssembly module.
 */

async function runExample() {
    const outputElement = document.getElementById('output');
    outputElement.textContent = 'Initializing Ghidra Decompiler...';

    try {
        // Initialize the WASM module
        // GhidraDecompiler is the EXPORT_NAME defined in Makefile.wasm
        const Module = await GhidraDecompiler();

        // ADDITION IN THIS FORK: Mandatory fork modification comment.
        // Wrap the C function 'decompile_pcode' for easy calling.
        const decompile_pcode = Module.cwrap('decompile_pcode', 'string', ['string', 'string', 'string']);

        // Example XML inputs (placeholders)
        const slaContent = `
            <sleigh version="1" bigendian="false">
                <spaces>
                    <space name="ram" index="1" size="8" default="yes"/>
                </spaces>
                <!-- ... more sleigh content ... -->
            </sleigh>`;
        const pspecContent = `
            <processor name="example">
                <!-- ... processor details ... -->
            </processor>`;
        const imageXml = `
            <binaryimage>
                <byte_chunk address="ram:0x1000">
                    90 90 90 c3
                </byte_chunk>
            </binaryimage>`;

        outputElement.textContent += '\nCalling decompile_pcode with sample input...';

        // Perform decompilation
        const result = decompile_pcode(slaContent, pspecContent, imageXml);

        outputElement.textContent += '\n\nResult:\n' + result;
        console.log('Decompiler result:', result);

    } catch (error) {
        outputElement.textContent += '\n\nError: ' + error.message;
        console.error('Error running decompiler:', error);
    }
}

// Run the example when the page is loaded
window.addEventListener('load', runExample);
