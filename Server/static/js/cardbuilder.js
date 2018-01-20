var builder;
var code = "default";
var selectedcard = {type:"",id:"",card:{}};

var fontsizes = ["10px","15px","20px","25px","30px"];

var cardcollection = {
    "calls":[],
    "responses":[],
    "code":""
}

$(document).ready(function() 
{
    $('select').material_select();
    $('.collapsible').collapsible();

    $('input#color').autocomplete(
    {
        data: 
        {
            "black":null,
            "red": null,
            "blue": null,
            "green": null,
            "yellow": null,
            "cyan": null,
            "magenta": null,
            "pink": null,
            "orange": null
        },
        limit: 20,
        minLength: 1,
    });

    $('.modal').modal();

    code = window.location.href.substr(window.location.origin.length + "/builder/".length);

    builder = io("/builder");
    LoadFromServer();
});

function AddWhiteCard()
{
    
}

function AddBlackCard()
{
    
}


function LoadProperties()
{

}

function EditCard(type,id)
{
    var card = cardcollection[type][id];

    //Display Card Text
    var text = "";
    if(type == "responses")
    {
        text = card.text[0];
    }
    else
    {
        text = card.text[0];

        for (let i = 1; i < card.text.length; i++) 
        {
            const str = card.text[i];
            text += "_" + str;
        }
    }

    $("input#cardtext").val(text);

    //Display Card Type
    if(card.type == null)
    {
        card.type = 0;
    }

    $("select#cardtype").val(card.type);

    //Setup Options
    if(card.type == 0)
    {
        $("#textoptions").toggleClass("disabled",false);
        $("#imageoptions").toggleClass("disabled",true);
        $("#animationoptions").toggleClass("disabled",true);

        if(card.options == null)
        {
            card.options = {"font":"Roboto","font-size":"20px",color:"black"};
        }

        $("#color").val(card.options.color);
        $("#fontsize").val(fontsizes.indexOf(card.options["font-size"]));

    }
    else if(card.type == 1)
    {
        $("#textoptions").toggleClass("disabled",true);
        $("#imageoptions").toggleClass("disabled",false);
        $("#animationoptions").toggleClass("disabled",true);

        if(card.options == null)
        {
            card.options = {"image":"blank"};
        }
    }
    else if(card.type == 2)
    {
        $("#textoptions").toggleClass("disabled",false);
        $("#imageoptions").toggleClass("disabled",true);
        $("#animationoptions").toggleClass("disabled",false);
    }

    $('.collapsible').collapsible('open', card.type);

    Materialize.updateTextFields();
    $('select').material_select();
    selectedcard = {type:type,id:id,card:card};

    $('#editcard').modal('open');
}

function SaveCard()
{
    var card = selectedcard.card;
    if(selectedcard.type == "calls" && !($("#cardtext").val().Contains('_')))
    {
        var $toastContent = $('<i class="material-icons">error_outline</i> <span class="error">A black card should contain the \'_\' character.</span>');
        Materialize.toast($toastContent, 10000);
        return;
    }

    card.type = $("select#cardtype").val();
    if(card.type == 0)
    {
        var options = {"font":"Roboto","font-size":fontsizes[$("#fontsize").val()],color:$("#color").val()};
        card.options = options;
    }

    if(selectedcard.type == "responses")
    {
        card.text = [$("#cardtext").val()];
    }
    else if(selectedcard.type == "calls")
    {
        card.text = $("#cardtext").val().split("_");
    }

    cardcollection[selectedcard.type][selectedcard.id] = card;

    if(selectedcard.type == "responses")
    {
        $(".whitecollection #" + selectedcard.id).html($("#cardtext").val());
    }
    else if(selectedcard.type == "responses")
    {
        $(".blackcollection #" + selectedcard.id).html($("#cardtext").val());
    }

    $('#editcard').modal('close');
    Save();
}

function LoadFromServer()
{
    builder.emit("get",code);
    builder.on("get",Load);
}

const carditem = '<li class="collection-item" id="{ID}">'+
 '<div class="row"> <div class="col s10"> {TEXT}</div><a onclick="EditCard(\'{TYPE}\',\'{ID}\')" class="secondary-content"><i class="material-icons">edit</i></a></div></li>'
function Load(carddata)
{
    cardcollection = carddata;

    $(".blackcollection").empty();
    $(".whitecollection").empty();
    
    for (let i = 0; i < cardcollection.calls.length; i++) 
    {
        const call = cardcollection.calls[i];
        var text = call.text[0];

        for (let i = 1; i < call.text.length; i++) 
        {
            const str = call.text[i];
            text += "_" + str;
        }

        var li = carditem.replaceAll("{COLOR}","Black").replaceAll("{ID}",i).replaceAll("{TEXT}",text).replaceAll('{TYPE}',"calls");
        $(".blackcollection").append(li);
    }

    for (let i = 0; i < cardcollection.responses.length; i++) 
    {
        const response = cardcollection.responses[i];
        var text = response.text[0];

        var li = carditem.replaceAll("{COLOR}","White").replaceAll("{ID}",i).replaceAll("{TEXT}",text).replaceAll('{TYPE}',"responses");
        $(".whitecollection").append(li);
    }

    $("ul.whitecollection li.selectable").click(function()
    {
        console.log("click")
        EditCard("responses",$(this).attr("id")); 
    });
}

function Save()
{
    builder.emit("save",cardcollection);
}