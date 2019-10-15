'use strict'

//const autoBind = require('auto-bind');
const db = require('../db');

const node_text = 'nodes(id, datetime, block, mining, syncing, peers, uptime, latency, tickets) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)';




class Populate  {
    constructor() {
        //this.nodeUpdateDb = nodeUpdateDb;
    }

    
    nodeGetDb(id) {
        return new Promise(function(resolve, reject) {
            db.getClient((err,client,done) => {
                if (err) {
                    console.log(err.stack);
                    console.error('Could not connect to postgres', err);
                    reject(err);
                }
                else {
                    const query = `SELECT * FROM nodes WHERE id = '${id}'`;
                    client.query(query)
                        .then(res => {
                            client.release();
                            if (res.rowCount === 0) {
                                resolve(res.rowCount)
                            }
                            else {
                                //console.log(res);
                                resolve(res.rows[0]);
                            }
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query SELECT node: Postgres failed`);
                             reject(err);
                        });
                }
            });
        });
    }
    

    nodePostDb(record) {
        return new Promise(function(resolve, reject) {
            db.getClient((err,client,done) => {
                if (err) {
                    console.log(err.stack);
                    console.error('Could not connect to postgres', err);
                    reject(err);
                    return;
                }
                else {
                    let query = `SELECT id FROM nodes WHERE id = '${record[0]}'`;
                    client.query(query)
                    .then(res => {
                        if (res.rowCount === 1) {
                            console.log(`Record for ${record[0]} already exists, updating it...`);

                            let datenow = record[1].toISOString()
                    
                            query = 
                                `UPDATE nodes SET   
                                    datetime    = '${datenow}',
                                    block       = ${record[2]},
                                    mining      = ${record[3]},
                                    syncing     = ${record[4]},
                                    peers       = ${record[5]},
                                    uptime      = ${record[6]},
                                    latency     = ${record[7]},
                                    tickets     = ${record[8]} WHERE id = '${record[0]}'`;
                            //console.log(query);
                            client.query(query)
                            .then(res => {
                                console.log(`Updated`);
                                client.release();
                                resolve(1);
                                return;
                            })
                            .catch(err => {
                                client.release();
                                console.error(`Query UPDATE node: Postgres failed`);
                                reject(err);
                                return;
                            });
                        }
                        else if (res.rowCount === 0) {
                            query = {
                                text: `INSERT INTO ${node_text}`,
                                values: record
                            }
                            console.log(`Inserting ${record[0]}...`);
                            client.query(query)
                            .then(res => {
                                console.log(`Inserted`);
                                client.release();
                                resolve(1);
                                return;
                            })
                            .catch(err => {
                                client.release();
                                console.error(`Query INSERT INTO node: Postgres failed`);
                                reject(err);
                                return;
                            });
                        }
                    })
                    .catch(err => {
                        client.release();
                        console.error(`Query SELECT node: Postgres failed`);
                        reject(err);
                        return;
                    })
                    
                }
            });
        });
    }
    
    
    nodeUpdateDb(record) {
        return new Promise(function(resolve, reject) {
            db.getClient((err,client,done) => {
                if (err) {
                    console.log(err.stack);
                    console.error('Could not connect to postgres', err);
                    reject(err);
                    return;
                }
                else {
                    var datenow = record[1].toISOString()
                    
                    const query = 
                         `UPDATE nodes SET   
                             datetime    = '${datenow}',
                             block       = ${record[2]},
                             mining      = ${record[3]},
                             syncing     = ${record[4]},
                             peers       = ${record[5]},
                             uptime      = ${record[6]},
                             latency     = ${record[7]},
                             tickets     = ${record[8]} WHERE id = '${record[0]}'`;
                    //console.log(query);
                    client.query(query)
                        .then(res => {
                            client.release();
                            resolve(1);
                            return;
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query UPDATE node: Postgres failed`);
                             reject(err);
                             return;
                        });
                }
            });
        });
    }
  
      
    initUpdateDb(record) {
        return new Promise(function(resolve, reject) {
            db.getClient((err,client,done) => {
                if (err) {
                    console.log(err.stack);
                    console.error('Could not connect to postgres', err);
                    reject(err);
                    return;
                }
                else {
                    var datenow = record[1].toISOString()
                    
                    const query = 
                         `UPDATE nodes SET info  = ${record[1]} WHERE id = '${record[0]}'`;
                    //console.log(query);
                    client.query(query)
                        .then(res => {
                            client.release();
                            resolve(1);
                            return;
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query UPDATE init: Postgres failed`);
                             reject(err);
                             return;
                        });
                }
            });
        });
    }
  
  
  
  
  
    nodeDeleteDb(id) {
        return new Promise(function(resolve, reject) {
            db.getClient((err,client,done) => {
                if (err) {
                    console.error('Could not connect to postgres', err);
                    reject(err);
                }
                else {
                    query = `DELETE FROM nodes WHERE id = '${id}'`;
                    //console.log(query);
                    client.query(query)
                        .then(res => {
                            client.release();
                            resolve(res.rows[0]);
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query DELETE node: Postgres failed`);
                             reject(err);
                        });
                }
            });
        });
    }
    
    nodeDeleteOldNodes(olderThanHours) {
        return new Promise(function(resolve, reject) {
            db.getClient((err,client,done) => {
                if (err) {
                    console.error('Could not connect to postgres', err);
                    reject(err);
                }
                else {
                    const query = `DELETE FROM nodes WHERE id IN 
                    (SELECT id FROM nodes WHERE datetime < now() - INTERVAL '${olderThanHours} hours')`;
                    //console.log(query);
                    client.query(query)
                        .then(res => {
                            client.release();
                            resolve(res.rows);
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query DELETE old nodes : Postgres failed`);
                             reject(err);
                        });
                }
            });
        });
    }
    
    blockPostDb(record) {
        return new Promise(function(resolve, reject) {
            db.getClient((err,client,done) => {
                if (err) {
                    console.log(err.stack);
                    console.error('Could not connect to postgres', err);
                    reject(err);
                }
                else {
                    let block_text ='blocks(height, blocktime, difficulty, transactions, gasspending, gaslimit, ticketnumber) VALUES($1, $2, $3, $4, $5, $6, $7)';
                    let block_values;
                    
                    let query = `DELETE FROM blocks`;
                    client.query(query)
                        .then(res => {
                            //console.log('Overwriting old block database');
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query DELETE blocks: Postgres failed`);
                             reject(err);
                        });
                    
                    
                    for (let i=0; i<record.height.length; i++) {
                        //console.log(`i = ${i}`);
                        block_values = [record.height[i], record.blocktime[i], record.difficulty[i], record.transactions[i], record.gasSpending[i], record.gasLimit[i], record.ticketNumber[i]];

                        query = {
                            text: `INSERT INTO ${block_text}`,
                            values: block_values
                        }
                        //console.log(query);
                        client.query(query)
                        .then(res => {
                            //console.log(`Written ${i}`);
                            if (i == record.height.length-1) {
                                //console.log(`Finished this block write`);
                                client.release();
                                return resolve(0);
                            }
                        })
                        .catch(err => {
                            client.release();
                            console.error(`Query INSERT INTO block: Postgres failed`);
                            return reject(err);
                        })
                    }
                }
            });
        });
    }
    
    chartPostDb(record) {
        return new Promise(function(resolve, reject) {
            db.getClient((err,client,done) => {
                if (err) {
                    console.log(err.stack);
                    console.error('Could not connect to postgres', err);
                    reject(err);
                }
                else {
                    
                    let query = `DELETE FROM charts`;
                    client.query(query)
                    .then(res => {
                        //console.log('Overwriting old block database');
                    })
                    .catch(err => {
                        client.release();
                        console.error(`Query DELETE charts: Postgres failed`);
                        reject(err);
                    })
                        
                    let chart_text ='charts(x, dx, y, frequency, cumulative, cumpercent) VALUES($1, $2, $3, $4, $5, $6)';
                    let chart_values;
                        
                    for(let i=0;i<record.x.length;i++) {
                        chart_values = [record.x[i], record.dx[i], record.y[i], record.frequency[i], record.cumulative[i], record.cumpercent[i]];
                        query = {
                            text: `INSERT INTO ${chart_text}`,
                            values: chart_values
                        }
                        //console.log(query);
                        client.query(query)
                        .then(res => {
                            //console.log(`Written ${i}`);
                            if (i == record.x.length-1) {
                                //console.log(`Finished this block write`);
                                client.release();
                                return resolve(0);
                            }
                        })
                        .catch(err => {
                            client.release();
                            console.error(`Query INSERT INTO chart: Postgres failed`);
                            return reject(err);
                        })
                    }
                        
                }
                
            })
        });
    }
    
}

module.exports = Populate;
