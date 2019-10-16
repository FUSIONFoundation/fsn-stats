'use strict'

//const autoBind = require('auto-bind');
const db = require('../db');


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
                    const node_text = 'nodes(id, utctime, block, stats, info) VALUES($1, $2, $3, $4, $5)';
                    let query = {
                        text: `INSERT INTO ${node_text}`,
                        values: record
                    }
                    //console.log(record);
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
                    let query = `DELETE FROM nodes WHERE id = '${id}'`;
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
                    (SELECT id FROM nodes WHERE utctime < now() - INTERVAL '${olderThanHours} hours')`;
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
                    let block_text ='blocks(utctime, blocks) VALUES($1, $2)';
                    
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
                        
                        query = {
                                text: `INSERT INTO ${block_text}`,
                                values: record
                            }
                            console.log(`Inserting blocks...`);
                            client.query(query)
                            .then(res => {
                                console.log(`Inserted`);
                                client.release();
                                resolve(1);
                                return;
                            })
                            .catch(err => {
                                client.release();
                                console.error(`Query INSERT INTO blocks: Postgres failed`);
                                reject(err);
                                return;
                            });
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
                        
                    let chart_text ='charts(utctime, charts) VALUES($1, $2)';
                        
                    query = {
                                text: `INSERT INTO ${chart_text}`,
                                values: record
                            }
                            console.log(`Inserting charts...`);
                            client.query(query)
                            .then(res => {
                                console.log(`Inserted`);
                                client.release();
                                resolve(1);
                                return;
                            })
                            .catch(err => {
                                client.release();
                                console.error(`Query INSERT INTO charts: Postgres failed`);
                                reject(err);
                                return;
                            });
                        
                }
                
            })
        });
    }
    
}

module.exports = Populate;
