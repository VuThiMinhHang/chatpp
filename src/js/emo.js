// Const
var LOCAL_STORAGE_DATA_KEY = "YACEP_EMO_DATA";
var DEFAULT_IMG_HOST = "http://chatpp.thangtd.com/";
var CODE_TYPE_OFFENSIVE = "OFFENSIVE";
var CODE_TYPE_DEFENSIVE = "DEFENSIVE";
var LOCAL_STORAGE_EMOTICON_STATUS = "CHATPP_EMOTICON_STATUS";
var LOCAL_STORAGE_MENTION_STATUS = "CHATPP_MENTION_STATUS";
var LOCAL_STORAGE_SHORTCUT_STATUS = "CHATPP_SHORTCUT_STATUS";

var emoticon_status = false;
var cw_timer;

var mention_status = false;
var shortcut_status = false;
var VERSION_NAME_DEV = 'dev';

var ADVERTISEMENT_CHANGE_TIME = 1000 * 30;

$(function(){

    cw_timer = setInterval(
        function(){
            if (typeof CW != 'undefined' && typeof CW.reg_cmp != 'undefined') {
                window.clearInterval(cw_timer);
                addStyle();
                if (localStorage[LOCAL_STORAGE_EMOTICON_STATUS] === 'true') {
                    addEmoticonText();
                }
                if (localStorage[LOCAL_STORAGE_MENTION_STATUS] === 'true') {
                    mention_status = true;
                    addMentionText();
                }
                if (localStorage[LOCAL_STORAGE_SHORTCUT_STATUS] === 'true') {
                    shortcut_status = true;
                    addShortcutText();
                }

                addAdvertisement();
                if (localStorage[LOCAL_STORAGE_EMOTICON_STATUS] === 'true') {
                    var code_type = localStorage['emoticon_code_type'];
                    if (code_type === CODE_TYPE_OFFENSIVE) {
                        CW.prepareRegExp();
                    }
                    addExternalEmo();
                }
            }
        },
        100
    );
});

function htmlEncode(value){
    return $('<div/>').text(value).html();
}

function addEmo(emo) {
    for (var index = 0; index < emo.length; index++) {
        var rep = "";
        var encoded_text = htmlEncode(emo[index].key);
        var img_src = getEmoUrl(emo[index].src);
        if (isSpecialEmo(emo[index].key)) {
            rep = '<img src="' + img_src + '" class="ui_emoticon"/>';
        } else {
            rep = '<img src="' + img_src + '" title="' + encoded_text + '" alt="' +
            encoded_text + '" class="ui_emoticon"/>';
        }
        CW.reg_cmp.push({
            key: new RegExp(emo[index].regex, 'g'),
            rep: rep,
            reptxt: emo[index].key,
            external: true
        });
    }
}

function getEmoUrl(img) {
    if (img.indexOf('https://') == 0 || img.indexOf('http://') == 0) {
        return img;
    }
    return DEFAULT_IMG_HOST + "img/emoticons/" + img;
}

function isSpecialEmo(emo) {
    var special_emo = [':-ss', ':-??', '~:>'];
    return special_emo.indexOf(emo) > -1;
}

function removeExternalEmo() {
    for (var i = CW.reg_cmp.length -1; true; i--) {
        var emo = CW.reg_cmp[i];
        if (!$.isEmptyObject(emo) && emo.external !== undefined && emo.external === true) {
            CW.reg_cmp.splice(i, 1);
        } else {
            break;
        }
    }
    emoticon_status = false;
    updateEmoticonText();
    console.log('Emoticons removed!');
}

function addExternalEmo() {
    var emodata = JSON.parse(localStorage[LOCAL_STORAGE_DATA_KEY]);
    addEmo(emodata);
    var version_name = localStorage['chatpp_version_name'];
    if (version_name === VERSION_NAME_DEV) {
        var secret_emos = getSecretEmos();
        addEmo(secret_emos);
    }
    emoticon_status = true;
    updateEmoticonText();
    console.log('Emoticon added!');
}

function addStyle() {
    $("<style type='text/css'> .emoticonTextEnable{font-weight: bold;} </style>").appendTo("head");
}

function addEmoticonText() {
    if ($('#emoticonText').length > 0) {
        return;
    }
    var emoticon_text = 'E ' + (emoticon_status ? 'ON' : 'OFF');
    $('#_chatSendTool').append(
        '<li id="_emoticons" role="button" class=" _showDescription">' +
            '<span id="emoticonText" class="emoticonText icoSizeSmall">' + emoticon_text + '</span>' +
        '</li>'
    );
    setEmoticonTextLabel();
    $('#emoticonText').click(function() {
        toggleEmoticonsStatus();
    })
}

function setEmoticonTextLabel() {
    $('#_emoticons').attr('aria-label', 'Data: ' + localStorage['emoticon_data_version']);
}

function removeEmoticonText() {
    if ($('#emoticonText').length > 0) {
        $('#emoticonText').remove();
    }
}

function updateEmoticonText() {
    var emoticon_text = 'E: ' + (emoticon_status ? 'ON' : 'OFF');
    var div = $('#emoticonText');
    div.html(emoticon_text);
    if (emoticon_status) {
        div.addClass('emoticonTextEnable');
    } else {
        div.removeClass('emoticonTextEnable');
    }
}

function addAdvertisement() {
    if ($('#chatppAdvertisement').length > 0) {
        return;
    }
    var text = '<li id="_chatppSponsored" role="button" class=" _showDescription" aria-label="Advertising Corner. Contact us if you want to advertise everything here.">' +
        '<span id="chatppAdvertisement" class="icoSizeSmall">' + getAdvertisementText() + '</span>' +
    '</li>';

    $('#_chatSendTool').append(text);
    setInterval(changeRandomAdvertisement, ADVERTISEMENT_CHANGE_TIME);
}

function changeRandomAdvertisement() {
    var text = getAdvertisementText();
    $('#chatppAdvertisement').html(text);
}

function getAdvertisementText() {
    if (localStorage['chatpp_advertisement'] !== undefined && localStorage['chatpp_advertisement']) {
        var ads = JSON.parse(localStorage['chatpp_advertisement']);
        if (ads.length > 0) {
            return ads[Math.floor(Math.random() * ads.length)];
        }
    }
    return 'Advertisement Here!';
}

function removeAdvertisement() {
    if ($('#chatppAdvertisement').length > 0) {
        $('#chatppAdvertisement').remove();
    }
}

function addMentionText() {
    if ($('#_chatppMentionText').length > 0) {
        return;
    }
    $('#_chatSendTool').append(
        '<li id="_chatppMentionText" role="button" class=" _showDescription">' +
        '<span id="chatppMentionText" class="emoticonText icoSizeSmall"></span>' +
        '</li>'
    );
    updateMentionText();
    $('#chatppMentionText').click(function() {
        toggleMentionStatus();
    })
}

function addShortcutText() {
    if ($('#_chatppShortcutText').length > 0) {
        return;
    }
    $('#_chatSendTool').append(
        '<li id="_chatppShortcutText" role="button" class=" _showDescription">' +
        '<span id="chatppShortcutText" class="emoticonText icoSizeSmall"></span>' +
        '</li>'
    );
    updateShortcutText();
    $('#chatppShortcutText').click(function() {
        toggleShortcutStatus();
    })
}

function removeMentionText() {
    if ($('#_chatppMentionText').length > 0) {
        $('#_chatppMentionText').remove();
    }
}

function removeShortcutText() {
    if ($('#_chatppShortcutText').length > 0) {
        $('#_chatppShortcutText').remove();
    }
}

function updateMentionText() {
    var mention_text = 'M: ' + (mention_status ? 'ON' : 'OFF');
    var div = $('#chatppMentionText');
    div.html(mention_text);
    if (mention_status) {
        $('#_chatppMentionText').attr('aria-label', 'Click to disable Mention Feature');
        div.addClass('emoticonTextEnable');
    } else {
        $('#_chatppMentionText').attr('aria-label', 'Click to enable Mention Feature');
        div.removeClass('emoticonTextEnable');
    }
}

function updateShortcutText() {
    var shortcut_text = 'S: ' + (shortcut_status ? 'ON' : 'OFF');
    var div = $('#chatppShortcutText');
    div.html(shortcut_text);
    if (shortcut_status) {
        $('#_chatppShortcutText').attr('aria-label', 'Click to disable Shortcut Feature');
        div.addClass('emoticonTextEnable');
    } else {
        $('#_chatppShortcutText').attr('aria-label', 'Click to enable Shortcut Feature');
        div.removeClass('emoticonTextEnable');
    }
}

function getSecretEmos() {
    return [
        {"key": "(ngotlong)", "regex": "\\(ngotlong\\)", "src": "ngotlong.png"},
        {"key": "(chatpp)", "regex": "\\(chatpp\\)", "src": "chatpp.png"}
    ];
}

function toggleEmoticonsStatus() {
    if (emoticon_status) {
        removeExternalEmo();
    } else {
        addExternalEmo();
    }
}

function toggleMentionStatus() {
    mention_status = mention_status !== true;
    updateMentionText();
}

function toggleShortcutStatus() {
    shortcut_status = shortcut_status !== true;
    if (shortcut_status) {
        registerShortcut()
    } else {
        removeRegisteredKeyboardShortcut();
    }
    updateShortcutText();
}

function disableChatpp() {
    removeEmoticonText();
    removeMentionText();
    removeShortcutText();
    removeAdvertisement();
    removeExternalEmo();
}

function enableChatpp() {
    addEmoticonText();
    addMentionText();
    addShortcutText();
    addAdvertisement();
    addExternalEmo();
}

function reloadEmoticions() {
    removeExternalEmo();
    console.log('Old emoticons removed');
    addExternalEmo();
    console.log('New emoticons removed');
    setEmoticonTextLabel();
}