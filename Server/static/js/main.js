var socket = io();
var self;

var gameSocket;

var avatars = [];
var currentAvatar = "";
var sidebar;

var disconnected = true;

//The server sends Userinfo over to the client
socket.on("userinfo",function(userinfo)
{
    sessionStorage.setItem("id",userinfo.id);
    var self = userinfo;

    console.log("Connected!");
});

//The server sends a gameid to join
socket.on("join", function (gameid)
{
    window.location.href = "/game/" + gameid;
});

//The server reconnects the client and gives the client back his previous user info
socket.on("reconnected",function(userinfo)
{
    self = userinfo;
    console.log("Reconnected!");

    currentAvatar = sessionStorage.getItem("avatar");
    socket.emit("name",sessionStorage.getItem("name"));
});

//The server sends a avatar to the player
socket.on("avatar",function(avatar)
{
    sessionStorage.setItem("avatar",avatar);
    $(".usercontent img.circle").attr("src","../images/profiles/" + sessionStorage.getItem("avatar"));

    currentAvatar = avatar;

    if(gameSocket != null)
        gameSocket.emit("avatar",avatar);
});

//The server sends the client the full list of possible avatars
socket.on("avatars",function(avtrs)
{
    avatars = avtrs;

    for (let i = 0; i < avatars.length; i++) 
    {
        const av = avatars[i];
        var opt = "<option data-img-src='../images/profiles/" + av + "' value='" + i + "'></option>";
        $("select#avatarpick").append(opt);
    }
});

//When the client loses connection with the server
socket.on("disconnect", function()
{
    disconnected = true;

    PopupMessage("You got disconnected from the server!", true);
});

//Check if the client has already connected this session
if(sessionStorage.getItem("id") != null)
{
    //reconnecting the client
    socket.emit("reconnectme",sessionStorage.getItem("id"));
}
else
{
    //Connecting to the server
    console.log("Connecting...");
    socket.emit("connectme");
}

//Check the routing of the client and if it is already connected
if(window.location.href.Contains("menu"))
{
    if(sessionStorage.getItem("name") == null)
    {
        sessionStorage.setItem("redirect",window.location.href);
        window.location.href = "../..";
    }
}
else if(!window.location.href.Contains("game"))
{
    if(sessionStorage.getItem("name") != null)
    {
        window.location.href = "menu";
    }
}
else
{
    var gameid = window.location.href.split('/game/')[1];
    //remove ending '/' if it is added to the url
    gameid.replace('/','');

    socket.emit("joinedGame",gameid);
}

/**
 * @description Give the server the users name and connect to the server.
 */
function Login()
{
    var name = $("input#name").val();
    name = name.SafeForWeb();
    sessionStorage.setItem("name",name);

    socket.emit("name",name);

    if(sessionStorage.getItem("redirect") != null)
    {
        var href = sessionStorage.getItem("redirect");
        sessionStorage.setItem("redirect",null);

        window.location.href = href;
    }
    else
    {
        window.location.href = "/menu";
    }
}

/**
 * @description Create a game.
 */
function CreateGame()
{
    socket.emit("createGame");
}

/**
 * @description Get a random avatar from the server.
 * @deprecated
 */
function ChangeAvatar()
{
    socket.emit("changeavatar");
}

/**
 * @description Set the user selected avatar to the current avatar.
 */
function PickAvatar()
{
    socket.emit("changeavatar",$("select#avatarpick").val());
    currentAvatar = avatars[parseInt($("select#avatarpick").val())];
}

/**
 * @description Open a modal where the user can select a custom avatar.
 */
function OpenAvatarModal()
{
    $('#avatarpicker').modal('open');
    $("select#avatarpick").val(avatars.indexOf(currentAvatar));
    $('#avatarpick').imagepicker();
}

/**
 * @description Rename the user.
 */
function ChangeName()
{
    var name = $("input#newname").val();
    name = name.SafeForWeb();
    sessionStorage.setItem("name",name);
    $(".usercontent span.name").html(sessionStorage.getItem("name"));

    socket.emit("name",name);

    if(gameSocket != null)
        gameSocket.emit("changedname",name);
}

$(window).ready(function()
{
    //Initialize sidebar if enabled on page.
    if(sidebar) $("body").append(sidebar);

    //Focus on username textbox
    $('input#name').focus();
    $('input#name').keyup(function(e)
    {
        if(e.keyCode == 13)
        {
            Login();
        }
    });

    //open sidebar
    $(".button-collapse").sideNav({
        onClose: function(el) { $("div.header a.button-collapse i").toggleClass("rotated")}
    });
    //Rotate button for extra pleasing effect
    $(".button-collapse").click(function() { $("div.header a.button-collapse i").toggleClass("rotated")});

    //Initialize all modals
    $('.modal').modal();

    //Add userinfo to the sidebar
    $(".usercontent img.circle").attr("src","../images/profiles/" + sessionStorage.getItem("avatar"));
    $(".usercontent span.name").html(sessionStorage.getItem("name"));
    $(".usercontent span.email").html("not logged in.");

    //Add username to 'Change Name' textbox
    $("input#newname").val(sessionStorage.getItem("name"));

    //Update all textfields
    Materialize.updateTextFields();
});

/**
 * @description Shows a popup message to the user
 * @param {String} message A message
 * @param {boolean} error Is it a error message?
 */
function PopupMessage(message,error)
{
    if (error)
    {
        var $message = $('<i class="material-icons">error_outline</i> <span class="error">' + message + '</span>');
        Materialize.toast($message, 3000);
    }
    else
    {
        var $message = $('<i class="material-icons">error_outline</i> <span class="info">' + message + '</span>');
        Materialize.toast($message, 3000);
    }
}