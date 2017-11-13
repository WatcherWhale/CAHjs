module.exports.SafeForWeb = function(str)
{
    var outputStr = str.replace("<","&lt;");
    outputStr = outputStr.replace(">","&gt;");
    outputStr = outputStr.replace("\"","&quot;");

    return outputStr;
}