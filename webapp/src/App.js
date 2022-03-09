import React from 'react';
import Graph from './Graph';
import { getData } from './Util'
import './App.css';

function App() {
    // return (
    //     <div className="App">
    //         <header className="App-header">
    //             <div className="Graph">
    //                 <Graph />
    //             </div>
    //         </header>
    //     </div>
    // );
    const data = getData();
    return (
        <div className="App">
            <div className="Graph">
                <Graph data={data}/>
            </div>
        </div>
    );
}

export default App;
