var fs = require('fs');
var CardcastAPI = require('cardcast-api').CardcastAPI;

var api = new CardcastAPI();

function GetDeck(deckId,callback)
{
    try
    {
        api.deck(deckId).then(function(deck)
        {
            callback(null,deck);

            //fs.writeFile('./cache/' + deckId + '.json',deck);
        });
    }
    catch(ex)
    {
        callback(ex,null);
    }
}

module.exports.GetDeck = GetDeck;