package ebpf

import (
	"log"
	"os"

	"github.com/cilium/ebpf"
	"github.com/cilium/ebpf/link"
	"github.com/cilium/ebpf/rlimit"
)

func LoadAndAttach() {
	// eBPF requires privileged access.
	// For this demo, we check if we can remove memlock.
	if err := rlimit.RemoveMemlock(); err != nil {
		log.Printf("[eBPF] Warning: Failed to remove memlock limit (requires root): %v. Active Defense module disabled.", err)
		return
	}

    // Try to load pre-compiled object (bpf.o)
    // In a real build pipeline, this would be embedded or shipped.
    // Here we check if it exists, if not, we skip.
    bpfFile := "ebpf/bpf.o"
    if _, err := os.Stat(bpfFile); os.IsNotExist(err) {
        log.Printf("[eBPF] Info: %s not found. Skipping Active Defense module.", bpfFile)
        return
    }

	// Load the collection
	spec, err := ebpf.LoadCollectionSpec(bpfFile)
	if err != nil {
		log.Printf("[eBPF] Error loading spec: %v", err)
		return
	}

	objs := struct {
		KprobeExecve *ebpf.Program `ebpf:"kprobe_execve"`
	}{}
	if err := spec.LoadAndAssign(&objs, nil); err != nil {
		log.Printf("[eBPF] Error loading objects: %v", err)
		return
	}
	defer objs.KprobeExecve.Close()

	kp, err := link.Kprobe("sys_execve", objs.KprobeExecve, nil)
	if err != nil {
		log.Printf("[eBPF] Error attaching kprobe: %v", err)
		return
	}
	defer kp.Close()

	log.Println("[eBPF] Active Defense: Probes attached successfully")

    // Block until exit
    select {}
}
