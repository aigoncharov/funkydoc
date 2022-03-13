import { useD3 } from "./hooks/useD3";
import React from "react";
import {
  colorDefault, colorIncoming, colorOutgoing, colorNone,
  createLinks, createNodes, getNodeColor, overedImpl, outedImpl, setPersist, flipPersist
} from "./Util";
import * as d3 from "d3";

function Graph(props) {
  const data = props.data;
  const nodes = createNodes(data);
  const links = createLinks(data);

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
      function createMarkers(color) {
        svg
          .append("defs")
          .selectAll("marker")
          .data(links)
          .join("marker")
          .attr("id", (d) => `arrow-${d.source.id}+${d.target.id}+${color}`)
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 15)
          .attr("refY", -0.5)
          .attr("markerWidth", 4)
          .attr("markerHeight", 4)
          .attr("orient", "auto")
          .append("path")
          .attr("fill", color)
          .attr("d", "M0,-5L10,0L0,5");
      }

      for (const color of [colorDefault, colorIncoming, colorOutgoing]){
        createMarkers(color)
      }

      const link = svg
        .append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("stroke", colorDefault)
        .attr("marker-end", (d) => `url(#arrow-${d.source.id}+${d.target.id}+${colorDefault})`);

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

      node
      .on("mouseover", overedImpl)  // highlight relevant paths
      .on("mouseout", outedImpl)    // return to normal
      .on("click", flipPersist)     // persist highlights if clicked
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
