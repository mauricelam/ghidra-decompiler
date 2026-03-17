/*
 * ADDITION IN THIS FORK:
 * This file provides a browser-side example of using the Ghidra decompiler
 * WebAssembly module with real file inputs.
 */

let decompilerModule = null;

async function init() {
    const output = document.getElementById('output');
    try {
        if (typeof GhidraDecompiler === 'undefined') {
            throw new Error('GhidraDecompiler is not defined. Did you build it?');
        }
        decompilerModule = await GhidraDecompiler();
        // Initialize the library
        decompilerModule._init_decompiler();

        output.textContent = 'Module ready. Please select files.';
        document.getElementById('decompileBtn').disabled = false;
    } catch (e) {
        output.textContent = 'Error: ' + e.message;
    }
}

async function readFile(file) {
    if (!file) return "";
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file);
    });
}

async function runDecompiler() {
    const output = document.getElementById('output');
    const slaFile = document.getElementById('slaInput').files[0];
    const pspecFile = document.getElementById('pspecInput').files[0];
    const binFile = document.getElementById('binInput').files[0];

    if (!slaFile || !binFile) {
        alert('Please provide at least a .sla file and a binary file.');
        return;
    }

    output.textContent = 'Reading files...';
    const slaContent = await readFile(slaFile);
    const pspecContent = await readFile(pspecFile);

    // For the purpose of this example, we mock the XML image format
    // In a real usage, you'd wrap the binary data in the <binaryimage> XML tag
    const imageXml = `
<binaryimage>
  <byte_chunk address="ram:0x1000">
    <!-- Binary data would be hex encoded here -->
    ${binFile.name} loaded
  </byte_chunk>
</binaryimage>`;

    output.textContent = 'Calling WASM decompiler...';

    // Call the bridge function
    const result = decompilerModule.ccall(
        'decompile_pcode',
        'string',
        ['string', 'string', 'string'],
        [slaContent, pspecContent, imageXml]
    );

    output.textContent = result;
}

document.getElementById('decompileBtn').addEventListener('click', runDecompiler);
window.addEventListener('load', init);
