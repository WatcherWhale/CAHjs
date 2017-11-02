socket.on('menuupdate',function(games)
{
    console.log("sssss");
    $(".menucontainer").empty();
    
    games.forEach(function(game)
    {
        var mi = menuitem;

        mi = mi.replace("%TITLE%",game.title);
        mi = mi.replace("%PLAYERS%",game.players);
        mi = mi.replace("%GAMEID%",game.id);
        mi = mi.replace("%PASSWORD%",game.password);

        $(".menucontainer").append(mi);
    }, this);
});

var menuitem = '<div class="menuitem"><div class="title">%TITLE%</div>' +
'<div class="info"><div class="row"><b>Players:</b> %PLAYERS%</div><div class="row"><b>Password:</b> %PASSWORD%</div>' +
'</div><a class="waves-effect waves-light btn green" onclick="JoinGame(\'%GAMID%\')">Join Game</a></div>';