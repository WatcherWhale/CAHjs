var gameSocket = io(window.location.href);

var options;

var selectedCard;

var cardsInHand = [];
var cardsLaidArray = [];
var isCzar = false;

var confirmed = true;
var cardstoLay = 1;
var cardsLaid = [];

gameSocket.emit("name",{"name":"testplayer","id":"ABC-DFG-HIJ-KLMNOP"});

//#region Options

function AddDeck()
{
    var deck = $("input#deck").val();
    
    $("input#deck").val("");
    Materialize.updateTextFields();

    gameSocket.emit("deck",deck);
}

function RemoveDeck(deckid)
{
    //remove list item
    gameSocket.emit("removedeck",deckid);
    $("div.adddecks div.decks li#" + deckid).remove();
}

function SetPassword()
{
    var pass = $("input#password").val();
    options.password = pass;

    gameSocket.emit("options",options);
}

function StartGame()
{
    gameSocket.emit("startGame");
}

//#endregion

//#region SocketHandling

gameSocket.on("adddeck",function(deck)
{
    var li = '<li id="' + deck.id + '" class="collection-item"><div>' + deck.name + '<a href="#!" onclick="RemoveDeck(\'' + deck.id
        + '\')" class="secondary-content"><i class="material-icons">clear</i></a></div></li>';

    $("div.adddecks div.decks").append(li);
});

gameSocket.on("playnames",function(playnames)
{
    $("div.points div#playercollection").empty();

    playnames.forEach(function(playname) 
    {
        var li = '<li class="collection-item" id="' + playname.id + '"><div>' + playname.name 
            + '<span class="secondary-content bold">' + playname.points + '</span></div></li>';
        $("div.points div#playercollection").append(li);
    });
});

gameSocket.on("admin",function()
{
    $(".startscreen :input").attr("disabled", false);
    $("a.start").toggleClass("disabled",false);
});

gameSocket.on("options",function(opt)
{
    options = opt;
    $("input#maxpoints").val(options.maxpoints);
    $("input#maxplayers").val(options.maxplayers);
    $("input#blankcards").val(options.blankcards);
    $("input#password").val(options.password);

    $("label span#maxpoints").html(options.maxpoints);
    $("label span#maxplayers").html(options.maxplayers);
    $("label span#blankcards").html(options.blankcards);

    Materialize.updateTextFields();

});

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

gameSocket.on("callcard",function(card)
{
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
});

//#endregion

//#region UiHandling

$(document).ready(function()
{
    $(".startscreen :input").attr("disabled", true);
    $("a.start").toggleClass("disabled",true);

    $(".confirmbtn").click(Confirm);
})

function InputChanged(input,value)
{
    $("label span#" + input).html(value);
    options[input] = parseInt(value);
    gameSocket.emit("options",options);
}

function CardSelect()
{
    if(confirmed) return;
    
    selectedCard = $(this).attr("id");
    $("a.confirmbtn").toggleClass("disabled",false);

    $("div.owncards").children().toggleClass("selectedCard",false);

    $(this).toggleClass("selectedCard",true);
}

function Confirm()
{
    if(isCzar)
    {
        isCzar = false;
        gameSocket.emit("czarChoose",GetLaidCardById(selectedCard));
    }
    else
    {
        var card = GetCardById(selectedCard);

        cardsLaid.push(card);

        cardsInHand.splice(cardsInHand.indexOf(card),1);

        var c = '<div class="card whitecard">' + card.text + '</div>';
        $("div.laidcards").append(c);

        $("#" + card.id).remove();

        if(cardsLaid.length == cardstoLay)
        {
            gameSocket.emit("done",cardsLaid);
            cardsLaid = [];
        }

    }
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

function GetLaidCardById(id)
{
    var c;
    cardsLaidArray.forEach(function(card)
    {
        if(card.card.id == id)
        {
            c = card;
            return;
        }
    },this);
}