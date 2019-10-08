//const db = require('../db')

const { Pool } = require('pg');

const pool = new Pool({
    user:       'postgres',
    host:       'localhost',
    port:       5432,
    database:   'myfusiondatabase',
    password:   process.env.SQLPASS
});


pool.connect()
    .then(client => {
        return client
            .query('SELECT * FROM users WHERE id = $1', [1])
            .then(res => {
                client.release()
                console.log(res.rows[0])
            })
        .catch(err => {
            client.release()
            console.log(err.stack)
        })
    })
