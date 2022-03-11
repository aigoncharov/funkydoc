import React from 'react';
import './App.css'
import * as d3 from "d3";

function Sidebar(props) {
    const suspiciousNodes = props.data.filter(node => node.health.status !== "success")
    const sidebarItems = suspiciousNodes.map(node => SidebarItem(node));

    return(
        <div className="SidebarRoot">
            {sidebarItems}
        </div>
    );
}


const SidebarItem = node => {
    const title = node.title;

    function navigateToNode() {
        // find coordinates to navigate to
        const selectedNode = d3.selectAll('svg g').filter(e => e?.title === node.title)
        const coordinates = selectedNode.attr("transform");
        const commaIdx = coordinates.indexOf(",")
        const x = parseFloat( coordinates.substring(10, commaIdx) )
        const y = parseFloat( coordinates.substring(commaIdx+1, coordinates.indexOf(")")) )
        console.log(x, y)

        // navigate to coordinates
        const svg = d3.select('svg')
        const transform = d3.zoomIdentity.translate(-x, -y).scale(1);
        console.log("before", svg._groups[0][0].__zoom)
        svg.call(d3.zoom().transform, transform);
        console.log("after", svg._groups[0][0].__zoom)
    }

    function highlightNode() {
        const selectedNode = d3.selectAll('svg g').filter(e => e?.title === node.title)
        selectedNode
            .attr("stroke", "red")
            .attr("stroke-width", 0.5)
    }

    function unhighlightNode() {
        const selectedNode = d3.selectAll('svg g').filter(e => e?.title === node.title)
        selectedNode
            .attr("stroke", "black")
            .attr("stroke-width", 0.1)
    }

    return (
        <div
            key={node.id}
            className="SidebarItem"
            onClick={navigateToNode}
            onMouseEnter={highlightNode}
            onMouseLeave={unhighlightNode}
        >
            {title}
        </div>
    );
}

export default Sidebar;
