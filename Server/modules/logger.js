function Log(source,message)
{
    source = source.substr(0,3).toUpperCase();
    var date = new Date();
    var timestamp = AddZeros(date.getDate()) + "/" 
        + AddZeros(date.getMonth()) + "/" + date.getFullYear() + " " 
        + AddZeros(date.getHours()) + ":" + AddZeros(date.getMinutes()) + ":" + AddZeros(date.getSeconds());
        
    console.log( '[' + timestamp + '] ' + '\x1b[33m' + source + "\x1b[0m" , ": " + message);
}

function AddZeros(s)
{
    if(parseInt(s) < 10)
    {
        s = "0" + s;
    }
    return s;
}
module.exports = Log;