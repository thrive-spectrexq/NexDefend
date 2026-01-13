import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { getTopology } from '@/api/topology';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

const TopologyGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<{ nodes: Node[]; links: Link[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTopology();
        // Validation to ensure D3 doesn't crash on empty/malformed data
        if (response && Array.isArray(response.nodes) && Array.isArray(response.links)) {
            // Create deep copies because D3 mutates objects directly
            setData({
                nodes: response.nodes.map((n: any) => ({ ...n })),
                links: response.links.map((l: any) => ({ ...l }))
            });
        } else {
            setError("Invalid topology data received from server.");
        }
      } catch (err) {
        console.error("Topology fetch error:", err);
        setError("Failed to load network topology.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Render D3 Graph
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = 800;
    const height = 600;
    const { nodes, links } = data;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 12) // Slightly larger nodes
      .attr("fill", (d: any) => color(String(d.group)))
      // @ts-ignore
      .call(drag(simulation));

    const labels = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("dx", 15)
        .attr("dy", ".35em")
        .style("fill", "#e2e8f0") // Lighter text for dark mode
        .style("font-size", "12px")
        .style("font-family", "Roboto, sans-serif")
        .text((d: any) => d.id);

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
      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }

    return () => { simulation.stop(); };
  }, [data]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">Network Topology</Typography>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', height: 600, bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: 2, overflow: 'hidden' }}>
        {data ? (
           <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}></svg>
        ) : (
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
               <Typography color="text.secondary">No topology data available.</Typography>
           </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TopologyGraph;
