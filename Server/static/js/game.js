var gameSocket = io(window.location.href);

var options;

var selectedCard;

var cardsInHand = [];
var cardsLaidArray = [];
var isCzar = false;
var isAdmin = false;

var confirmed = true;
var cardstoLay = 1;
var cardsLaid = [];

var addingDecks = 0;
var defDecks = 0;

//#region Options

function AddDeck()
{
    var deck = $("input#deck").val();
    if(deck == "" || deck == null) return;
    
    $("input#deck").val("");
    Materialize.updateTextFields();

    gameSocket.emit("deck",deck);

    addingDecks++;
    $("div.progress").toggleClass("hide", addingDecks == 0);
}

function RemoveDeck(deckid)
{
    //remove list item
    gameSocket.emit("removedeck",deckid);
}

function SetPassword()
{
    var pass = $("input#password").val();
    options.password = pass;

    gameSocket.emit("options",options);
}

function SetTitle()
{
    var title = $("input#title").val();
    options.title = title;

    gameSocket.emit("options",options);
}

function StartGame()
{
    gameSocket.emit("startGame");
}

//#endregion

//#region SocketHandling

//Options
gameSocket.on("options",function(opt)
{
    options = opt;
    $("input#maxpoints").val(options.maxPoints);
    $("input#maxplayers").val(options.maxPlayers);
    $("input#blankcards").val(options.blankcards);
    $("input#password").val(options.password);
    $("input#title").val(options.title);

    $("label span#maxpoints").html(options.maxPoints);
    $("label span#maxplayers").html(options.maxPlayers);
    $("label span#blankcards").html(options.blankcards);

    Materialize.updateTextFields();

});

gameSocket.on("adddeck",function(deck)
{
    var li = '<li id="' + deck.id + '" class="collection-item"><div>' + deck.name + '<a href="#!" onclick="RemoveDeck(\'' + deck.id
        + '\')" class="secondary-content"><i class="material-icons">clear</i></a></div></li>';

    $("div.adddecks div.decks").append(li);

    addingDecks--;
    if(addingDecks < 0) addingDecks = 0;

    $("div.progress").toggleClass("hide", addingDecks == 0);

    EnableDisableStartButton();

    if(isAdmin) Materialize.toast("Deck <span class='bluetext toastspan'>" + deck.name + "</span> added.",3000);
});

gameSocket.on("adddefdeck",function(deck)
{
    $("div.defDecks ul li input#" + deck.name).prop('checked', true);
    defDecks++;

    addingDecks--;
    if(addingDecks < 0) addingDecks = 0;

    $("div.progress").toggleClass("hide", addingDecks == 0);

    EnableDisableStartButton();
});

gameSocket.on("removedeck",function(deck)
{
    if(deck.defaultDeck)
    {
        $("div.defDecks ul li input#" + deck.id).prop('checked', false);
        defDecks--;
    }
    else
    {
        $("div.decks li#" + deck.id).remove();
    }

    if(isAdmin) Materialize.toast("Deck <span class='redtext toastspan'>" + deck.name + "</span> removed.",3000);
});

gameSocket.on("Error.CardCast",function(err)
{
    addingDecks--;
    console.error(err);
    var $message = $('<i class="material-icons">error_outline</i> <span class="error">This card set could not load.</span>')
    Materialize.toast($message,3000);
});

gameSocket.on("playnames",function(playnames)
{
    playnames.forEach(function(playname) 
    {
        if($("div.points div#playercollection li#" + playname.id).length <= 0)
        {
            var li = '<li class="collection-item" id="' + playname.id + '"><div>' + playname.name
                + '<span class="status"></span>'
                + '<span class="secondary-content bold points">' + playname.points + '</span></div></li>';
            $("div.points div#playercollection").append(li);
        }
        else
        {
            $("div.points div#playercollection li#" + playname.id + " span.points").html(playname.points);
        }
    });

    $("div.points div#playercollection li").each(function()
    {
        if(!playnames.ContainsElement("id", $(this).attr("id")))
        {
            $(this).remove();
        }
    });

    EnableDisableStartButton();
});

gameSocket.on("admin",function()
{
    $(".startscreen :input").attr("disabled", false);
    $(".startscreen a#AddDeckBtn").attr("disabled", false);
    isAdmin = true;

    $("div.defDecks ul li").children().attr("disabled",false);

    EnableDisableStartButton();

    Materialize.toast("You became the new <span class='toastspan greentext'>admin</span>.",3000);
});

gameSocket.on("czar",function()
{
    isCzar = true;

    var div = '<div class="czar box">You are the card czar!</div>';
    $("div.owncards").append(div);
});

gameSocket.on("newczar",function(czarInfo)
{
    $("div#playercollection li#" + czarInfo.id + " span.status").html("Czar");
});

gameSocket.on("passProtection",function(protected)
{
    if(sessionStorage.getItem("name") == null || sessionStorage.getItem("name") == "")
    {
        sessionStorage.setItem("redirect",window.location.href);
        window.location.href = "../..";
    }
    else if(protected)
    {
        var pass = prompt("Type in the room password");
        gameSocket.emit("password",pass);

        gameSocket.on("password",function(result)
        {
            if(result)
            {
                RegisterSocket();
            }
            else
            {
                var pass = prompt("Type in the room password");
                gameSocket.emit("password",pass);
            }
        });
    }
    else
    {
        RegisterSocket();
    }
});

gameSocket.on("full",function()
{
    window.location.href = "../menu";
}); 

gameSocket.on("defDecks",PopulateDefDecks);

//Game functionality

gameSocket.on("cards",function(cards)
{
    var exCard = '<div class="card whitecard" id="%ID%">%TEXT%</div>';
    cards.forEach(function(card) 
    {
        cardsInHand.push(card);

        var c = exCard;
        c= c.replace("%ID%",card.id);
        c= c.replace("%TEXT%",card.text);

        $("div.owncards").append(c);
        $("div.owncards").children().click(CardSelect);
    }, this);

    confirmed = false;
    
});

gameSocket.on("start",function()
{
    $("div.startscreen").toggleClass("hiddendiv", true);
    $("div.playscreen").toggleClass("hiddendiv", false);
});

gameSocket.on("end",function()
{
    $("div.startscreen").toggleClass("hiddendiv", false);
    $("div.playscreen").toggleClass("hiddendiv", true);

    $("div.points div#playercollection li").each(function()
    {
        if($(this).find("span.status").html() != "Winner")
        {
            $(this).find("span.status").html("");
        }
    });

    $("div.owncards").empty();
});

gameSocket.on("winner",function(playerinfo)
{
    $("div.points div#playercollection li#" + playerinfo.id + " span.status").html("Winner");

    var $winToast = $('<span>' +playerinfo.name + " won this game." + '</span>')
        .add($('<button class="btn-flat toast-action" onclick="GG(\''+ playerinfo.name + '\')">Say GG</button>'));
    Materialize.toast($winToast,10000);
});

gameSocket.on("callcard",function(card)
{
    $("div.laidcards").empty();

    $("div#playercollection li").children().find("span.status").html("Playing");

    var text = "";

    card[0].text.forEach(function(txt)
    {
        text += txt + "___";
    },this);
    text = text.substr(0,text.length - "___".length);

    text += '<div class="pick">Pick: <div class="amount">' + card[0].numResponses + '</div></div>';

    cardstoLay = card[0].numResponses;
    $("div.callcard div.card").html(text);
});

gameSocket.on("carddone",function(playerInfo)
{
    $("div.laidcards").append("<div class='card whitecard'></div>");
    $("div.points div#playercollection li#" + playerInfo.id + " span.status").html("");
});

gameSocket.on("showcards",function(cardsholder)
{
    $("div.laidcards").empty();

    $("div.points div#playercollection li").each(function()
    {
        if($(this).find("span.status").html() != "Czar")
        {
            $(this).find("span.status").html("");
        }
    });

    cardsholder.forEach(function(holder)
    {
        cardsLaidArray.push(holder);

        if(holder.card.length > 1)
        {
            var div = "<div class='cardbox'>";

            holder.card.forEach(function(card)
            {
                div += "<div class='card whitecard' id='" + card.id + "'>" + card.text + "</div>";
            }, this);

            div += "</div>";
            $("div.laidcards").append(div);
        }
        else
        {
            var card = holder.card[0];
            $("div.laidcards").append("<div class='card whitecard' id='" + card.id + "'>" + card.text + "</div>");
        }
    }, this);

    $("div.laidcards").children().toggleClass("selectable",isCzar);
    $("div.laidcards div.selectable").click(CzarSelect);
});

gameSocket.on("cardchosen",function(cardsholder)
{
    cardsholder.card.forEach(function(card)
    {
        $("div.card#" + card.id).toggleClass("selectedcard",true);
    },this);
});

gameSocket.on("chat",ListChatMessage);

function RegisterSocket()
{
    //Register
    gameSocket.emit("name",{"name":sessionStorage.getItem("name"),"id":sessionStorage.getItem("id")});
    //socket.emit("joinedGame");
}
//#endregion

//#region UiHandling

$(document).ready(function()
{
    $(".startscreen :input").attr("disabled", true);
    $("a.start").toggleClass("disabled",true);

    $(".confirmbtn").click(Confirm);

    setTimeout(() => {LocateAddButton();},500);

    $("div.defDecks").hide();

    var timeoutId;
    var noHide = false;
    $("#AddDeckBtn").hover(function() 
    {
        if (!timeoutId)
        {
            timeoutId = window.setTimeout(function()
            {
                timeoutId = null;
                LocateAddButton();
                $("div.defDecks").fadeIn();
           }, 1000);
        }
    });

    $("#AddDeckBtn").mouseleave(function () 
    {
        if (timeoutId) 
        {
            window.clearTimeout(timeoutId);
            timeoutId = null;
        }
        else if(!noHide)
        {
           $("div.defDecks").fadeOut();
        }
    });

    $("div.defDecks").mouseenter(function(){noHide = true;});

    $("div.defDecks").mouseleave(function() 
    {
        noHide = false;
        $("div.defDecks").fadeOut();
    });


    $('div.adddecks input#deck').keyup(function(e)
    {
        if(e.keyCode == 13)
        {
            AddDeck();
        }
    });

    $('input#chattext').keyup(function(e)
    {
        if(e.keyCode == 13)
        {
            SendMessage();
        }
    });
})

function InputChanged(input,value)
{
    $("label span#" + input).html(value);
    options[input] = parseInt(value);
    gameSocket.emit("options",options);
}

function CardSelect()
{
    if(confirmed || isCzar) return;
    
    selectedCard = $(this).attr("id");
    $("a.confirmbtn").toggleClass("disabled",false);

    $("div.owncards").children().toggleClass("selectedCard",false);

    $(this).toggleClass("selectedCard",true);
}

function CzarSelect()
{
    if(confirmed) return;

    $("a.confirmbtn").toggleClass("disabled",false);

    if($(this).hasClass("cardbox"))
    {
        selectedCard = $($(this).children()[0]).attr("id");

        $("div.laidcards").children().children().toggleClass("selectedCard",false);
        $(this).children().toggleClass("selectedCard",true);
    }
    else
    {
        selectedCard = $(this).attr("id");

        $("div.laidcards").children().toggleClass("selectedCard",false);
        $(this).toggleClass("selectedCard",true);
    }
    console.log(selectedCard);
    //Dubbele kaarten werken nog niet id wordt niet gevonden
}

function Confirm()
{
    $("a.confirmbtn").toggleClass("disabled",true);

    if(isCzar)
    {
        isCzar = false;

        var holder = GetLaidCardHolderById(selectedCard);
        console.log(holder);
        gameSocket.emit("czarchoose",holder);

        $(".czar").remove();
    }
    else
    {
        var card = GetCardById(selectedCard);

        if(selectedCard.Contains("blank"))
        {
            card.text = prompt("Type in your custom card...");
        }

        cardsLaid.push(card);

        cardsInHand.splice(cardsInHand.indexOf(card),1);

        var c = '<div class="card whitecard">' + card.text + '</div>';
        $("div.laidcards").append(c);

        $("#" + card.id).remove();

        if(cardsLaid.length == cardstoLay)
        {
            gameSocket.emit("done",cardsLaid);
            $("div.points div#playercollection li#" + sessionStorage.getItem("id") + " span.status").html("");

            cardsLaid = [];

            confirmed = true;
        }
    }
}

function ListChatMessage(msg)
{
    var li = '<li class="collection-item">' + msg + '</li>';
    $(".chatcontainer ul").append(li);
    //animate to bottom
    $('.chatcontainer').animate({scrollTop:$('.chatcontainer')[0].scrollHeight}, 1000);
}

function SendMessage()
{
    var msg = $("input#chattext").val();
    
    $("input#chattext").val("");
    Materialize.updateTextFields();

    msg = msg.SafeForWeb();
    gameSocket.emit("chat",msg); 
}

function GG(name)
{
    gameSocket.emit("chat","gg " + name);
}

function EnableDisableStartButton()
{
    var decks = $("div.adddecks div.decks").children().length >= 1 || defDecks >= 1;
    var players = $("div.points div#playercollection").children().length >= 3;
    var decksLoading = addingDecks == 0;

    var enabled = decks && players && isAdmin && decksLoading;

    $("a.start").toggleClass("disabled",!enabled);
}

function LocateAddButton()
{
    $("div.defDecks").css({"top":0,"left":0});
    var offset = $("#AddDeckBtn").offset();
    $("div.defDecks").offset({ top: offset.top + 22.5, left: offset.left + -3.5152});
}

function PopulateDefDecks(decks)
{
    decks.forEach(function(deck)
    {
        var li = '<li class="collection-item"><input type="checkbox" id="' + deck.code + '" /><label for="' + deck.code + '">' + deck.name + '</label></li>';
        $("div.defDecks ul").append(li);
    });

    if(!isAdmin) $("div.defDecks ul li").children().attr("disabled",true);
    
    $("div.defDecks ul li input").change(function() 
    {
        if(this.checked)
        {
            gameSocket.emit("addDefDeck",$(this).attr("id"));
        }
        else
        {
            gameSocket.emit("removedeck",$(this).attr("id"));
        }
    });
}
//#endregion

function GetCardById(id)
{
    var c;
    cardsInHand.forEach(function(card)
    {
        if(card.id == id)
        {
            console.log("sss");
            c = card;
            return;
        }
    },this);

    return c;
}

function GetLaidCardHolderById(id)
{
    var c = null;
    cardsLaidArray.forEach(function(holder)
    {
        holder.card.forEach(function(card)
        {
            if(card.id == id)
            {
                c = holder;
                return;
            }
        },this);

        if(c != null) return;
    },this);

    return c;
}