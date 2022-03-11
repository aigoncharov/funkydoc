import React from 'react';
import Graph from './Graph';
import Sidebar from './Sidebar';
import { getData } from './Util'
import './App.css';

function App() {
    const data = getData();
    return (
        <div className="App">
            {/* <div className="Header">
                <h1>https://www.internalfb.com/intern/staticdocs/pyre/</h1>
            </div> */}
            <div className="Body">
                <div className="Sidebar">
                    <Sidebar data={data}/>
                </div>
                <div className="Graph">
                    <Graph data={data}/>
                </div>
            </div>
        </div>
    );
}

export default App;
