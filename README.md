# fsn-stats

Fusion's node monitor


#SHELL 1

efsn --ethstats myName:lol@localhost:3000  # Run node locally outputting to PORT 3000

#SHELL 2

npm start WS_SECRET="lol" PORT=3000 nodemon start  # Collect data from the efsn MANAGERS

#SHELL 3

export SQLHOST=localhost     #  For a local PostgreSQL database

export SQLPASS=shamrock

node wsclient.js             #  Instantiates a WebSocket connection to fsn-stats and logs local node data to a PostgreSQL database
