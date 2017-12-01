function Log(source,message)
{
    source = source.substr(0,3).toUpperCase();
    var date = new Date();
    var timestamp = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
    console.log( '[' + timestamp + '] ' + '\x1b[33m' + source + "\x1b[0m" , ": " + message);
}

module.exports = Log;