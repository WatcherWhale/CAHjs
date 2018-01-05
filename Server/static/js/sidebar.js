var sidebar = '<ul id="slide-out" class="side-nav usercontent">' +
    '<li>'+
        '<div class="user-view">'+
        '<div class="background">'+
            '<img src="../images/userbanner.png">'+
        '</div>'+
        '<a><img class="circle" src="../images/profiles/001-dish.png"></a>'+
        '<a><span class="white-text name bold">Username</span></a>'+
        '<a><span class="white-text email">email</span></a>'+
        '</div>' +
    '</li>'+
    '<li><div class="divider"></div></li>'+
    '<li><a class="modal-trigger waves-effect" data-target="newnamemodal"><i class="material-icons">mode_edit</i>Change nickname</a></li>'+
    '<li><a class="waves-effect" onclick="ChangeAvatar()"><i class="material-icons">shuffle</i>Randomize avatar.</a></li>'+
    '<!--li><a href="#!">Connect with google.</a></li-->'+
    '<li><div class="divider"></div></li>'+
    '<li><a class="logout waves-effect waves-red" href="#!">Logout</a></li>'+
'</ul>'+

'<div id="newnamemodal" class="modal modal">'+
    '<div class="modal-content">'+
        '<h4>Change your nickname</h4>'+
        '<p>'+
            '<div class="input-field col s6">'+
                '<input id="newname" type="text" class="validate">'+
                '<label for="newname">Nickname</label>'+
            '</div>'+
        '</p>'+
    '</div>'+
    '<div class="modal-footer">'+
        '<a class="modal-action modal-close waves-effect waves-red btn-flat ">Cancel</a>'+
        '<a onclick="ChangeName()" class="modal-action modal-close waves-effect waves-green btn-flat ">Change</a>'+
    '</div>'+
'</div>';