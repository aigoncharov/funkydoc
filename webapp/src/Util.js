import * as d3 from "d3";
import processedOut from "./out.json";

const colorDefault = "#1f77b4"
const colorIncoming = "#00f"
const colorOutgoing = "#f00"
const colorNone = "#ccc"
const data = processedOut.docs.nodes;

function createLinks() {
  return data.flatMap((docNode) =>
    docNode.edgesOut.map((target) => ({
      source: docNode.id,
      target: target,
      type: "hyperlink",
    }))
  );
}

function createNodes() {
  return Array.from(
    new Set(
      data.map((docNode) => ({
        id: docNode.id,
        title: docNode.title,
        health: docNode.health.status,
      }))
    )
  );
}

function getNodeColor(d) {
  if (d.health == "danger") return "#fc5776";
  if (d.health == "warn") return "#ffdf62";
  return "white";
}

function getData() {
  return data;
}

let persist = false;

function overedImpl(_, d) {
  if (persist) return;
  d3.select(this).attr("font-weight", "bold");

  const paths = d3.selectAll("path")
  const outgoing = paths.filter(p => p?.source?.id === d.id)
  const incoming = paths.filter(p => p?.target?.id === d.id)
  // highlight paths and grey out non-related paths
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
  const text = d3.selectAll("text")
    .filter(":not(.legend-text)")
    .filter(t => !adjacentNodeText.includes(t?.id) && t?.id !== d.id)
  text.style("visibility", "hidden")

  // hide non-adjacent markers
  const markers = d3.selectAll("marker").filter(m => m?.source?.id !== d.id && m?.target?.id !== d.id)
  markers.style("visibility", "hidden")

  // change outgoing & incoming arrowhead markers
  outgoing.attr("marker-end", (d) => `url(#arrow-${d.source.id}+${d.target.id}+${colorOutgoing})`);
  incoming.attr("marker-end", (d) => `url(#arrow-${d.source.id}+${d.target.id}+${colorIncoming})`);

  // grey out non-related nodes
  const nonrelatedNodes = d3.selectAll('circle')
    .filter(":not(.legend-node)")
    .filter(n => !adjacentNodeText.includes(n?.id) && n?.id !== d.id)
  nonrelatedNodes.attr("opacity", 0.25);
}

function flipPersist() {
  setPersist(!persist);
}

function setPersist(bool) {
  persist = bool;
}

function outedImpl(_, d) {
  if (persist) return;
  d3.selectAll("g").attr("font-weight", null)

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
    .attr("marker-end", (d) => `url(#arrow-${d.source.id}+${d.target.id}+${colorDefault})`);

  d3.selectAll('circle').attr("opacity", 1.0)
}

export {
  colorDefault, colorIncoming, colorOutgoing, colorNone,
  getData, getNodeColor, createLinks, createNodes, overedImpl, outedImpl,
  setPersist, flipPersist
};
