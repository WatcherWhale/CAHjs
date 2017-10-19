var shortid = require('shortid');
var shuffle = require('shuffle-array');
var CardCast = require('./modules/cardcast.js');

function Game(io)
{
    this.id = shortid.generate();

    this.admin = null;
    this.players = [];
    this.spectators = [];

    this.options = require('./gameOptions.json');

    this.SetupGameServer(io);
    this.server;

    this.cards = {"calls":[],"responses":[]};
    this.decks = [];
}

Game.prototype.SetupGameServer = function(io)
{
    this.server = io.of('/game/' + id);
    this.server.on('connection',function(socket)
    {
        this.players.push(socket);
        this.admin = this.players[0];

        socket.on('disconnect',function()
        {
            if(this.players.lenght > 0)
                this.admin = this.players[0];
            else
                this.server.close();
        });

        socket.on("deck",function(deckid)
        {
            if(isAdmin(socket))
                this.LoadDeck(socket,deckid);
        });

        socket.on("password",function(pass)
        {
            if(isAdmin(socket))
                this.options.password = pass;
        });

        function isAdmin(s)
        {
            if(this.admin == s)
                return true;
            else
                return false;
        }
    });
};

Game.prototype.LoadDeck = function(socket,deckid)
{
    CardCast.GetDeck(deckid,function(err,deck)
    {
        if(err)
        {
            socket.emit("error",err);
            return;
        }
        
        decks.push(deck);

    });
};

Game.prototype.StartGame = function()
{
    decks.forEach(function(deck) 
    {
        this.cards.calls = deck.calls;
        this.cards.responses = deck.responses;
    });

    this.cards.calls = shuffle(this.cards.calls);
    this.cards.responses = shuffle(this.cards.responses);

    this.players.forEach(function(player)
    {
        var cards = this.cards.calls.splice(0,10);
        player.emit(cards);
    });

}

module.exports = Game;