//var _ = require('lodash');
//var logger = require('./lib/utils/logger');
//var chalk = require('chalk');
//var http = require('http');
var _ = require('lodash');
// Init WS SECRET
var WS_SECRET;

if( !_.isUndefined(process.env.WS_SECRET) && !_.isNull(process.env.WS_SECRET) )
{
    if( process.env.WS_SECRET.indexOf('|') > 0 )
    {
        WS_SECRET = process.env.WS_SECRET.split('|');
    }
    else
    {
        WS_SECRET = [process.env.WS_SECRET];
    }
}
else
{
    try {
        var tmp_secret_json = require('./ws_secret.json');
        WS_SECRET = _.values(tmp_secret_json);
    }
    catch (e)
    {
        console.error("WS_SECRET NOT SET!!!");
    }
}

var banned = require('./lib/utils/config').banned;


let WebSocketClient = require('websocket').w3cwebsocket;

const client = new WebSocketClient('ws://127.0.0.1:3000/primus');

client.onopen = () => {
    console.log('WebSocket Client Connected');
};

client.onerror = function() {
    console.log('Connection Error');
};

client.onmessage = function(data) {
    console.log("Received: " + data.data);
};

client.onclose = function() {
    console.log('Client Closed');
};
 

