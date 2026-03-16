// This example demonstrates how to use the Ghidra Decompiler WASM module in a browser.

async function runExample() {
    const outputElement = document.getElementById('output');
    outputElement.textContent = 'Initializing Ghidra Decompiler...';

    try {
        // Initialize the WASM module
        // GhidraDecompiler is the EXPORT_NAME defined in Makefile.wasm
        const Module = await GhidraDecompiler();

        // Wrap the C function 'decompile_pcode'
        // const decompile_pcode = Module.cwrap('decompile_pcode', 'string', ['string', 'string', 'string']);
        // Note: In a real implementation, you would pass actual SLA, PSPEC, and image XML content.

        const slaContent = "<sleigh>...</sleigh>";
        const pspecContent = "<processor>...</processor>";
        const imageXml = "<binaryimage>...</binaryimage>";

        outputElement.textContent += '\nCalling decompile_pcode...';

        // Calling the exported function
        const result = Module.ccall(
            'decompile_pcode', // name of C function
            'string',         // return type
            ['string', 'string', 'string'], // argument types
            [slaContent, pspecContent, imageXml] // arguments
        );

        outputElement.textContent += '\n\nResult:\n' + result;
        console.log('Decompiler result:', result);

    } catch (error) {
        outputElement.textContent += '\n\nError: ' + error.message;
        console.error('Error running decompiler:', error);
    }
}

// Run the example when the page is loaded
window.addEventListener('load', runExample);
