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

    socket.on("reconnectme",function(id)
    {
        SendMenuUpdates(socket);

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
        ListenToGame(game);
        collector.Games.push(game);

        socket.emit("join",game.id);
    });
});

function SendMenuUpdates(socket)
{
    var menuitems = [];

    var menuitem = {id:"",password:"",players:"",title:""};

    collector.Games.forEach(function(game)
    {
        var mi = menuitem;

        mi.id = game.id;
        mi.players = game.players.length + "/" + game.options.maxPlayers;
        mi.title = game.options.title;
        
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
    socket.emit("menuupdate",menuitems);
}

function RegisterUser(socket)
{
    var user = new User(socket);
    collector.Users.push(user);

    SendMenuUpdates(socket);
    socket.emit("userinfo",user.GetClientFreindlyInfo());
}

function ListenToGame(game)
{
    game.events.on("playerjoined",function(playerinfo)
    {
        var update = {id:game.id,password:"",players: playerinfo.length + "/" + game.options.maxPlayers,title:game.options.title};
        if(game.options.password === "")
        {
            update.password = "no";
        }
        else
        {
            update.password = "yes";
        }

        io.sockets.emit("gameupdate",update);
    });

    game.events.on("playerleft",function(playerinfo)
    {
        if(playerinfo.length > 0)
        {
            var update = {id:game.id,password:"",players: playerinfo.length + "/" + game.options.maxPlayers,title:game.options.title};

            if(game.options.password === "")
            {
                update.password = "no";
            }
            else
            {
                update.password = "yes";
            }

            io.sockets.emit("gameupdate",update);
        }
        else
        {
            io.sockets.emit("removegame",game.id);
            var index = collector.Games.indexOf(game);
            collector.Games.splice(index,1);
        }
    });

    game.events.on("GameOptionsUpdate",function()
    {
        var update = {id:game.id,password:"",players: game.playerInfo.length + "/" + game.options.maxPlayers,title:game.options.title};
        
        if(game.options.password === "")
        {
            update.password = "no";
        }
        else
        {
            update.password = "yes";
        }

        io.sockets.emit("gameupdate",update);
    });
}

//Routing
app.all("/game/:game",function(req,res)
{
    res.sendFile(__dirname + "/gamefiles/game.html");
});

http.listen(settings.port,function()
{
    console.log("Server started on port " + settings.port);
});