# fsn-stats

Fusion's node monitor


For a local test run :-

Create the postgreSQL database called myfusiondatabase. Create 3 tables using pgadmin4 in it called nodes, blocks, charts. The definitions are in CREATE_TABLE_nodes, CREATE_TABLE_blocks, CREATE_TABLE_charts

#SHELL 1

efsn --ethstats myName:lol@localhost:3000  # Run node locally outputting to PORT 3000

#SHELL 2

npm start WS_SECRET="lol" PORT=3000 nodemon start  # Collect data from the efsn MANAGERS

#SHELL 3

export SQLHOST=localhost     #  For a local PostgreSQL database

export SQLPASS=<something>

node wsclient.js             #  Instantiates a WebSocket connection to fsn-stats and logs local node data to a PostgreSQL database
