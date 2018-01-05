const mysql = require('mysql');
const fs = require('fs');
var Log = require('./modules/logger.js');

var db;

module.exports.Setup = function(host,user,password,database)
{
    var pool = mysql.createPool(
    {
        connectionLimit : 100,
        host     : host,
        user     : user,
        password : password,
        database : database,
        debug    :  false
    });

    db = pool;
    SetupTables();
    return pool;
};

function SetupTables()
{
    var tables = fs.readFileSync(__dirname + "/sql/CreateTables.sql").split(/\r?\n/);
    tables.forEach(table =>
    {
        query(table,function(err,rows)
        {
            if(err)
            {
                Log.log("DATABASE","Error thrown: " + err);
                return;
            }
        });
    });
}

module.exports.query = query;
async function query(sql,callback)
{
    db.getConnection(function(err,connection)
    {
        if(err)
        {
            callback(err,null);
            return;
        }

        connection.query(sql,function(err,rows)
        {
            if(err)
            {
                callback(err,null);
                return;
            }

            callback(null,rows);
        });

    });
}