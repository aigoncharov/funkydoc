import processedOut from "./out.json";

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
  if (d.health == "danger") return "red";
  if (d.health == "warn") return "yellow";
  return "white";
}

function getData() {
  return data;
}

export { getData, getNodeColor, createLinks, createNodes };
