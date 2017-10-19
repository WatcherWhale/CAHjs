var express = require("express");
var app = express();

var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use(express.static("static"));

var User = require('./utils/user.js');
var users = [];

io.on('connection',function(socket)
{
    var user = new User(socket);
    users.push(user);

    socket.on("disconnect",function()
    {
        for(var i = 0; i < users.length; i++)
        {
            if(users[i].socket = socket)
            {
                users.splice(i,1);
                return;
            }
        }
    });
});

app.all("/game/:game",function(req,res)
{

});

http.listen(8000,function()
{
    console.log("Server started on 8000");
});