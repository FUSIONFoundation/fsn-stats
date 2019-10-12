'use strict'

//const autoBind = require('auto-bind');
const db = require('../db');

const node_text = 'nodes(id, datetime, block, mining, syncing, peers, uptime, latency, "myTickets") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)';




class Populate  {
    constructor() {

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
                    const query = `SELECT id FROM nodes WHERE id = '${id}'`;
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
                             console.error(`Query SELECT : Postgres failed`);
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
                }
                else {
                    const query = {
                        text: `INSERT INTO ${node_text}`,
                        values: record
                    }
                    //console.log(query);
                    client.query(query)
                        .then(res => {
                            client.release();
                            resolve(res.rows[0]);
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query INSERT INTO : Postgres failed`);
                             reject(err);
                        });
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
                }
                else {
                    var datenow = record[1].toISOString()
                    var ticketString = ''; 
                    record[8].forEach(function(value) {
                        ticketString = ticketString + ' ' + value.toString();
                    })
                    
                    const query = 
                         `UPDATE nodes SET   
                             datetime    = '${datenow}',
                             block       = ${record[2]},
                             mining      = ${record[3]},
                             syncing     = ${record[4]},
                             peers       = ${record[5]},
                             uptime      = ${record[6]},
                             latency     = ${record[7]},
                             "myTickets" = '{${ticketString}}' WHERE id = '${record[0]}'`;
                    //console.log(query);
                    client.query(query)
                        .then(res => {
                            client.release();
                            resolve(res.rows[0]);
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query UPDATE : Postgres failed`);
                             reject(err);
                        });
                }
            });
        });
    }
  
  
    nodeDeleteDb(id) {
        return new Promise(function(resolve, reject) {
            db.pool.connect((err,client,done) => {
                if (err) {
                    console.log(err.stack);
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
                             console.error(`Query DELETE : Postgres failed`);
                             reject(err);
                        });
                }
            });
        });
    }
    
}

module.exports = Populate;
