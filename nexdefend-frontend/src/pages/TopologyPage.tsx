import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { getTopology } from '@/api/topology';
import { GlassCard } from '@/components/ui/GlassCard';
import { Network, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

// 1. Define Icon Paths (Simple SVG paths for D3 usage)
const ICONS = {
    server: "M15,9H9V7H15M15,11H9V13H15M15,15H9V17H15M2,5V19H22V5H2M20,17H4V7H20V17Z", // Material Server Icon path
    router: "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z",
    firewall: "M12 2L2 7V17C2 22.5 12 28 12 28C12 28 22 22.5 22 17V7L12 2Z"
};

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  type?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

const TopologyPage: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<{ nodes: Node[]; links: Link[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getTopology();
      if (response && Array.isArray(response.nodes) && Array.isArray(response.links)) {
        setData({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nodes: response.nodes.map((n: any) => ({ ...n })),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          links: response.links.map((l: any) => ({ ...l }))
        });
      } else {
        // Fallback Mock Data if API fails or returns empty
        setData({
            nodes: [
                { id: "Core-Router", group: 1, type: "router" },
                { id: "Firewall-01", group: 1, type: "firewall" },
                { id: "Switch-Core", group: 2, type: "router" },
                { id: "App-Srv-01", group: 3, type: "server" },
                { id: "App-Srv-02", group: 3, type: "server" },
                { id: "DB-Primary", group: 4, type: "server" },
                { id: "DB-Replica", group: 4, type: "server" },
                { id: "Web-LB", group: 2, type: "router" },
                { id: "Web-01", group: 3, type: "server" },
                { id: "Web-02", group: 3, type: "server" },
            ],
            links: [
                { source: "Core-Router", target: "Firewall-01", value: 5 },
                { source: "Firewall-01", target: "Switch-Core", value: 5 },
                { source: "Switch-Core", target: "Web-LB", value: 3 },
                { source: "Switch-Core", target: "App-Srv-01", value: 2 },
                { source: "Switch-Core", target: "App-Srv-02", value: 2 },
                { source: "App-Srv-01", target: "DB-Primary", value: 2 },
                { source: "App-Srv-02", target: "DB-Primary", value: 2 },
                { source: "DB-Primary", target: "DB-Replica", value: 4 },
                { source: "Web-LB", target: "Web-01", value: 1 },
                { source: "Web-LB", target: "Web-02", value: 1 },
            ]
        });
      }
    } catch (err) {
      console.error("Topology fetch error:", err);
      // Fallback Mock Data on Error
      setData({
            nodes: [
                { id: "Core-Router", group: 1, type: "router" },
                { id: "Firewall-01", group: 1, type: "firewall" },
                { id: "Switch-Core", group: 2, type: "router" },
                { id: "App-Srv-01", group: 3, type: "server" },
                { id: "App-Srv-02", group: 3, type: "server" },
                { id: "DB-Primary", group: 4, type: "server" },
                { id: "DB-Replica", group: 4, type: "server" },
                { id: "Web-LB", group: 2, type: "router" },
                { id: "Web-01", group: 3, type: "server" },
                { id: "Web-02", group: 3, type: "server" },
            ],
            links: [
                { source: "Core-Router", target: "Firewall-01", value: 5 },
                { source: "Firewall-01", target: "Switch-Core", value: 5 },
                { source: "Switch-Core", target: "Web-LB", value: 3 },
                { source: "Switch-Core", target: "App-Srv-01", value: 2 },
                { source: "Switch-Core", target: "App-Srv-02", value: 2 },
                { source: "App-Srv-01", target: "DB-Primary", value: 2 },
                { source: "App-Srv-02", target: "DB-Primary", value: 2 },
                { source: "DB-Primary", target: "DB-Replica", value: 4 },
                { source: "Web-LB", target: "Web-01", value: 1 },
                { source: "Web-LB", target: "Web-02", value: 1 },
            ]
        });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Render D3
  useEffect(() => {
    if (!data || !svgRef.current || !wrapperRef.current) return;

    const { width, height } = wrapperRef.current.getBoundingClientRect();
    const { nodes, links } = data;

    // Cleanup
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    // Define Filters (Glow)
    const defs = svg.append("defs");
    const filter = defs.append("filter")
        .attr("id", "glow");
    filter.append("feGaussianBlur")
        .attr("stdDeviation", "2.5")
        .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const color = d3.scaleOrdinal()
        .domain(["1", "2", "3", "4"])
        .range(["#00D1FF", "#A855F7", "#3B82F6", "#22C55E"]);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => (d as Node).id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(50));

    // Links
    const link = svg.append("g")
      .attr("stroke", "#ffffff")
      .attr("stroke-opacity", 0.1)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value) * 1.5);

    // Nodes Group
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call(drag(simulation) as any);

    // Node Circles (Background)
    node.append("circle")
        .attr("r", 20)
        .attr("fill", "#09090b")
        .attr("stroke", (d) => color(String(d.group)) as string)
        .attr("stroke-width", 2)
        .style("filter", "url(#glow)");

    // Icons
    node.append("path")
        .attr("d", (d) => {
            if(d.type === 'router') return ICONS.router;
            if(d.type === 'firewall') return ICONS.firewall;
            return ICONS.server;
        })
        .attr("fill", (d) => color(String(d.group)) as string)
        .attr("transform", "translate(-12, -12) scale(1)");

    // Labels
    node.append("text")
        .attr("dy", 35)
        .attr("text-anchor", "middle")
        .text((d) => d.id)
        .attr("fill", "#94a3b8")
        .style("font-size", "10px")
        .style("font-family", "JetBrains Mono, monospace")
        .style("font-weight", "bold");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x!)
        .attr("y1", (d) => (d.source as Node).y!)
        .attr("x2", (d) => (d.target as Node).x!)
        .attr("y2", (d) => (d.target as Node).y!);

      node
        .attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function drag(simulation: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }

    return () => { simulation.stop(); };
  }, [data]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Network Topology</h1>
          <p className="text-gray-400">Real-time force-directed graph of network infrastructure.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchData} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''}/>
            </button>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                <ZoomIn size={18}/>
            </button>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                <ZoomOut size={18}/>
            </button>
        </div>
      </div>

      <GlassCard className="flex-1 p-0 overflow-hidden relative" title="Infrastructure Map" icon={<Network className="h-5 w-5"/>}>
          <div ref={wrapperRef} className="w-full h-[600px] bg-[#050505]" style={{
              backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
              backgroundSize: '30px 30px'
          }}>
              <svg ref={svgRef} className="w-full h-full block" />

              {/* Legend Overlay */}
              <div className="absolute bottom-4 right-4 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Node Types</h4>
                  <div className="space-y-2">
                      <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#00D1FF] shadow-[0_0_10px_#00D1FF]"></span>
                          <span className="text-xs text-gray-300">Router / Gateway</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#A855F7] shadow-[0_0_10px_#A855F7]"></span>
                          <span className="text-xs text-gray-300">Switch / LB</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]"></span>
                          <span className="text-xs text-gray-300">Application Server</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#22C55E] shadow-[0_0_10px_#22C55E]"></span>
                          <span className="text-xs text-gray-300">Database</span>
                      </div>
                  </div>
              </div>
          </div>
      </GlassCard>
    </div>
  );
};

export default TopologyPage;
