String.prototype.Contains = function(str)
{
    return this.indexOf(str) != -1;
}

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