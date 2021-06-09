#!/usr/bin/env python3
from pwn import *
from binascii import hexlify

context.arch = "amd64"


shellcode = hexlify(open("shellcode_raw", "rb").read())

print("shellcode = [", end='')
for i in range(0, len(shellcode), 16):
    short = int(shellcode[i:i+16], 16)
    print('itof(0x'+hexlify(p64(short)).decode(), end='n),')
print("]")
