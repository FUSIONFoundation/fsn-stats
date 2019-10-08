//const db = require('../db')

const { Pool } = require('pg');

const pool = new Pool();


pool.connect()
    .then(client => {
        return client
            .query('SELECT * FROM users WHERE id = $1', [1])
            .then(res => {
                client.release()
                console.log(res.rows[0])
            })
        .catch(e => {
            client.release()
            console.log(err.stack)
        })
    })
