var games = [];
module.exports.Games = games;

var users = [];
module.exports.Users = users;

var defaultDecks = [];
module.exports.DefaultDecks = defaultDecks;

//Load in default decks
var fs = require('fs');
var path = require('path');
const defDecksPath = __dirname + "/DefaultDecks";

fs.readdir(defDecksPath, function(err, dirs) 
{
    for (var i = 0; i < dirs.length; i++)
    {
        var dir = path.join(defDecksPath,dirs[i]);

        if(fs.lstatSync(dir).isDirectory())
        {
            var metadata = require(path.join(dir,"metadata.json"));

            var defDeck = {"code":dirs[i],"name":metadata.name,"defaultDeck":true,"path":dir};
            defaultDecks.push(defDeck);
        }
    }
});