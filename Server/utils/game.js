var shortid = require('shortid');
var shuffle = require('shuffle-array');
var CardCast = require('../modules/cardcast.js');

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
    this.server = io.of('/game/' + this.id);
    var self = this;

    this.server.on('connection',function(socket)
    {        
        //Add player to list
        console.log(self);
        self.players.push(socket);
        self.admin = self.players[0];
        self.playerInfo.push(null);

        //
        // User Info
        //

        socket.on('disconnect',function()
        {
            if(self.players.lenght > 0)
            {
                var i = self.players.indexOf(socket);
                self.players.splice(i,1);
                self.playerInfo.splice(i,1);

                self.admin = self.players[0];
                
                self.admin.emit("admin");
                self.server.emit("playnames",self.playerInfo);
            }
            else
                self.server.close();
        });

        //Username tells the server its name and id
        socket.on("name",function(name)
        {
            var i = self.players.indexOf(socket);

            var info = {"name":name.name,"id":name.id,"points":0};

            self.playerInfo[i] = info;
            self.server.emit("playnames",self.playerInfo);
        });

        //
        // Server Settings
        //

        //Add deck
        socket.on("deck",function(deckid)
        {
            if(isAdmin(socket))
                self.LoadDeck(socket,deckid);
        });

        //Change Password
        socket.on("password",function(pass)
        {
            if(isAdmin(socket))
                self.options.password = pass;
        });

        //
        // Game socket handler
        //

        //When a player plays a card
        socket.on("done",function(card)
        {
            self.playersDone++;
            var i = self.players.indexOf(socket);

            var cardinfo = {"card":card,"player":self.playerInfo[i]}
            self.cardslaid.push(cardinfo);

            if(self.playersDone == self.players.lenght - 2)
            {
                self.server.broadcast("showcards",self.cardslaid);
            }
            else
            {
                self.server.broadcast("carddone",self.playerInfo[i]);
            }
        });

        //When the czar chooses a card
        socket.on("czarchoose",function(card)
        {
            if(isCzar(socket))
            {
                self.CzarChoose(card);
            }
        });

        //
        // Ceck if
        //

        //Check if admin
        function isAdmin(s)
        {
            if(self.admin == s)
                return true;
            else
                return false;
        }

        //Check if czar
        function isCzar(s)
        {
            if(self.czar == s)
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
        
        this.decks.push(deck);

    });
};

Game.prototype.StartGame = function()
{
    
    //reset previous round
    for(var i = 0; i < this.playerInfo.length; i++)
    {
        this.playerInfo[i].points = 0;
    }
    this.server.broadcast("playnames",this.playerInfo);

    //Load cards from decks
    this.decks.forEach(function(deck) 
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

Game.prototype.EndGame = function()
{
    this.server.emit("end");
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