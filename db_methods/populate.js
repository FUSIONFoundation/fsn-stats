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
                             console.error(`Query SELECT node: FAIL ${err}`);
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
                        console.error(`Query INSERT INTO node: FAIL ${err}`);
                        reject(err);
                        return;
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
                    return;
                }
                else {
                    record[1] = record[1].replace('T',' ');
                    record[1] = record[1].replace('Z','');
                    record[1] = record[1].replace('.0','+');
                    //console.log(record[1]);
                    const query =
                         `UPDATE nodes SET utctime     = '${record[1]}', block = ${record[2]}, stats = '${record[3]}', info = '${record[4]}' WHERE id = '${record[0]}'`;
                    //console.log(query);
                    client.query(query)
                        .then(res => {
                            console.log(`Updated ${record[0]}`);
                            client.release();
                            resolve(res);
                            return;
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query UPDATE node: FAIL ${err}`);
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
                             console.error(`Query DELETE node: FAIL ${err}`);
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
                             console.error(`Query DELETE old nodes : FAIL ${err}`);
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
                                console.error(`Query INSERT INTO blocks: FAIL ${err}`);
                                reject(err);
                                return;
                            });
                        })
                        .catch(err => {
                             client.release();
                             console.error(`Query DELETE blocks:  FAIL ${err}`);
                             reject(err);
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
                            console.error(`Query INSERT INTO charts: FAIL ${err}`);
                            reject(err);
                            return;
                        });
                    })
                    .catch(err => {
                        client.release();
                        console.error(`Query DELETE charts:  FAIL ${err}`);
                        reject(err);
                    })



                }

            })
        });
    }

}

module.exports = Populate;
