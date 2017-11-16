var fs = require('fs');
var https = require('https');

function GetDeck(deckId,callback)
{
    GetDeckInfo(deckId,function(err,deckinfo)
    {
        if(err)
        {
            callback(err,deckinfo);
            return;
        }

        ObtainCards(deckinfo,function(err,cards)
        {
            if(err)
            {
                callback(err,null);
                return;
            }

            deckinfo['calls'] = cards['calls'];
            deckinfo['responses'] = cards['responses'];

            callback(null,deckinfo);
        });
    });
}

module.exports.GetDeck = GetDeck;

var apiUrl = "https://api.cardcastgame.com/v1/";

function GetDeckInfo(deck,callback)
{
    var buffer = new Buffer("");

    https.get("https://api.cardcastgame.com/v1/decks/" + deck,function(res)
    {
        res.on('error',function(err)
        {
            callback(err,null);
        });

        if(res.statusCode == 404)
        {
            callback(new Error("Deck was not found." + res.statusCode),null);
        }
        else
        {
            res.on('data', function(data)
            {
                buffer = Buffer.concat([buffer, data], buffer.length + data.length);
            });

            res.on('end',function()
            {
                var data = buffer.toJSON();
                callback(null,data); 
            });
        }
    });
}

function ObtainCards(deckinfo)
{
    https.get("https://api.cardcastgame.com/v1/decks/" + deckinfo.code + "/cards",function(res)
    {
        res.on('error',function(err)
        {
            callback(err,null);
        });

        if(res.statusCode == 404)
        {
            callback(new Error("Cards could not be loaded." + res.statusCode),null);
        }
        else
        {
            res.on('data', function(data)
            {
                buffer = Buffer.concat([buffer, data], buffer.length + data.length);
            });

            res.on('end',function()
            {
                var data = buffer.toJSON();
                callback(null,data); 
            });
        }
    });
}