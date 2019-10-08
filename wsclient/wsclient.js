
let WebSocketClient = require('websocket').w3cwebsocket;

var reconnectInterval = 1000 * 10;

var connect = function(){

    const wsclient = new WebSocketClient('ws://127.0.0.1:5000/primus');
    var timerID = 0;

    wsclient.onopen = () => {
        console.log(new Date(), ' WebSocket Client Connected');
    };


    wsclient.onerror = function() {
        console.log(new Date(),' Connection Error');
    };

    wsclient.onmessage = function(data) {
        console.log(new Date(), ' Received: ' + data.length, ' bytes');
        let myData = JSON.parse(data.data);
        let currentAction = myData.action;
        console.log(`Current action is => ${currentAction}`);
        if(myData.data.id && currentAction === 'stats'){
            console.log(`User ID => ${myData.data.id}, Tickets => ${myData.data.stats.myTicketNumber}, Peers => ${myData.data.stats.peers}`);
        }
        keepAlive();
    };

    function keepAlive() {
        var timeout = 10000;
        if (wsclient.readyState == wsclient.OPEN) {
            //console.log('Keep alive');
            wsclient.send('');
        }
        timerId = setTimeout(keepAlive, timeout);
    }

    wsclient.onclose = function() {
        console.log(new Date(), ' Client closed, attempting to restart after a delay');
        setTimeout(connect, reconnectInterval);
        console.log(new Date(), ' Websocket will attempt to reopen in ',reconnectInterval/1000,' seconds');
    };

    function cancelKeepAlive() {
        if (timerId) {
            clearTimeout(timerId);
        }
    }
};

connect();
