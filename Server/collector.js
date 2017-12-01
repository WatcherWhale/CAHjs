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

var avatars = [];
module.exports.Avatars = avatars;

module.exports.GetRandomAvatar = function()
{
    var rand = Math.random() * avatars.length;
    rand = Math.floor(rand);

    return avatars[rand];
};

var avaPath = __dirname + "/static/images/profiles"
fs.readdir(avaPath, function(err, files) 
{
    for (var i = 0; i < files.length; i++)
    {
        var ext = path.extname(files[i]);

        if(ext == ".png")
        {
            avatars.push(files[i]);
        }
    }
});