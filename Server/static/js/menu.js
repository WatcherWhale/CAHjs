socket.on('menuupdate',function(games)
{
    $(".menucontainer").empty();

    for (var i = 0; i < games.length; i++) 
    {
        var mi = GenerateMenuItem(games[i].id,games[i].title,games[i].password,games[i].players);

        $(".menucontainer").append(mi);
    }
});

socket.on("gameupdate",function(game)
{
    var gameEl = $("div.menuitem#" + game.id);

    if(gameEl.length > 0)
    {
        gameEl.find(".title").html(game.title);
        gameEl.find(".info .players").html("<b>Players:</b> " + game.players);
        gameEl.find(".info .password").html("<b>Password:</b> " + game.password);
    }
    else if(gameEl.length == 0)
    {
        var mi = GenerateMenuItem(game.id,game.title,game.password,game.players);
        $(".menucontainer").html(mi + $(".menucontainer").html());
    }
});

socket.on("removegame",function(id)
{
    $("div.menuitem#" + id).remove();
});

function GenerateMenuItem(id,title,password,players)
{
    var mi = '<div class="card box z-depth-2 menuitem" id="%GAMEID%">' +
    '<div class="card-content"><div class="card-title title">%TITLE%</div>' +
    '<div class="info"><div class="row players"><b>Players:</b> %PLAYERS%</div><div class="row password"><b>Password:</b> %PASSWORD%</div>' +
    '</div><div class="card-action"><a onclick="JoinGame(\'%GAMEID%\')" href="#!">Join Game</a></div></div></div>';

    mi = mi.replaceAll("%TITLE%",title);
    mi = mi.replaceAll("%PLAYERS%",players);
    mi = mi.replaceAll("%GAMEID%",id);
    mi = mi.replaceAll("%PASSWORD%",password);

    return mi;
}