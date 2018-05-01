// 'use strict';
window.onload = function () {

    function getChromeVersion() {
        var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

        return raw ? parseInt(raw[2], 10) : false;
    }

    function showView(data) {
        if (data && data.code === 200) {
            var port = chrome.extension.connect({
                name: 'setPreviewByPopup'
            });
            port.onMessage.addListener(function (data) {
                $('#wiz_login').hide();
            });

        } else {
            PopupView.showLogin();
        }
    }


    function wizPopupInitialize() {
        var port = chrome.extension.connect({
            name: 'getUserInfo'
        });
        port.onMessage.addListener(showView);
    }

    // TODO: 放入PopupView中
    function initPopupPage() {
        $('#waiting-label').html(chrome.i18n.getMessage('popup_wating'));

        //login page
        $('#userId').attr("placeholder", chrome.i18n.getMessage('user_id_tip'));
        $('#password').attr("placeholder", chrome.i18n.getMessage('password_tip'));
        $('#keep_password_tip').html(chrome.i18n.getMessage('keep_password_tip'));
        $('#login_button').html(chrome.i18n.getMessage('login_msg'));

        //note info page
        $('#note_title_tip').html(chrome.i18n.getMessage('note_title_tip'));
        $('#category_tip').html(chrome.i18n.getMessage('category_tip'));
        $('#refresh_category_btn').html(chrome.i18n.getMessage('refresh'));

        //tag info
        $('#tag-name').html(chrome.i18n.getMessage('tag_tip'));

        //submit type
        $('#article').html(chrome.i18n.getMessage('article_save'));
        $('#fullPage').html(chrome.i18n.getMessage('fullpage_save'));
        $('#selection').html(chrome.i18n.getMessage('select_save'));
        $('#url').html(chrome.i18n.getMessage('url_save'));

        //comment area
        $('#comment_tip').html(chrome.i18n.getMessage('comment_tip'));
        $('#comment-info').attr('placeholder', chrome.i18n.getMessage('add_comment'));

        $('#save_to_server').html(chrome.i18n.getMessage('save_to_server'));

        //默认文件夹
        $('#category_info').html('/' + chrome.i18n.getMessage('MyNotes') + '/').attr('location', '/My Notes/');

        var port = chrome.runtime.connect({
            name: 'getWebClientUrl'
        });
        port.onMessage.addListener(function(url) {
            $('.header_logo').on('click', function () {
                window.open(url);
            });
        });


    }

    initPopupPage();
    var clipPageControl = new ClipPageControl();
    var loginControl = new LoginControl();
    loginControl.initCreateAccountLink();

    //保证popup页面和preview页面同时关闭
    chrome.extension.connect({
        name: 'popupClosed'
    });

    wizPopupInitialize();
};


