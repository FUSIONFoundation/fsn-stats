'use strict'

const db = require('../db');

//const node_text = 'nodes(id, datetime, block, mining, syncing, peers, uptime, latency, tickets) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)';




class Retrieve  {
    constructor() {

        
    }

    
    nodeGetAllDb() {
        return new Promise(function(resolve, reject) {
            db.getClient((err,client,done) => {
                if (err) {
                    console.log(err.stack);
                    console.error('Could not connect to postgres', err);
                    reject(err);
                }
                else {
                    const query = `SELECT id, utctime, block, stats, info FROM nodes`;
                    client.query(query)
                        .then(res => {
                            client.release();
                            let json_data = JSON.stringify(res.rows);
                            resolve(json_data)
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query SELECT nodeGetAllDb: Postgres failed`);
                             reject(err);
                        });
                }
            });
        });
    }
    
    blocksGetAllDb() {
        return new Promise(function(resolve, reject) {
            db.getClient((err,client,done) => {
                if (err) {
                    console.log(err.stack);
                    console.error('Could not connect to postgres', err);
                    reject(err);
                }
                else {
                    const query = `SELECT utctime, blocks FROM blocks`;
                    client.query(query)
                        .then(res => {
                            client.release();
                            let json_data = JSON.stringify(res.rows);
                            resolve(json_data)
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query SELECT blocksGetAllDb: Postgres failed`);
                             reject(err);
                        });
                }
            });
        });
    }
    
    chartsGetAllDb() {
        return new Promise(function(resolve, reject) {
            db.getClient((err,client,done) => {
                if (err) {
                    console.log(err.stack);
                    console.error('Could not connect to postgres', err);
                    reject(err);
                }
                else {
                    const query = `SELECT utctime, charts FROM charts`;
                    client.query(query)
                        .then(res => {
                            client.release();
                            let json_data = JSON.stringify(res.rows);
                            resolve(json_data)
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query SELECT chartsGetAllDb: Postgres failed`);
                             reject(err);
                        });
                }
            });
        });
    }
    
    
}

module.exports = Retrieve;
