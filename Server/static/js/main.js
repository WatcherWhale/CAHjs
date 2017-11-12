var socket = io();
var self;

socket.on("userinfo",function(userinfo)
{
    sessionStorage.setItem("id",userinfo.id);
    var self = user;
});

socket.on("join",JoinGame);

socket.on("reconnected",function(userinfo)
{
    self = userinfo;
});

if(sessionStorage.getItem("id") !== null)
{
    socket.emit("reconnect",sessionStorage.getItem("id"));
}
else
{
    socket.emit("connectme");
}

function JoinGame(gameid)
{
    window.location.href = "/game/" + gameid;
}

if(window.location.href.Contains("menu"))
{
    if(sessionStorage.getItem("name") == null)
    {
        sessionStorage.setItem("redirect",window.location.href);
        window.location.href = "../..";
    }
}
else if(!window.location.href.Contains("game"))
{
    if(sessionStorage.getItem("name") != null)
    {
        window.location.href = "menu";
    }
}
else
{
    var gameid = window.location.href.split('/game/')[1];
    //remove ending '/' if it is added to the url
    gameid.replace('/','');

    socket.emit("joinedGame",gameid);
}

function Login()
{
    var name = $("input#name").val();
    sessionStorage.setItem("name",name);

    if(sessionStorage.getItem("redirect") != null)
    {
        var href = sessionStorage.getItem("redirect");
        sessionStorage.setItem("redirect",null);

        window.location.href = href;
    }
    else
    {
        window.location.href = "/menu";
    }
}

function CreateGame()
{
    socket.emit("createGame");
}

$(window).ready(function()
{
    $('input#name').keyup(function(e)
    {
        if(e.keyCode == 13)
        {
            Login();
        }
    });
});