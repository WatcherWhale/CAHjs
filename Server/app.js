var fs = require('fs');

var settings = require('./settings.json');

var express = require("express");
var app = express();

var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use(express.static('static'));

var User = require('./utils/user.js');
var users = [];

var Game = require('./utils/game.js');
var games = [];

//Socket handling

io.on('connection',function(socket)
{
    SendMenuUpdates();

    var user = new User(socket);
    users.push(user);

    socket.emit("id",user.GetId());

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

    socket.on("createGame",function()
    {
        var game = new Game(io);
        games.push(game);

        socket.emit("join",game.id);
    });

    socket.on("joinedGame",UpdateGames);
    socket.on("leftGame",UpdateGames);
});

function UpdateGames()
{
    /*var indexes = [];
    var offset = 0;

    for(var i = 0; i < games.length; i++)
    {
        if(games[i].players.length == 0)
        {
            indexes.push(i);
        }
    }

    console.log(indexes);

    indexes.forEach(function(index)
    {
        games.splice(index - offset,1);
        offset++;
    },this);*/

    SendMenuUpdates();
}

function SendMenuUpdates()
{
    var menuitems = [];

    var menuitem = {id:"",password:"",players:"",title:""};
    
    games.forEach(function(game)
    {
        var mi = menuitem;

        mi.id = game.id;
        mi.players = game.players.length + "/" + game.options.maxPlayers;
        mi.title = game.id;
        
        if(game.options.password === "")
        {
            mi.password = "no";
        }
        else
        {
            mi.password = "yes";
        }

        menuitems.push(mi);

    },this);
    
    menuitems.reverse();
    io.sockets.emit("menuupdate",menuitems);
}

setInterval(UpdateGames,1000);

//Routing
app.all("/game/:game",function(req,res)
{
    res.sendFile(__dirname + "/gamefiles/game.html");
});

http.listen(settings.port,function()
{
    console.log("Server started on port " + settings.port);
});