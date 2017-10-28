var gameSocket = io(window.location.href);
var socket = io();

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
    console.log(playnames);

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
});

//#endregion

//#region UiHandling

$(document).ready(function()
{
    $(".startscreen :input").attr("disabled", true);
})

function InputChanged(input,value)
{
    $("label span#" + input).html(value);
}

//#endregion

