# fsn-stats

Fusion's node monitor


#Install postgreSQL

For Ubuntu/Debian :-

sudo apt install postgresql postgresql-common postgresql-client

The current version of postgreSQL is 12. The configuration should be changed to some defaults :-

cd /etc/postgresql/12/main/

sudo nano postgresql.conf 

Change the Connection Settings to 

listen_addresses = '*'          # what IP address(es) to listen on. Can be more restrictive than this, since we only need 127.0.0.1

port = 5432                             # (change requires restart)

Save these changes and edit the file pg_hba.conf :-

sudo nano pg_hba.conf

Add this line :-

host all all 0.0.0.0/0 md5

Save the change and then restart the postgreSQL server :-

sudo /etc/init.d/postgresql restart



The installation creates a user postgres. Ensure it has the password postgres and then log in :-

sudo passwd postgres   <set password to postgres>

su - postgres

Then try to enter the psql shell :-

psql

Now change the password to postgres :-

\password  <enter password>

Now quit :-

\q

The database and all necessary tables are created as user postgres with the standard server :-

psql -f POSTGRESQL_Setup.sh



If you want to test the installation using a local efsn node, then this can be done as follows :-

#SHELL 1  (download the Fusion efsn source from github and build according the instructions)

efsn --ethstats myName:lol@localhost:3000  # Run node locally outputting to PORT 3000

Set the WebSocket client in wsclient.js to be :-

const wsclient = new WebSocketClient('ws://127.0.0.1:3000/primus');

Alternatively, the default is to use the WebSocket client 'wss://node.fusionnetwork.io/primus' and you do not need to run efsn locally.


#SHELL 2  Start the server.js script which fires on the spark signals from the nodes in the network :-

npm start WS_SECRET="lol" PORT=3000 nodemon start  # Collect data from the efsn MANAGERS

#SHELL 3 Set some environmental variables and start the WebSocket client :-

export SQLHOST=localhost     #  For a local PostgreSQL database

export SQLPASS=postgres      # Corresponds to the postgres server password

node ./wsclient/wsclient.js  #  Instantiates a WebSocket connection to fsn-stats and logs node data to the PostgreSQL database myfusiondatabase and serves the data via Express for the React frontend.

#SHELL 4 Start the React frontend for the Node Monitor :-

cd react-frontend

npm start



