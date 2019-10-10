const Populate = require('../db_methods/populate');

const pop = new Populate();


let WebSocketClient = require('websocket').w3cwebsocket;

var reconnectInterval = 1000 * 10;

var connect = function(){

    const wsclient = new WebSocketClient('ws://127.0.0.1:3000/primus');
    var timerID = 0;
    var blockNo = -1;

    wsclient.onopen = () => {
        console.log(new Date(), ' WebSocket Client Connected');
    };


    wsclient.onerror = function() {
        console.log(new Date(),' Connection Error');
    };

    wsclient.onmessage = function(data) {
        now = new Date()
        console.log(now, ' Received: ' + data.data.length, ' bytes');
        let myData = JSON.parse(data.data);
        let currentAction = myData.action;
        console.log(`Current action is => ${currentAction}`);
        if (myData.data.id && currentAction === 'block') {
            console.log(`Block No. => ${myData.data.block.number}`);
            blockNo = myData.data.block.number;
        };
        if (myData.data.id && currentAction === 'stats') {
            console.log(`User ID => ${myData.data.id}, Tickets => ${myData.data.stats.myTicketNumber}, Peers => ${myData.data.stats.peers}`);
            if (myData.data.stats.myTicketNumber == 'N/A') {
                myticketno = [-1];
            }
            else {
                myticketno = myData.data.stats.myTicketNumber;
            }
            record = [
                myData.data.id,
                now,
                blockNo,
                myData.data.stats.mining,
                myData.data.stats.syncing,
                myData.data.stats.peers,
                myticketno,
                myData.data.stats.uptime,
                myData.data.stats.latency
            ];
            pop.nodePutDb(record);
                
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
