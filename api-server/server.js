const express = require('express');
const app = express();
const port = 3002;

const Retrieve = require('../db_methods/retrieve');

const ret = new Retrieve();



let server;

app.get('/nodes', (req, res, next) => {
    //res.send('Return all nodes!');
    
    ret.nodeGetAllDb()
    .then(ret => {
        console.log(ret);
        res.send(ret);
    })
    .catch(ex => {
        next(ex);  // express error handler invoked
    })
    
});

app.get('/blocks', (req, res, next) => {
    //res.send('Return all nodes!');
    
    ret.blocksGetAllDb()
    .then(ret => {
        console.log(ret);
        res.send(ret);
    })
    .catch(ex => {
        next(ex);  // express error handler invoked
    })
    
});


app.get('/charts', (req, res, next) => {
    //res.send('Return all nodes!');
    
    ret.chartsGetAllDb()
    .then(ret => {
        console.log(ret);
        res.send(ret);
    })
    .catch(ex => {
        next(ex);  // express error handler invoked
    })
    
});


app.get('/info', (req, res, next) => {
    //res.send('Return all nodes!');
    
    ret.infoGetAllDb()
    .then(ret => {
        console.log(ret);
        res.send(ret);
    })
    .catch(ex => {
        next(ex);  // express error handler invoked
    })
    
});

// setTimeout(() => {
//             console.log(`Closing express server now`);
//             server.close();
// }, 60000);

server = app.listen(port, () => console.log(`App listening on port ${port}!`))

