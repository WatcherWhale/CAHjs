var fs = require('fs');
var CardcastAPI = require('cardcast-api').CardcastAPI;

var api = new CardcastAPI();

function GetDeck(deckId,callback)
{
    try
    {
        fs.exists('./cache/' + deckId + '.json', function(exists)
        {
            if(!exists)
            {
                api.deck(deckId).then(function(deck)
                {
                    callback(null,deck);

                    fs.writeFile('./cache/' + deckId + '.json',deck);
                });
            }
            else
            {
                var deck = require('./cache/' + deckId + '.json');
                callback(null,deck);
            }
        });
    }
    catch(ex)
    {
        callback(ex,null);
    }
}

module.exports.GetDeck = GetDeck;