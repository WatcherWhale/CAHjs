var uuid = require('uuid/v1');
var Log = require('../modules/logger.js');

function User(socket,collector)
{
    this.collector = collector;
    this.socket = socket;

    this.id = uuid();
    this.name;

    this.avatar = collector.GetRandomAvatar();
    this.socket.emit("avatar",this.avatar);
    
    this.game;
    this.gameSocket;

    this.CreateClientListener();

    Log("User","A new user has connected.");
}

module.exports = User;

User.prototype.CreateClientListener = function()
{
    var self = this;
    this.socket.on("changeavatar",function(index) 
    {
        self.ChangeAvatar(self.collector,index);
    });

    this.socket.on("name",function(name)
    {
        self.name = name;
    });
};

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

User.prototype.GetClientFreindlyInfo = function()
{
    var info = new UserClient(this.id,this.name,this.game);
    return info;
};

User.prototype.ChangeAvatar = function(collector,index)
{
    this.avatar = collector.Avatars[parseInt(index)]
    this.socket.emit("avatar",this.avatar);
}

function UserClient(id,name,game)
{
    this.id = id;
    this.name = name;
    this.game = game;
}