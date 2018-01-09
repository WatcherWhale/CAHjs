var Log = require('./modules/logger.js');

//Games
var games = [];
module.exports.Games = games;

//Users
var users = [];
module.exports.Users = users;

//Default Decks
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


//Avatars
var avatars = [];
module.exports.Avatars = avatars;

module.exports.GetRandomAvatar = function()
{
    var rand = Math.random() * avatars.length;
    rand = Math.floor(rand);

    return avatars[rand];
};

var avaPath = __dirname + "/static/images/profiles";
ReadAvatars();

function ReadAvatars()
{
    ClearAvatars();
    fs.readdir(avaPath, function(err, files) 
    {
        if(err) console.error(err);

        for (var i = 0; i < files.length; i++)
        {
            var ext = path.extname(files[i]);

            if(ext == ".png" || ext == ".jpg")
            {
                avatars.push(files[i]);
            }
        }
    });

    setTimeout(ReadAvatars,10*60*1000);
}

function ClearAvatars ()
{
    while (avatars.length)
    {
        avatars.pop();
    }
}