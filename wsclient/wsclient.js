const Populate = require('../db_methods/populate');

const pop = new Populate();


let WebSocketClient = require('websocket').w3cwebsocket;

var reconnectInterval = 1000 * 10;

let info = null;

var connect = function(){

    //const wsclient = new WebSocketClient('ws://127.0.0.1:3000/primus');
    const wsclient = new WebSocketClient('wss://node.fusionnetwork.io/primus');

    olderThanHours = 3;    // Remove nodes inactive for olderThanHours hours
    let timerId = 0;
    let blockNo = -1;
    let timestamp = 0;
    let epoch0time = new Date(0);
    utctime = epoch0time.toISOString();


    wsclient.onopen = () => {
        console.log(new Date(), ` WebSocket Client Connected`);
    };


    wsclient.onerror = function() {
        console.log(new Date(),` Connection Error`);
    };

    wsclient.onmessage = async(data) => {

        //console.log(data.data);

        now = new Date();

        console.log(now, ` Received:  ${data.data.length} bytes`);
        let myData = JSON.parse(data.data);
        let currentAction = myData.action;
        console.log(`Current action is => ${currentAction}`);


        if (currentAction === 'init') {
            console.log(`Init. => ${myData.data[0]}`);
            info = JSON.stringify(myData.data[0]);
        };

        if (myData.data.id && currentAction === 'block') {
            console.log(`Block No. => ${myData.data.block.number}`);
            blockNo = myData.data.block.number;
            timestamp = myData.data.block.timestamp;
            utctime = new Date(timestamp*1000).toISOString();    // UTC

            blockdata = JSON.stringify(myData.data.block);

            //console.log(`Height => ${myData.data.height}`);
            let recordBlock = [
                utctime,
                blockdata
            ]
            /*pop.blockPostDb(recordBlock)
            .then( res => {
                if (res == 0) {
                    console.log(`Block data write finished`);
                }
            })
            .catch( err => {
                console.log(err.stack);
            })*/

        }  // End of currentAction === 'blocks'


        if (myData.data.id && currentAction === 'stats') {
            console.log(`User ID => ${myData.data.id}`);
            let statdata = JSON.stringify(myData.data);
            let recordStats = [
                myData.data.id,
                utctime,
                blockNo,
                statdata,
                info
            ];
            //console.log(recordStats);

            
            //await pop.nodeDeleteDb(recordStats[0])
            pop.nodeUpdateDb(recordStats)
            .then((res) => {
                //console.log(res);
                if (res.rowCount == 0) {
                    pop.nodePostDb(recordStats)
                    .then( res => {
                        if (res == 1) {
                            //console.log(`Posted`);
                        }
                        else {
                            console.log(`Unidentified return from nodePostDb = ${res}`);
                        }
                    })
                    .catch( err => {
                        //console.log(err.stack);
                        console.log(err.detail);
                        return;
                    })
                }
            })
            .catch( err => {
                //console.log(err);
                console.error(err.stack);
            })

        }    // End of currentAction === 'stats'

        else if (currentAction === 'charts') {
            let chartdata = JSON.stringify(myData.data);

            let recordCharts = [
                utctime,
                chartdata
            ]
            pop.chartPostDb(recordCharts)
            .then( res => {
                if (res == 0) {
                    console.log(`Chart data write finished`);
                }
            })
            .catch( err => {
                console.log(err.stack);
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
