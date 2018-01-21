const fs = require("fs");
const shortid = require('shortid');
const uuid = require('uuid/v4');

var server;
var sockets = {};
function SetupBuilder(io,dir)
{
    __dirname = dir;
    server = io.of('/builder');

    server.on('connection',function(socket)
    {
        socket.on("get",async function(code)
        {
            sockets[code] = [];
            sockets[code].push(socket);

            fs.readFile(__dirname + "/cards/" + code + ".json",function(err,data)
            {
                if(err)
                {
                    console.error(err);
                    return;
                }
                socket.emit("get",JSON.parse(data.toString()));
            });
        });

        socket.on("createid",function(carddata)
        {
            carddata.code = uuid();
            socket.emit("createid",carddata);
        });

        socket.on("save",async function(savedata)
        {
            fs.writeFile(__dirname + "/cards/" + savedata.code + ".json",JSON.stringify(savedata),async function(err)
            {
                if(err)
                {
                    //Log error 
                    socket.emit("error",err);
                    return;
                }

                socket.emit("saved");

                sockets[savedata.code].forEach(s => 
                {
                    if(s != socket)
                        s.emit("reload",savedata);   
                });
            });
        });
    });
}

function CreateSet()
{
    var cardid = shortid.generate();
}

module.exports.Setup = SetupBuilder;
module.exports.Create = CreateSet;