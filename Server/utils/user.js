var uuid = require('uuid/v1');
var Log = require('../modules/logger.js');

function User(socket,collector)
{
    this.socket = socket;

    this.id = uuid();
    this.name;

    this.avatar = "";
    
    this.game;
    this.gameSocket;

    Log("User","A new user has connected.");
}

module.exports = User;

User.prototype.GetId = function()
{
    return this.id;
};

User.prototype.SendServer = function(event,message)
{
    this.socket.emit(event,message);
};

User.prototype.SendGame = function(event,message)
{
    this.gameSocket.emit(event,message);
};

User.prototype.SetupServerSocketConnection = function()
{
    this.socket.on("name",function(name)
    {
        this.name = name;
    });
};

User.prototype.GetClientFreindlyInfo = function()
{
    var info = new UserClient(this.id,this.name,this.game);
    return info;
};

function UserClient(id,name,game)
{
    this.id = id;
    this.name = name;
    this.game = game;
}