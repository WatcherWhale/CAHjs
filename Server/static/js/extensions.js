String.prototype.Contains = function(str)
{
    return this.indexOf(str) != -1;
};

String.prototype.replaceAll = function(search, replacement) 
{
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.SafeForWeb = function()
{
    var outputStr = this.replace("<","&lt;");
    outputStr = outputStr.replace(">","&gt;");
    outputStr = outputStr.replace("\"","&quot;");

    return outputStr;
};

Array.prototype.Contains = function(element)
{
    return this.indexOf(element) != -1;
}

Array.prototype.ContainsElement = function(elementIdentifier,element)
{
    for (let i = 0; i < this.length; i++)
    {
        if(this[i][elementIdentifier] == element)
        {
            return true;
        }
    }

    return false;
};