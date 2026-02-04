// +build ignore

#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

SEC("kprobe/sys_execve")
int kprobe_execve(void *ctx) {
    char msg[] = "NexDefend: Execve detected\n";
    bpf_trace_printk(msg, sizeof(msg));
    return 0;
}

char __license[] SEC("license") = "GPL";
