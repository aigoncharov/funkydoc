import React from 'react';
import './App.css'
import * as d3 from "d3";
import {overedImpl, outedImpl, setPersist} from "./Util";

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
    const health = node.health.status === "warn" ? "low connectivity" : "isolated";

    function navigateToNode() {
        // find coordinates to navigate to
        const selectedNode = d3.selectAll('svg g').filter(e => e?.title === node.title)
        const coordinates = selectedNode.attr("transform");
        const commaIdx = coordinates.indexOf(",")
        const x = parseFloat( coordinates.substring(10, commaIdx) )
        const y = parseFloat( coordinates.substring(commaIdx+1, coordinates.indexOf(")")) )

        // navigate to coordinates
        const svg = d3.select('svg')
        const transform = d3.zoomIdentity
            .scale(0.75)
            .translate(-x, -y);
        svg.call(d3.zoom().transform, transform);

        // trigger wheel event on svg to update zoom state on all d3 elements
        const wheel = new WheelEvent("wheel", {
            bubbles: true,
            canceable: true,
            view: window,
            wheelDeltaY: 1,
        })
        const svgElement = document.getElementById("svg")
        svgElement.dispatchEvent(wheel)
    }

    function highlightNode() {
        setPersist(false);      // stop persisting any highlights if any

        const selectedNode = d3.selectAll('svg g')
            .filter(e => e?.title === node.title)
        selectedNode
            .attr("font-weight", "bold")

        overedImpl(null, node);
    }

    function unhighlightNode() {
        const selectedNode = d3.selectAll('svg g')
            .filter(e => e?.title === node.title)
        selectedNode
            .attr("font-weight", null)

        outedImpl(null, node);
    }

    return (
        <div
            key={node.id}
            className="SidebarItem"
            onClick={navigateToNode}
            onMouseEnter={highlightNode}
            onMouseLeave={unhighlightNode}
        >
            <h3 className="SidebarItemTitle">{title}</h3>
            <h5 className="SidebarItemSubtitle">{health}</h5>
        </div>
    );
}

export default Sidebar;
