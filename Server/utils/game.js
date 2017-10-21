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
    //{"name":"username","id":"userid","points":0}
    this.playerInfo = [];

    this.options = require('./gameOptions.json');

    this.cards = {"calls":[],"responses":[]};
    this.decks = [];

    this.callloops = 0;
    this.drawcards = 0;

    this.playersDone = 0;
    this.cardslaid = [];

    this.server;
    this.SetupGameServer(io);
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
        this.playerInfo.push(null);

        //
        // User Info
        //

        socket.on('disconnect',function()
        {
            if(this.players.lenght > 0)
            {
                var i = this.players.indexOf(socket);
                this.players.splice(i,1);
                this.playerInfo.splice(i,1);

                this.admin = this.players[0];
                
                this.admin.emit("admin");
                this.server.emit("playnames",this.playerInfo);
            }
            else
                this.server.close();
        });

        //Username tells the server its name and id
        socket.on("name",function(name)
        {
            var i = this.players.indexOf(socket);

            var info = {"name":name.name,"id":name.id,"points":0};

            this.playerInfo[i] = info;
            this.server.emit("playnames",this.playerInfo);
        });

        //
        // Server Settings
        //

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

        //
        // Game socket handler
        //

        //When a player plays a card
        socket.on("done",function(card)
        {
            this.playersDone++;
            var i = this.players.indexOf(socket);

            var cardinfo = {"card":card,"player":this.playerInfo[i]}
            this.cardslaid.push(cardinfo);

            if(this.playersDone == this.players.lenght - 2)
            {
                this.server.broadcast("showcards",this.cardslaid);
            }
            else
            {
                this.server.broadcast("carddone",this.playerInfo[i]);
            }
        });

        //When the czar chooses a card
        socket.on("czarchoose",function(card)
        {
            if(isCzar(socket))
            {
                this.CzarChoose(card);
            }
        });

        //
        // Ceck if
        //

        //Check if admin
        function isAdmin(s)
        {
            if(this.admin == s)
                return true;
            else
                return false;
        }

        //Check if czar
        function isCzar(s)
        {
            if(this.czar == s)
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

    //TODO:add blanks

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

Game.prototype.CzarChoose = function(card)
{
    var endgame = false;
    for(var i = 0; i < this.players.length; i++)
    {
        if(card.player.id == this.playerInfo[i].id)
        {
            this.playerInfo[i].points++;

            if(this.playerInfo[i].points == this.options.maxPoints)
            {
                endgame = true;
            }
        }
    }

    this.server.broadcast("cardchosen",card);
    this.server.broadcast("playnames",this.playerInfo);

    setTimeout(function()
    {
        if(endgame)
        {
            //End game function
        }
        else
        {
            this.NextCallCard();
        }
    },2000);
}

module.exports = Game;