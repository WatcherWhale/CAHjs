socket.on('menuupdate',function(games)
{
    $(".menucontainer").empty();

    for (var i = 0; i < games.length; i++) 
    {
        var game = games[i];
        var mi = newmenuitem;
        
        mi = mi.replaceAll("%TITLE%",game.title);
        mi = mi.replaceAll("%PLAYERS%",game.players);
        mi = mi.replaceAll("%GAMEID%",game.id);
        mi = mi.replaceAll("%PASSWORD%",game.password);

        $(".menucontainer").append(mi);
    }
});

socket.on("gameupdate",function(game)
{
    var gameEl = $("div.menuitem#" + game.id);
    console.log(gameEl.length);

    if(gameEl.length > 0)
    {
        gameEl.find(".title").html(game.title);
        gameEl.find(".info .players").html("<b>Players:</b> " + game.players);
        gameEl.find(".info .password").html("<b>Password:</b> " + game.password);
    }
    else if(gameEl.length == 0)
    {
        var mi = newmenuitem;
        
        mi = mi.replaceAll("%TITLE%",game.title);
        mi = mi.replaceAll("%PLAYERS%",game.players);
        mi = mi.replaceAll("%GAMEID%",game.id);
        mi = mi.replaceAll("%PASSWORD%",game.password);

        $(".menucontainer").html(mi + $(".menucontainer").html());
    }
});

socket.on("removegame",function(id)
{
    $("div.menuitem#" + id).remove();
});

var menuitem = '<div class="menuitem" id="%GAMEID%"><div class="title">%TITLE%</div>' +
'<div class="info"><div class="row players"><b>Players:</b> %PLAYERS%</div><div class="row password"><b>Password:</b> %PASSWORD%</div>' +
'</div><a class="waves-effect waves-light btn green" onclick="JoinGame(\'%GAMEID%\')">Join Game</a></div>';

var newmenuitem = '<div class="card box z-depth-2 menuitem" id="%GAMEID%">' +
'<div class="card-content"><span class="card-title title">%TITLE%</span>' +
'<div class="info"><div class="row players"><b>Players:</b> %PLAYERS%</div><div class="row password"><b>Password:</b> %PASSWORD%</div>' +
'</div><div class="card-action"><a onclick="JoinGame(\'%GAMEID%\')" href="#!">Join Game</a></div></div></div>';