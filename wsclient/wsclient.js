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
        
        //console.log(data.data);
        
        now = new Date();
        
        console.log(now, ` Received:  ${data.data.length} bytes`);
        let myData = JSON.parse(data.data);
        let currentAction = myData.action;
        console.log(`Current action is => ${currentAction}`);
        
        if (myData.data.id && currentAction === 'block') {
            console.log(`Block No. => ${myData.data.block.number}`);
            blockNo = myData.data.block.number;
        };
        
        if (currentAction === 'init') {
            console.log(`Init. => ${myData.data[0]}`);
            record = [
                myData.data[0].id,
                JSON.stringify(myData.data[0])
            ]
            pop.initUpdateDb(record)
            .then( res => {
                if (res == 1) {
                    console.log(`Update init record '${record[0]}'`);
                }
                else {
                    console.log(`Unidentified return from initUpdateDb = ${res}`);
                }
            })
            .catch( err => {
                console.log(err.stack);
                return;
            })
        };
        
        if (myData.data.id && currentAction === 'stats') {
            console.log(`User ID => ${myData.data.id}`);
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
            
            pop.nodePostDb(record)
            .then( res => {
                if (res == 1) {
                    //console.log(`Posted`);
                }
                else {
                    console.log(`Unidentified return from nodePostDb = ${res}`);
                }
            })
            .catch( err => {
                console.log(err.stack);
                return;
            })
                
        }    // End of currentAction === 'stats'
        
        else if (currentAction === 'charts') {
            //console.log(`Height => ${myData.data.height}`);
            record = {
                height:         myData.data.height,
                blocktime:      myData.data.blocktime,
                difficulty:     myData.data.difficulty,
                transactions:   myData.data.transactions,
                gasSpending:    myData.data.gasSpending,
                gasLimit:       myData.data.gasLimit,
                ticketNumber:   myData.data.ticketNumber
            }
            pop.blockPostDb(record)
            .then( res => {
                if (res == 0) {
                    console.log(`Block data write finished`);
                }
            })
            .catch( err => {
                console.log(err.stack);
            })
            
                let histogram = myData.data.propagation.histogram; 
                //console.log(histogram);
                var x=[];var dx=[];var y=[];var frequency= [];var cumulative=[];var cumpercent=[];
                for(let i=0;i<histogram.length;i++) {
                    x.push(histogram[i].x);
                    dx.push(histogram[i].dx);
                    y.push(histogram[i].y);
                    frequency.push(histogram[i].frequency);
                    cumulative.push(histogram[i].cumulative);
                    cumpercent.push(histogram[i].cumpercent);
                }
                
                record = {
                    x:              x,
                    dx:             dx,
                    y:              y,
                    frequency:      frequency,
                    cumulative:     cumulative,
                    cumpercent:     cumpercent
                }
                //console.log(record);
                pop.chartPostDb(record)
                .then( res => {
                    if (res == 0) {
                        console.log(`Chart data write finished`);
                    }
                })
                .catch( err => {
                    console.log(err.stack);
                })
        
        
        }  // End of currentAction === 'charts' 
        
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
