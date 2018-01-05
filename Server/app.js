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

var Log = require('./modules/logger.js');

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
                collector.Users[i].CreateClientListener();
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

        Log("App","A new game has been created with id '" + game.id + "'.");
    });
});

//#region Admin
var adminServer = io.of("/admin");
var admins = [];

adminServer.on('connection',function(socket)
{
    socket.on("password",function(pass)
    {
        if(pass == settings.adminPassword)
        {
            RegisterAdmin(socket);
        }
    });
});

function RegisterAdmin(socket)
{
    admins.push(socket);

    //Game
    socket.on("game.kill",function(gameid)
    {
        
    });

    socket.on("game.rename",function(gameid,name)
    {
        
    });

    socket.on("game.kick",function(gameid,userid)
    {
        
    });

    //User
    socket.on("user.rename",function(userid,name)
    {

    });
}

function SyncAdmin()
{
    admins.forEach(function(socket)
    {
        socket.emit("games",collector.Games);
        socket.emit("users",collector.Users);
    });
}
//#endregion


function SendMenuUpdates(socket)
{
    var menuitems = [];

    for(var i = 0; i < collector.Games.length; i++)
    {
        var game = collector.Games[i];

        var mi = {id:"",password:"",players:"",title:""};
        
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
    }
    
    menuitems.reverse();

    socket.emit("menuupdate",menuitems);
}

function RegisterUser(socket)
{
    var user = new User(socket,collector);
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

            game.events.emit("closeserver");
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

//#region WebServer
app.all("/game/:game",function(req,res)
{
    var gameid = req.params.game;
    var game = collector.Games.FindByElement("id",gameid);

    if(game != null)
    {
        res.sendFile(__dirname + "/hiddenfiles/game.html");
    }
    else
    {
        res.redirect('/menu');
    }
});

app.all("/analytics.js",function(req,res)
{
    fs.readFile('hiddenfiles/analytics.js',function(err,buffer)
    {
        if(err)
        {
            res.end(err);
            return;
        }

        var html = buffer.toString();

        if(settings['google-analytics-track-code'] == "" || settings['google-analytics-track-code'] == null)
        {
            res.end("//No track code set up");
        }
        else
        {
            html = html.replaceAll("%TRACKCODE%",settings['google-analytics-track-code']);
            res.end(html);
        }
    });
});

app.all("/admin",function(req,res)
{
    res.sendFile(__dirname + "/hiddenfiles/admin.html");
});

http.listen(settings.port,function()
{
    Log("App","Server started on port " + settings.port);
});

//#endregion

//#region Extensions
Array.prototype.ContainsElement = function(elementIdentifier,element)
{
    for (var i = 0; i < this.length; i++)
    {
        if(this[i][elementIdentifier] == element)
        {
            return true;
        }
    }

    return false;
};

Array.prototype.FindByElement = function(elementIdentifier,element)
{
    for (var i = 0; i < this.length; i++)
    {
        if(this[i][elementIdentifier] == element)
        {
            return this[i];
        }
    }

    return null;
};

String.prototype.replaceAll = function(search, replacement) 
{
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
//#endregion