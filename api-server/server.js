const express = require('express');
const app = express();
const port = 3002;

app.get('/nodes', (req, res) => {
    res.send('Return all nodes!');
});

app.listen(port, () => console.log(`App listening on port ${port}!`))
