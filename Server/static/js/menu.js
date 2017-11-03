socket.on('menuupdate',function(games)
{
    $(".menucontainer").empty();

    for (var i = 0; i < games.length; i++) 
    {
        var game = games[i];
        var mi = menuitem;
        
        mi = mi.replace("%TITLE%",game.title);
        mi = mi.replace("%PLAYERS%",game.players);
        mi = mi.replace("%GAMEID%",game.id);
        mi = mi.replace("%PASSWORD%",game.password);

        $(".menucontainer").append(mi);
    }
});

var menuitem = '<div class="menuitem"><div class="title">%TITLE%</div>' +
'<div class="info"><div class="row"><b>Players:</b> %PLAYERS%</div><div class="row"><b>Password:</b> %PASSWORD%</div>' +
'</div><a class="waves-effect waves-light btn green" onclick="JoinGame(\'%GAMEID%\')">Join Game</a></div>';