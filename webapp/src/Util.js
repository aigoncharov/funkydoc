
const data = [
    {
        id: "1",
        title: "getting-started",
        edgesIn: [],
        edgesOut: ["2", "3"],
    },
    {
        id: "2",
        title: "getting-started/types-in-python",
        edgesIn: ["1"],
        edgesOut: [],
    },
    {
        id: "3",
        title: "features",
        edgesIn: ["1", "3"],
        edgesOut: ["3"],
    },
    {
        id: "4",
        title: "querying-pyre",
        edgesIn: [],
        edgesOut: [],
    },
    {
        id: "5",
        title: "errors",
        edgesIn: [],
        edgesOut: ["6", "7"],
    },
    {
        id: "6",
        title: "errors/debugging/",
        edgesIn: ["5"],
        edgesOut: ["8", "9"],
    },
    {
        id: "7",
        title: "errors/deployment/",
        edgesIn: ["5"],
        edgesOut: ["10"],
    },
    {
        id: "8",
        title: "errors/debugging/error-types",
        edgesIn: ["6"],
        edgesOut: ["9"],
    },
    {
        id: "9",
        title: "errors/debugging/fixme-errors",
        edgesIn: ["8", "5"],
        edgesOut: [],
    },
    {
        id: "10",
        title: "errors/deployment/upgrading-binary",
        edgesIn: ["7"],
        edgesOut: [],
    },
]

function createLinks() {
    return data.flatMap(
        docNode => docNode.edgesOut.map(
            target => ({
                source: docNode.id,
                target: target,
                type: "hyperlink"
            })
        )
    )
}

function createNodes() {
    return Array.from(
        new Set(
            data.map(
                docNode => ({
                    id: docNode.id,
                    title: docNode.title,
                    connections:
                        docNode.edgesIn.filter(x => x !== docNode.id).length +
                        docNode.edgesOut.filter(x => x !== docNode.id).length
                })
            )
        )
    )

}

function getNodeColor(d) {
    if (d.connections == 0)
        return "red"
    if (d.connections < 2 || d.connections > 3)
        return "yellow"
    return "white"
}

function getData() {
    return data;
}

export { getData, getNodeColor, createLinks, createNodes };
