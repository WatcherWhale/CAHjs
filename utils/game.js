var shortid = require('shortid');
var shuffle = require('shuffle-array');
var CardCast = require('./modules/cardcast.js');

function Game(io)
{
    //Setup variables
    this.id = shortid.generate();

    this.admin = null;
    this.czar = null;
    this.players = [];

    this.options = require('./gameOptions.json');

    this.SetupGameServer(io);
    this.server;

    this.cards = {"calls":[],"responses":[]};
    this.decks = [];

    this.callloops = 0;
    this.drawcards = 0;
}

Game.prototype.SetupGameServer = function(io)
{
    //Start game server
    this.server = io.of('/game/' + id);
    this.server.on('connection',function(socket)
    {
        //Add player to list
        this.players.push(socket);
        this.admin = this.players[0];

        socket.on('disconnect',function()
        {
            if(this.players.lenght > 0)
                this.admin = this.players[0];
            else
                this.server.close();
        });

        //Add deck
        socket.on("deck",function(deckid)
        {
            if(isAdmin(socket))
                this.LoadDeck(socket,deckid);
        });

        //Change Password
        socket.on("password",function(pass)
        {
            if(isAdmin(socket))
                this.options.password = pass;
        });

        //Check if admin
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
    this.czar =
    decks.forEach(function(deck) 
    {
        this.cards.calls = deck.calls;
        this.cards.responses = deck.responses;
    });

    this.cards.calls = shuffle(this.cards.calls);
    this.cards.responses = shuffle(this.cards.responses);

    this.callloops = this.cards.calls.length;

    this.players.forEach(function(player)
    {
        var cards = this.cards.calls.splice(0,10);
        player.emit("cards",cards);
    });


    this.NextCallCard();
}

Game.prototype.NextCallCard = function()
{
    var card = this.cards.splice(0,1);
    this.cards.push(card);

    this.callloops--;

    if(this.callloops == 0)
    {
        this.cards.calls = shuffle(this.cards.calls);
    }

    this.NextCzar();
    this.server.broadcast("callcard",card);
    
    this.players.forEach(function(player)
    {
        var cards = this.cards.calls.splice(0,drawcards);
        player.emit("cards",cards);
    });

    this.drawcards = card.numResponses();
}

Game.prototype.NextCzar = function()
{
    if(this.czar == null)
    {
        var r = Math.round(Math.random() * (this.players.length - 1));

        this.czar = this.players[r];
    }
    else
    {
        var i = this.players.indexOf(this.czar) + 1;

        if(i == this.players.length) i = 0;

        this.czar = this.players[i];
    }

    this.czar.emit("czar");
}

module.exports = Game;