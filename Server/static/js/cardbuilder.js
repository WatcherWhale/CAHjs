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

    builder.on("createid",function(id)
    {
        cardcollection[id.type][id.id].id = id.code;
    });

    builder.on("saved",function()
    {
        var $toastContent = $('<i class="material-icons">info_outline</i> <span class="info blue-text">Saved cardset.</span>');
        Materialize.toast($toastContent, 1000);
    });
});

function AddWhiteCard()
{
    var text = $("#whitecard").val();
    $("#whitecard").val("");

    if(text == "")
    {
        var $toastContent = $('<i class="material-icons">error_outline</i> <span class="error">Every card should have text.</span>');
        Materialize.toast($toastContent, 5000);
        return;
    }

    Materialize.updateTextFields();

    var l = cardcollection.responses.push({id:"generating",text:[text]});

    builder.emit("createid",{id:l-1,type:"responses"});

    Load(cardcollection);
    EditCard("responses",l-1);
}

function AddBlackCard()
{
    var text = $("#blackcard").val();
    $("#blackcard").val("");

    if(text == "")
    {
        var $toastContent = $('<i class="material-icons">error_outline</i> <span class="error">Every card should have text.</span>');
        Materialize.toast($toastContent, 5000);
        return;
    }
    else if(!text.Contains("_"))
    {
        var $toastContent = $('<i class="material-icons">error_outline</i> <span class="error">A black card should contain the \'_\' character.</span>');
        Materialize.toast($toastContent, 10000);
    }

    Materialize.updateTextFields();

    var l = cardcollection.calls.push({id:"generating",text:text.split('_')});

    builder.emit("createid",{id:l-1,type:"calls"});

    Load(cardcollection);
    EditCard("calls",l-1);
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
            card.options = {"font":"Roboto",color:"black"};

            if(type == "calls") card.options.color = "white";
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
        var options = {"font":"Roboto",color:$("#color").val()};
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
        $(".whitecollection #" + selectedcard.id + " div div").html($("#cardtext").val());
    }
    else if(selectedcard.type == "responses")
    {
        $(".blackcollection #" + selectedcard.id + " div div").html($("#cardtext").val());
    }

    $('#editcard').modal('close');
    Save();
}

function DeleteCard()
{
    cardcollection[selectedcard.type].splice(selectedcard.id,1);
    Save();
    Load(cardcollection);
}

function LoadFromServer()
{
    builder.emit("get",code);
    builder.on("get",Load);
    buidler.on("reload",ReLoad);
}

function ReLoad(carddata)
{
    var $toastContent = $('<i class="material-icons">info_outline</i> <span class="info blue-text">Reloaded cardset.</span>');
    Materialize.toast($toastContent, 1000);

    Load(carddata);
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

        if(call.numResponses == null || call.numResponses <= 0)
        {
            cardcollection.calls[i].numResponses = call.text.length - 1;
            Save();
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
}

function Save()
{
    builder.emit("save",cardcollection);

    var $toastContent = $('<i class="material-icons">info_outline</i> <span class="info blue-text">Saving cardset.</span>');
    Materialize.toast($toastContent, 1000);
}