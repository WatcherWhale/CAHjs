function Log(source,message)
{
    source = source.substr(0,3).toUpperCase();

    console.log('\x1b[33m' + source + "\x1b[0m" , ": " + message);
}

module.exports = Log;