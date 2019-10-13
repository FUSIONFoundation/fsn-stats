const Populate = require('../db_methods/populate');

const pop = new Populate();


let WebSocketClient = require('websocket').w3cwebsocket;

var reconnectInterval = 1000 * 10;

var connect = function(){

    //const wsclient = new WebSocketClient('ws://127.0.0.1:3000/primus');
    const wsclient = new WebSocketClient('wss://node.fusionnetwork.io/primus');
    
    olderThanHours = 3;    // Remove nodes inactive for olderThanHours hours
    var timerId = 0;
    var blockNo = -1;

    wsclient.onopen = () => {
        console.log(new Date(), ` WebSocket Client Connected`);
    };


    wsclient.onerror = function() {
        console.log(new Date(),` Connection Error`);
    };

    wsclient.onmessage = function(data) {
        
        now = new Date();
        
        console.log(now, ` Received:  ${data.data.length} bytes`);
        let myData = JSON.parse(data.data);
        let currentAction = myData.action;
        console.log(`Current action is => ${currentAction}`);
        if (myData.data.id && currentAction === 'block') {
            console.log(`Block No. => ${myData.data.block.number}`);
            blockNo = myData.data.block.number;
        };
        if (myData.data.id && currentAction === 'stats') {
            //console.log(`User ID => ${myData.data.id}, Tickets => ${myData.data.stats.myTicketNumber}, Peers => ${myData.data.stats.peers}`);
            if (myData.data.stats.myTicketNumber == 'N/A') {
                myticketno = -1;
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
                myData.data.stats.uptime,
                parseInt(myData.data.stats.latency),
                myticketno
            ];
            //console.log(record);
            pop.nodeGetDb(myData.data.id)
            .then( res => {
                if (res === 0) {
                    console.log(`User id '${record[0]}' not found`)
                    pop.nodePostDb(record)
                    .then( res => {
                        if (res == -1) {
                            console.log(`Ignoring INSERT request, updating instead`);
                            pop.nodeUpdateDb(record)
                            .then( res => {
                                console.log(`Updated row ${myData.data.id}`)
                            })
                            .catch( err => {
                                console.log(err.stack);
                            })
                        }
                        else {
                            console.log(`Posted initial row for '${record[0]}'`);
                        }
                    })
                    .catch( err => {
                        console.log(err.stack);
                    })
                }
                else {
                    //console.log(res);
                    pop.nodeUpdateDb(record)
                    .then( res => {
                        console.log(`Updated row ${myData.data.id}`)
                    })
                    .catch( err => {
                        console.log(err.stack);
                    })
                }
            })
            .catch( err => {
                console.error(`Error = ${err}`)
                pop.nodePostDb(record)
                .then( res => {
                    console.log(`Inserted a new record`);
                })
                .catch( err => {
                    console.log(err.stack);
                })
            })
        }
    };
    
    function removeOldNodes(olderThanHours) {
        var checkTime = 1*60*1000;    // 1 minute
        setTimeout((olderThanHours) => {
            removeOldNodes(olderThanHours);
            pop.nodeDeleteOldNodes(this.olderThanHours)
            .then( res => {
                console.log(`Removed old nodes ${res}`);
            })
            .catch( err => {
                console.log(err.stack);
            })
        }, checkTime)
    }

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
    
    removeOldNodes(olderThanHours);
    keepAlive();
};

connect();
