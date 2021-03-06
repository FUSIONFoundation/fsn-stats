const { Pool } = require('pg')

const pool = new Pool({
    user:       'postgres',
    host:       process.env.SQLHOST || 'localhost',
    port:       5432,
    database:   'myfusiondatabase',
    password:   process.env.SQLPASS || 'postgres',
    max:        5
});


 module.exports = {
     query: (text, params, callback) => {
         return pool.query(text, params, callback)
     },
     getClient: (callback) => {
        pool.connect((err, client, done) => {
            callback(err, client, done)
        })
     }
 }
