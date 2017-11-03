var fs = require('fs');

var settings = require('./settings.json');

var express = require("express");
var app = express();

var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use(express.static('static'));

var User = require('./utils/user.js');
var Game = require('./utils/game.js');
var collector = require("./collector.js");

//Socket handling

io.on('connection',function(socket)
{
    //SendMenuUpdates();

    socket.on("disconnect",function()
    {
        for(var i = 0; i < collector.Users.length; i++)
        {
            if(collector.Users[i].socket = socket)
            {
                collector.Users[i].socket == null;
                
                //Check if user is still disconnected after a period of time
                var id = collector.Users[i].id;
                setTimeout(function()
                {
                    for (var i = 0; i < collector.Users.length; i++)
                    {
                        var user = collector.Users[i];
                        if(user.id == id && user.socket === null) 
                        {
                            collector.Users.splice(i,1);
                            return;
                        }
                    }

                },settings.disconnectTimeout);

                return;
            }
        }
    });

    socket.on("reconnect",function(id)
    {
        for (var i = 0; i < collector.Users.length; i++) 
        {
            if(collector.Users[i].id == id)
            {
                collector.Users[i].socket = socket;
                socket.emit("reconnected",collector.Users[i].GetClientFreindlyInfo());
                return;
            }
        }

        RegisterUser(socket);
    });

    socket.on("connectme",function()
    {
        RegisterUser(socket);
    });

    socket.on("forcedisconnect",function()
    {
        for(var i = 0; i < collector.Users.length; i++)
        {
            if(collector.Users[i].socket = socket)
            {
                collector.Users.splice(i,1);
            }
        }
    });

    socket.on("createGame",function()
    {
        var game = new Game(io,collector);
        collector.Games.push(game);

        socket.emit("join",game.id);
    });

    socket.on("joinedGame",UpdateGames);
    socket.on("leftGame",UpdateGames);
});

function UpdateGames()
{
    /*var indexes = [];
    var offset = 0;

    for(var i = 0; i < collector.Games.length; i++)
    {
        if(collector.Games[i].players.length == 0)
        {
            indexes.push(i);
        }
    }

    console.log(indexes);

    indexes.forEach(function(index)
    {
        collector.Games.splice(index - offset,1);
        offset++;
    },this);*/

    SendMenuUpdates();
}

function SendMenuUpdates()
{
    var menuitems = [];

    var menuitem = {id:"",password:"",players:"",title:""};
    
    collector.Games.forEach(function(game)
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

function RegisterUser(socket)
{
    var user = new User(socket);
    collector.Users.push(user);

    socket.emit("userinfo",user.GetClientFreindlyInfo());
}

setInterval(UpdateGames,settings.menuRefreshTime);

//Routing
app.all("/game/:game",function(req,res)
{
    res.sendFile(__dirname + "/gamefiles/game.html");
});

http.listen(settings.port,function()
{
    console.log("Server started on port " + settings.port);
});