var gameSocket = io(window.location.href);
var socket = io();

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
}

//#endregion

//#region SocketHandling

gameSocket.on("adddeck",function(deck)
{
    var li = '<li class="collection-item"><div>' + deck.name + '<a href="#!" onclick="RemoveDeck(\'' + deck.id
    + '\')" class="secondary-content"><i class="material-icons">clear</i></a></div></li>';

    $("div.adddecks div.decks").append(li);
});

//#endregion

//#region UiHandling

function InputChanged(input,value)
{
    $("label span#" + input).html(value);
}

//#endregion

