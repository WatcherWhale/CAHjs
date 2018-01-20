var fs = require('fs');
var https = require('https');

async function GetDeck(deckId,callback)
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

            for(var i = 0; i < cards['calls'].length; i++)
            {
                var text = cards['calls'][i]['text'];
                cards['calls'][i]['numResponses'] = text.length - 1;
            }

            deckinfo['calls'] = cards['calls'];
            deckinfo['responses'] = cards['responses'];

            callback(null,deckinfo);
        });
    });
}

module.exports.GetDeck = GetDeck;

var apiUrl = "https://api.cardcastgame.com/v1/";

async function GetDeckInfo(deck,callback)
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
                var data = JSON.parse(buffer.toString());
                callback(null,data); 
            });
        }
    });
}

async function ObtainCards(deckinfo,callback)
{
    var buffer = new Buffer("");

    https.get("https://api.cardcastgame.com/v1/decks/" + deckinfo.code + "/cards",function(res)
    {
        res.on('error',function(err)
        {
            callback("problem",null);
        });

        if(res.statusCode == 404)
        {
            callback("Cards could not be loaded." + res.statusCode,null);
        }
        else
        {
            res.on('data', function(data)
            {
                buffer = Buffer.concat([buffer, data], buffer.length + data.length);
            });

            res.on('end',function()
            {
                var data = JSON.parse(buffer.toString());
                callback(null,data); 
            });
        }
    });
}