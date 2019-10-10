'use strict'

const db = require('../db');


class Populate  {
    constructor() {
    this._items = [];
    this._callback = null;
    this.db = db;
    return this;
    }


    nodePutDb(record) {
        db.getClient((err,client,done) => {
            if (err) {
                console.log(err.stack);
                return console.error('Could not connect to postgres', err);
            }
            else {
                const query = {
                    text: `INSERT INTO nodes(id, date, block, mining, syncing, peers, myTickets, uptime, latency)  VALUES($1, $2,   $3,    $4,     $5,      $6,    $7,        $8,     $9     )`,
                    values: record
                }
                client.query(query)
                    .then(res => {
                        client.release()
                        console.log(res.rows[0])
                    })
                    .catch(err => {
                        client.release()
                        console.log(err.stack)
                        console.error(`INSERT INTO Query Postgres failed`)
                    });
            }
        });
    }
}

module.exports = Populate;
