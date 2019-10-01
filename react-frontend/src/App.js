import React from 'react';
import logo from './logo.svg';
import './App.css';
import { w3cwebsocket as W3CWebSocket } from "websocket";

const client = new W3CWebSocket('ws://127.0.0.1:5000/primus');

client.onopen = () => {
    console.log('WebSocket Client Connected');
};
client.onmessage = (data) => {
    socketAction(data.data)
};

function socketAction(data)
{
    let action = JSON.parse(data).action;
    let nodeData = JSON.parse(data).data;

    switch(action)
    {
        case "init":
            console.log(action , nodeData);
            break;

        case "add":
            console.log(action , nodeData);
            break;

        case "update":
            console.log(action , nodeData);
            break;

        case "block":
        console.log(action , nodeData);
        break;

        case "pending":
            console.log(action , nodeData);
            break;

        case "stats":
            console.log(action , nodeData);
            break;

        case "info":
            console.log(action , nodeData);
            break;

        case "blockPropagationChart":
            console.log(action , nodeData);
            break;

        case "uncleCount":
            console.log(action , nodeData);
            break;

        case "charts":
            console.log(action , nodeData);
            break;

        case "inactive":
            console.log(action , nodeData);
            break;

        case "latency":
            console.log(action , nodeData);
            break;

        case "client-ping":
            console.log(action , nodeData);
            break;

    }

}

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
