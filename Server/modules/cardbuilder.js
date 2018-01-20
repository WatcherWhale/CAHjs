const fs = require("fs");
const shortid = require('shortid');
const uuid = require('uuid/v4');

var server;
function SetupBuilder(io,dir)
{
    __dirname = dir;
    server = io.of('/builder');

    server.on('connection',function(socket)
    {
        socket.on("get",async function(code)
        {
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

        socket.on("createid",function()
        {
            socket.emit("createid",uuid());
        });

        socket.on("save",async function(savedata)
        {
            fs.writeFile(__dirname + "/cards/" + savedata.code + ".json",JSON.stringify(savedata),async function(err)
            {
                if(err)
                {
                    //Log error 
                    socket.emit("error",err);
                }
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