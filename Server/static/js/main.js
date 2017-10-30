var socket = io();

socket.on("id",function(uuid)
{
    sessionStorage.setItem("id",uuid);
});

socket.on("join",function(game)
{
    window.location.href = "/game/" + game;
});

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