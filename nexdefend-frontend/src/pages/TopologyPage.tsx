import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Box, Typography, Paper } from '@mui/material';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  ip: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

const TopologyGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Mock Data
    const nodes: Node[] = [
      { id: "Gateway", group: 1, ip: "192.168.1.1" },
      { id: "Server-1", group: 2, ip: "192.168.1.10" },
      { id: "Server-2", group: 2, ip: "192.168.1.11" },
      { id: "Workstation-A", group: 3, ip: "192.168.1.100" },
      { id: "Workstation-B", group: 3, ip: "192.168.1.101" },
      { id: "Workstation-C", group: 3, ip: "192.168.1.102" },
      { id: "Printer", group: 4, ip: "192.168.1.200" },
      { id: "Unknown-Device", group: 5, ip: "192.168.1.250" },
    ];

    const links: Link[] = [
      { source: "Gateway", target: "Server-1", value: 10 },
      { source: "Gateway", target: "Server-2", value: 10 },
      { source: "Gateway", target: "Printer", value: 1 },
      { source: "Server-1", target: "Workstation-A", value: 5 },
      { source: "Server-1", target: "Workstation-B", value: 5 },
      { source: "Server-2", target: "Workstation-C", value: 5 },
      { source: "Workstation-A", target: "Unknown-Device", value: 1 },
    ];

    const width = 800;
    const height = 600;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Links
    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    // Nodes
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 10)
      .attr("fill", (d: any) => color(d.group))
      // @ts-ignore
      .call(drag(simulation));

    // Labels
    const labels = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .style("fill", "#ccc")
        .style("font-size", "12px")
        .text((d: any) => d.id);

    // Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    // Drag behavior
    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="h4" gutterBottom>Network Topology</Typography>
      <Paper sx={{ width: '100%', height: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#0f172a' }}>
        <svg ref={svgRef} width="100%" height="100%" style={{ maxHeight: 600 }}></svg>
      </Paper>
    </Box>
  );
};

export default TopologyGraph;
