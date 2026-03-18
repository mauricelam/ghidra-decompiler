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
        console.error(e);
    }
}

async function readFileAsText(file) {
    if (!file) return "";
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

async function readFileAsArrayBuffer(file) {
    if (!file) return null;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(new Uint8Array(e.target.result));
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
    });
}

/**
 * More efficient hex encoding for large buffers.
 */
function bytesToHex(bytes) {
    const hex = [];
    for (let i = 0; i < bytes.length; i++) {
        hex.push(bytes[i].toString(16).padStart(2, '0'));
        if (i % 20 === 19) hex.push('\n');
    }
    return hex.join('');
}

async function runDecompiler() {
    const output = document.getElementById('output');
    const slaFile = document.getElementById('slaInput').files[0];
    const pspecFile = document.getElementById('pspecInput').files[0];
    const cspecFile = document.getElementById('cspecInput').files[0];
    const binFile = document.getElementById('binInput').files[0];
    const funcName = document.getElementById('funcName').value;

    if (!slaFile || !binFile || !pspecFile || !cspecFile) {
        alert('Please provide .sla, .pspec, .cspec and a binary file.');
        return;
    }

    output.textContent = 'Reading files...';
    try {
        const [slaData, pspecContent, cspecContent, binData] = await Promise.all([
            readFileAsArrayBuffer(slaFile),
            readFileAsText(pspecFile),
            readFileAsText(cspecFile),
            readFileAsArrayBuffer(binFile)
        ]);

        const imageXml = `
<binaryimage arch="wasm:le:32:default">
  <bytechunk address="ram:0x1000">
    ${bytesToHex(binData)}
  </bytechunk>
</binaryimage>`;

        output.textContent = 'Calling WASM decompiler...';

        // Copy binary SLA data to WASM heap
        const slaPtr = decompilerModule._malloc(slaData.length);
        decompilerModule.HEAPU8.set(slaData, slaPtr);

        try {
            // Call the bridge function
            const result = decompilerModule.ccall(
                'decompile_pcode',
                'string',
                ['number', 'number', 'string', 'string', 'string', 'string'],
                [slaPtr, slaData.length, pspecContent, cspecContent, imageXml, funcName]
            );

            output.textContent = result;
        } finally {
            decompilerModule._free(slaPtr);
        }
    } catch (e) {
        output.textContent = 'Error during decompilation: ' + e.message;
        console.error(e);
    }
}

document.getElementById('decompileBtn').addEventListener('click', runDecompiler);
window.addEventListener('load', init);
