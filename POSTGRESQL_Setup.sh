DROP DATABASE IF EXISTS myfusiondatabase;
CREATE DATABASE myfusiondatabase;

CREATE TABLE IF NOT EXISTS nodes ( 
    id      TEXT PRIMARY KEY, 
    utctime TIME with time zone, 
    block   BIGINT, 
    stats   TEXT, 
    info    TEXT 
);

CREATE TABLE IF NOT EXISTS charts ( utctime TEXT, charts TEXT );
