var uuid = require('uuid/v1');

function User(socket)
{
    this.socket = socket;

    this.id = uuid();
    this.name;
    
    this.game;
    this.gameSocket;
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