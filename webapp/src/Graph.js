import { useD3 } from "./hooks/useD3";
import React from "react";
import { createLinks, createNodes, getNodeColor } from "./Util";
import * as d3 from "d3";

function Graph(props) {
  const data = props.data;
  const nodes = createNodes(data);
  const links = createLinks(data);

  const colorDefault = "#1f77b4"
  const colorIncoming = "#00f"
  const colorOutgoing = "#f00"
  const colorNone = "#ccc"

  let persist = false;

  const ref = useD3(
    (svg) => {
      const svgElement = svg._groups[0][0].getBoundingClientRect();
      const width = svgElement.width;
      const height = svgElement.height;
      const radius = Math.min(width, height) / 4;

      // the greater the strength the closer the nodes are
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3.forceLink(links).id((d) => d.id)
        )
        .force("charge", d3.forceManyBody().strength(-data.length * 10))
        .force("radial", d3.forceRadial(radius, 0, 0))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

      // Blue arrowhead markers (points to a node)
      svg
        .append("defs")
        .selectAll("marker")
        .data(links)
        .join("marker")
        .attr("id", (d) => `arrow-${d.source.id}+${d.target.id}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -0.5)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", colorDefault)
        .attr("d", "M0,-5L10,0L0,5");

        // Red arrowhead markers
        svg
        .append("defs")
        .selectAll("marker")
        .data(links)
        .join("marker")
        .attr("id", (d) => `arrow-${d.source.id}+${d.target.id}-red`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -0.5)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", colorOutgoing)
        .attr("d", "M0,-5L10,0L0,5");

      const link = svg
        .append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("stroke", colorDefault)
        .attr("marker-end", (d) => `url(#arrow-${d.source.id}+${d.target.id})`);

      const node = svg
        .append("g")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(drag(simulation))

      node
        .append("circle")
        .attr("fill", getNodeColor)
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("r", 4);

      node
        .append("text")
        .attr("x", "-4em")
        .attr("y", "-1em")
        .text((d) => d.title)
        .clone(true)
        .lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 3);


      simulation.on("tick", () => {
        link.attr("d", linkArc);
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

      // zoom & panning
      function handleZoom(e) {
        d3.selectAll("g").attr("transform", e.transform);
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      }
      const zoom = d3.zoom().on("zoom", handleZoom).scaleExtent([0.25, 2]);
      svg.call(zoom);

      // highlight paths on hover in
      function overed(event, d) {
        if (persist) return;
        d3.select(this).attr("font-weight", "bold");

        const paths = d3.selectAll("path")
        const outgoing = paths.filter(p => p?.source?.id === d.id)
        const incoming = paths.filter(p => p?.target?.id === d.id)
        // highlight paths
        paths.attr("stroke", colorNone)
        outgoing
          .raise()
          .attr("stroke", colorOutgoing)
        incoming
          .raise()
          .attr("stroke", colorIncoming)

        // hide non-adjacent node text
        const adjacentNodeText =
          outgoing._groups[0].map(p => p?.__data__?.target?.id)
          .concat(incoming._groups[0].map(p => p?.__data__?.source.id))
        const text = d3.selectAll("text").filter(t => !adjacentNodeText.includes(t.id) && t.id !== d.id)
        text.style("visibility", "hidden")

        // hide non-adjacent markers
        const markers = d3.selectAll("marker").filter(m => m?.source?.id !== d.id && m?.target?.id !== d.id)
        markers.style("visibility", "hidden")

        // change outgoing arrowhead markers to red
        outgoing
          .attr("marker-end", (d) => `url(#arrow-${d.source.id}+${d.target.id}-red)`);
      }

      function click(event, d) {
        persist = !persist;
      }

      // reset on hover out
      function outed(event, d) {
        if (persist) return;
        d3.select(this).attr("font-weight", null);

        const paths = d3.selectAll("path")
        // return to default
        paths.attr("stroke", colorDefault)

        // reveal all node text
        const text = d3.selectAll("text")
        text.style("visibility", "visible")

        // hide non-adjacent markers
        const marker = d3.selectAll("marker")
        marker.style("visibility", "visible")

        // return arrowhead marker colors to default
        paths
          .attr("marker-end", (d) => `url(#arrow-${d.source.id}+${d.target.id})`);
      }

      node
      .on("mouseover", overed)
      .on("mouseout", outed)
      .on("click", click)
    },
    [data.length]
  );

  return (
    <svg
      id="svg"
      ref={ref}
      viewBox="-250 -250 500 500"
      style={{
        height: "100%",
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
        font: "12px sans-serif",
      }}
    ></svg>
  );
}


// arc for edges
function linkArc(d) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `;
}

// mouse drag with physics
const drag = (simulation) => {
  const svgElement = document.getElementById("svg").getBoundingClientRect();
  const heightDelta = svgElement.height / 4;
  const widthDelta = svgElement.width / 4;

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.1).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function validate_boundaries(x, lo, hi) {
    if (x < lo) x = lo;
    if (x > hi) x = hi;
    return x;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    // d.x = validate_boundaries(d.x, -widthDelta, widthDelta);
    // d.y = validate_boundaries(d.y, -heightDelta, heightDelta);
  }

  return d3
    .drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
};

export default Graph;
