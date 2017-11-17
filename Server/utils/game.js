var fs = require('fs');
var path = require('path');
var os = require('os');
var EventEmitter = require('events');

var shortid = require('shortid');
var shuffle = require('shuffle-array');
var marked = require('marked');

var CardCast = require('../modules/cardcast.js');
var Security = require('../modules/security.js');
var Log = require('../modules/logger.js');

marked.setOptions({renderer: new marked.Renderer(),gfm: true});

var testmode = false;

function Game(io,collector)
{
    //Setup variables
    this.collector = collector;

    this.id = "test";
    if(!testmode) this.id = shortid.generate();
    
    this.admin = null;
    this.czar = null;

    this.players = [];
    this.users = [];
    //{"name":"username","id":"userid","points":0}
    this.playerInfo = [];

    this.options = require('./gameOptions.json');
    this.options.title = "Game " + this.id;

    this.gameStarted = false;

    this.cards = {"calls":[],"responses":[]};
    this.decks = [];

    this.callloops = 0;
    this.drawcards = 0;
    this.callcard;

    this.playersDone = 0;
    this.cardslaid = [];

    this.events = new EventEmitter();
    this.SetupEventEmitter();

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
        //room protection
        if(self.players.length === self.options.maxPlayers)
        {
            socket.emit("full");
        }
        else if(self.options.password == "")
        {
            socket.emit("passProtection",false);
            self.RegisterSocket(socket);
        }
        else
        {
            socket.emit("passProtection",true);
            
            socket.on("password",function(pass)
            {
                if(pass === self.options.password)
                {
                    self.RegisterSocket(socket);
                    socket.emit("password",true);
                }
                else
                {
                    socket.emit("password",false);
                }
            });
        }

        socket.on('disconnect',function()
        {
            var i = self.players.indexOf(socket);

            if(i === -1) return

            self.players.splice(i,1);
            self.playerInfo.splice(i,1);

            if(self.players.length > 0)
            {
                self.admin = self.players[0];
                self.admin.emit("admin");
            }

            self.server.emit("playnames",self.playerInfo);
            self.events.emit("playerleft",self.playerInfo);
        });

        //#region Options

        //Add deck
        socket.on("deck",function(deckid)
        {
            if(isAdmin(socket))
                self.LoadDeck(socket,deckid);
        });

        //Add Default Deck
        socket.on("addDefDeck",function(deckid)
        {
            if(isAdmin(socket))
                self.AddDefDeck(socket,deckid);
        });

        //Remove Deck
        socket.on("removedeck",function(deckid)
        {
            var offset = 0;
            for (var i = 0; i < self.decks.length; i++) 
            {
                const deck = self.decks[i];
                if(deck.code == deckid)
                {
                    self.decks.splice(i - offset,1);
                    offset++;

                    self.server.emit("removedeck",{"id":deck.code,"defaultDeck":deck.defaultDeck,"name":deck.name});
                }
            }
        });

        //Change Options
        socket.on("options",function(options)
        {
            if(isAdmin(socket))
            {
                self.options = options;
                self.server.emit("options",self.options);
                self.events.emit("GameOptionsUpdate");
            }
        });

        //#endregion

        //#region Game Handling Socket Events
        
        socket.on("startGame",function()
        {
            if(isAdmin(socket))
                self.StartGame();
        });

        //When a player plays a card
        socket.on("done",function(card)
        {
            if(isCzar(socket))
                return;
            
            self.playersDone++;
            var i = self.players.indexOf(socket);

            var cardinfo = {"card":card,"player":self.playerInfo[i]}
            self.cardslaid.push(cardinfo);

            //-1 because of the czar who does not need to choose

            if(self.playersDone == self.players.length - 1)
            {
                self.cardslaid = shuffle(self.cardslaid);
                self.server.emit("showcards",self.cardslaid);
            }
            else
            {
                self.players.forEach(function(player)
                {
                    if(player != socket) player.emit("carddone",self.playerInfo[i]);
                },self);
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

        //#endregion

        //#region Etc
        socket.on("chat",function(msg)
        {
            var name = self.playerInfo[self.players.indexOf(socket)].name;

            var mardownText = marked(Security.SafeForWeb(msg)).replace("<p>","").replace("</p>","");
            name = Security.SafeForWeb(name);

            self.players.forEach(function(player)
            {
                player.emit("chat","<b>" + name + "</b>: " + mardownText);
            });
        });

        //Check if admin
        function isAdmin(s)
        {
            return true;
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

        //#endregion
    });
};

Game.prototype.SetupEventEmitter = function()
{
    
};

Game.prototype.RegisterSocket = function(socket)
{
    //Add player to list
    if(this.players.length == 0)
    {
        socket.emit("admin");
    }

    socket.emit("options",this.options);

    this.players.push(socket);
    this.admin = this.players[0];
    this.playerInfo.push(null);
    this.users.push(null);

    this.events.emit("playerjoined",this.playerInfo);

    //If Game is started
    if(this.gameStarted)
    {
        socket.emit("start");
        
        var cards = this.cards.responses.splice(0,10);
        socket.emit("cards",cards);
        socket.emit("callcard",this.callcard);

        //replenish the responses
        this.cards.responses.push(cards);
    }

    this.decks.forEach(function(deck)
    {
        if(deck.defaultDeck)
        {
            socket.emit("adddefdeck",{"name":deck.name,"id":deck.code});
        }
        else
        {
            socket.emit("adddeck",{"name":deck.name,"id":deck.code});
        }
    });

    //Username tells the server its name and id
    var self = this;
    socket.on("name",function(name)
    {
        var i = self.players.indexOf(socket);

        var info = {"name":name.name,"id":name.id,"points":0};

        self.playerInfo[i] = info;

        self.collector.Users.forEach(function(user)
        {
            if(user.GetId() == name.id)
            {
                user.gameSocket = socket;
                user.game = this.id;
            }
        },self);

        self.server.emit("playnames",self.playerInfo);
        socket.emit("defDecks",self.collector.DefaultDecks);
    });
};

Game.prototype.LoadDeck = function(socket,deckid)
{
    for (var i = 0; i < this.decks.length; i++)
    {
        var deck = this.decks[i];

        if(deck.code == deckid)
            return;
    }

    for (var i = 0; i < this.collector.DefaultDecks.length; i++)
    {
        if(this.collector.DefaultDecks[i].code == deckid)
        {
            this.decks.push(this.collector.DefaultDecks[i]);
            this.server.emit("adddefdeck",{"name":this.collector.DefaultDecks[i].name,"id":deckid});
            return;
        }
    }

    var self = this;
    CardCast.GetDeck(deckid,function(err,deck)
    {
        if(err)
        {
            socket.emit("Error.CardCast",err);
            return;
        }
        
        deck["defaultDeck"] = false;
        self.decks.push(deck);
        self.server.emit("adddeck",{"name":deck.name,"id":deckid});
    });
};

Game.prototype.AddDefDeck = function(socket,deckid)
{
    for (var i = 0; i < this.decks.length; i++)
    {
        var deck = this.decks[i];

        if(deck.code == deckid)
            return;
    }

    for (var i = 0; i < this.collector.DefaultDecks.length; i++)
    {
        if(this.collector.DefaultDecks[i].code == deckid)
        {
            this.decks.push(this.collector.DefaultDecks[i]);
            this.server.emit("adddefdeck",{"name":this.collector.DefaultDecks[i].name,"id":deckid});
            return;
        }
    }
};

Game.prototype.StartGame = function()
{
    Log("Game","Game " + this.id + " has started.");

    if(this.decks.length == 0) return;
    if(this.players.length < 3 && !testmode) return;

    this.gameStarted = true;

    //reset previous round
    for(var i = 0; i < this.playerInfo.length; i++)
    {
        this.playerInfo[i].points = 0;
    }
    this.server.emit("playnames",this.playerInfo);
    this.server.emit("start");

    //Load cards from decks
    this.decks.forEach(function(deck) 
    {
        if(deck.defaultDeck)
        {
            this.LoadDefaultDeck(deck);
        }
        else
        {
            deck.calls.forEach(function(card)
            {
                this.cards.calls.push(card);
            },this);

            deck.responses.forEach(function(card)
            {
                this.cards.responses.push(card);
            },this);
        }
    },this);

    for(var i = 0; i < this.options.blankcards; i++)
    {
        var bcard = {id:"blank" + i, text:"___"};
        this.cards.responses.push(bcard);
    }

    this.cards.calls = shuffle(this.cards.calls);
    this.cards.responses = shuffle(this.cards.responses);

    this.callloops = this.cards.calls.length;

    this.players.forEach(function(player)
    {
        var cards = this.cards.responses.splice(0,10);
        player.emit("cards",cards);

        //replenish the responses
        this.AddWhiteCards(cards);
    },this);
    
    var card = this.cards.calls.splice(0,1);
    this.cards.calls.push(card);
    this.callcard = card;

    this.drawcards = card[0].text.length - 1;

    this.callloops--;

    if(this.callloops == 0)
    {
        this.cards.calls = shuffle(this.cards.calls);
    }

    this.server.emit("callcard",card);
    this.NextCzar();
}

Game.prototype.EndGame = function()
{
    this.gameStarted = false;

    this.cards.calls = [];
    this.cards.responses = [];
    this.cardslaid = [];
    this.callcard = null;
    this.drawcards = 0;
    this.playersDone = 0;
    this.czar = null;

    this.server.emit("end");
}

Game.prototype.NextCallCard = function()
{

    this.cardslaid = [];
    this.playersDone = 0;

    var card = this.cards.calls.splice(0,1);
    this.cards.calls.push(card);

    this.callloops--;

    if(this.callloops == 0)
    {
        this.cards.calls = shuffle(this.cards.calls);
    }

    this.server.emit("callcard",card);
    this.callcard = card;

    var done = false;
    this.players.forEach(function(player)
    {
        if(this.czar != player)
        {
            var cards = this.cards.responses.splice(0,this.drawcards);
            player.emit("cards",cards);

            //replenish the responses
            this.AddWhiteCards(cards);
        }

        if(this.players.indexOf(player) == this.players.length - 1) done  = true;
        
    },this);

    var self = this;
    var awaiter = setInterval(function()
    {
        if(done)
        {
            self.drawcards = card[0].text.length -1;
            self.NextCzar();
        }

        clearInterval(awaiter);
    },50);
}

Game.prototype.NextCzar = function()
{
    if(this.czar == null)
    {
        var r = Math.round(Math.random() * (this.players.length - 1));

        this.czar = this.players[r];

        this.server.emit("newczar", this.playerInfo[r]);
    }
    else
    {
        var i = this.players.indexOf(this.czar) + 1;

        if(i == this.players.length) i = 0;

        this.czar = this.players[i];
        this.server.emit("newczar", this.playerInfo[i]);
    }

    this.czar.emit("czar");
}

Game.prototype.CzarChoose = function(card)
{
    var endgame = false;
    var winner;
    for(var i = 0; i < this.players.length; i++)
    {
        if(card.player.id == this.playerInfo[i].id)
        {
            this.playerInfo[i].points++;

            if(this.playerInfo[i].points == this.options.maxPoints)
            {
                endgame = true;
                winner = this.playerInfo[i];
            }
        }
    }

    this.server.emit("cardchosen",card);
    this.server.emit("playnames",this.playerInfo);

    var self = this;
    setTimeout(function()
    {
        if(endgame)
        {
            self.EndGame();
        }
        else
        {
            self.NextCallCard();
        }
    },5000);
}

Game.prototype.LoadDefaultDeck = function(deck)
{
    var resLines = fs.readFileSync(path.join(deck.path,"white.txt"),"utf8");
    var resCardsText = resLines.split(/[\r\n]+/);
    
    for (var i = 0; i < resCardsText.length; i++) 
    {
        var cardRText = resCardsText[i];
        var card = {"id":deck.code + "r" + i,"text":cardRText};
        this.cards.responses.push(card);
    }

    var callLines = fs.readFileSync(path.join(deck.path,"black.txt"),"utf8");

    var callCardsText = callLines.split(/[\r\n]+/);
    
    for (var i = 0; i < callCardsText.length; i++) 
    {
        var cardCText = callCardsText[i];

        var splitArray = cardCText.split("_");
        if(splitArray.length == 1)
        {
            splitArray.push('');
        }

        var card = {"id":deck.code + "c" + i,"text":splitArray,"numResponses":splitArray.length - 1};
        this.cards.calls.push(card);
    }
};

Game.prototype.AddWhiteCards = function(cards)
{
    for (var i = 0; i < cards.length; i++)
    {
        var card = cards[i];
        this.cards.responses.push(card);
    }
};

module.exports = Game;