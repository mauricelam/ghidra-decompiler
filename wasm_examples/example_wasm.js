/*
 * ADDITION IN THIS FORK:
 * This file provides a browser-side example of using the Ghidra decompiler
 * WebAssembly module with real file inputs.
 */

let decompilerModule = null;
let processors = [];

async function init() {
    const output = document.getElementById('output');
    try {
        if (typeof GhidraDecompiler === 'undefined') {
            throw new Error('GhidraDecompiler is not defined. Did you build it?');
        }

        // Fetch processors list
        const resp = await fetch('processors.json');
        processors = await resp.json();

        const procSelect = document.getElementById('processorSelect');
        procSelect.innerHTML = '<option value="">-- Select an Architecture --</option>';
        processors.sort((a, b) => a.description.localeCompare(b.description)).forEach((p, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = p.description;
            procSelect.appendChild(opt);
        });

        procSelect.addEventListener('change', updateCompilers);

        decompilerModule = await GhidraDecompiler();
        // Initialize the library
        decompilerModule._init_decompiler();

        output.textContent = 'Module ready. Please select a processor and a binary file.';
        document.getElementById('decompileBtn').disabled = false;
    } catch (e) {
        output.textContent = 'Error: ' + e.message;
        console.error(e);
    }
}

function updateCompilers() {
    const procIdx = document.getElementById('processorSelect').value;
    const compSelect = document.getElementById('compilerSelect');
    compSelect.innerHTML = '';

    if (procIdx === "") {
        compSelect.innerHTML = '<option value="">-- Select Architecture First --</option>';
        return;
    }

    const proc = processors[procIdx];
    proc.compilers.forEach((c, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = c.name;
        compSelect.appendChild(opt);
    });
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
        reader.onload = (e) => resolve(new Uint8Array(reader.result));
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
    });
}

async function fetchFileAsText(url) {
    const resp = await fetch('../' + url);
    if (!resp.ok) throw new Error(`Failed to fetch ${url}`);
    return await resp.text();
}

async function fetchFileAsArrayBuffer(url) {
    const resp = await fetch('../' + url);
    if (!resp.ok) throw new Error(`Failed to fetch ${url}`);
    const buf = await resp.arrayBuffer();
    return new Uint8Array(buf);
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
    const procIdx = document.getElementById('processorSelect').value;
    const compIdx = document.getElementById('compilerSelect').value;

    const slaInput = document.getElementById('slaInput').files[0];
    const pspecInput = document.getElementById('pspecInput').files[0];
    const cspecInput = document.getElementById('cspecInput').files[0];
    const binFile = document.getElementById('binInput').files[0];
    const funcName = document.getElementById('funcName').value;

    if (!binFile) {
        alert('Please provide a binary file.');
        return;
    }

    output.textContent = 'Preparing specifications...';
    try {
        let slaData, pspecContent, cspecContent;

        if (procIdx !== "") {
            const proc = processors[procIdx];
            const comp = proc.compilers[compIdx];
            output.textContent = `Fetching ${proc.id} specs...`;
            [slaData, pspecContent, cspecContent] = await Promise.all([
                fetchFileAsArrayBuffer(proc.sla),
                fetchFileAsText(proc.pspec),
                fetchFileAsText(comp.spec)
            ]);
        }

        // Override with custom files if provided
        if (slaInput) slaData = await readFileAsArrayBuffer(slaInput);
        if (pspecInput) pspecContent = await readFileAsText(pspecInput);
        if (cspecInput) cspecContent = await readFileAsText(cspecInput);

        if (!slaData || !pspecContent || !cspecContent) {
            alert('Missing SLEIGH, PSPEC or CSPEC. Please select a processor or upload custom files.');
            return;
        }

        output.textContent = 'Reading binary image...';
        const binData = await readFileAsArrayBuffer(binFile);

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
            // We use 'number' return type to get the pointer, so we can free it later
            const resultPtr = decompilerModule.ccall(
                'decompile_pcode',
                'number',
                ['number', 'number', 'string', 'string', 'string', 'string'],
                [slaPtr, slaData.length, pspecContent, cspecContent, imageXml, funcName]
            );

            const result = decompilerModule.UTF8ToString(resultPtr);
            output.textContent = result;

            // Free the string returned by the decompiler
            decompilerModule._free_string(resultPtr);
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
