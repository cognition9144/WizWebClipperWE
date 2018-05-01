// 'use strict';
window.onload = function () {

    function getChromeVersion() {
        var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

        return raw ? parseInt(raw[2], 10) : false;
    }

    function showView(data) {
        if (data && data.code === 200) {
            var port = browser.runtime.connect({
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
        var port = browser.runtime.connect({
            name: 'getUserInfo'
        });
        port.onMessage.addListener(showView);
    }

    // TODO: 放入PopupView中
    function initPopupPage() {
        $('#waiting-label').html(browser.i18n.getMessage('popup_wating'));

        //login page
        $('#userId').attr("placeholder", browser.i18n.getMessage('user_id_tip'));
        $('#password').attr("placeholder", browser.i18n.getMessage('password_tip'));
        $('#keep_password_tip').html(browser.i18n.getMessage('keep_password_tip'));
        $('#login_button').html(browser.i18n.getMessage('login_msg'));

        //note info page
        $('#note_title_tip').html(browser.i18n.getMessage('note_title_tip'));
        $('#category_tip').html(browser.i18n.getMessage('category_tip'));
        $('#refresh_category_btn').html(browser.i18n.getMessage('refresh'));

        //tag info
        $('#tag-name').html(browser.i18n.getMessage('tag_tip'));

        //submit type
        $('#article').html(browser.i18n.getMessage('article_save'));
        $('#fullPage').html(browser.i18n.getMessage('fullpage_save'));
        $('#selection').html(browser.i18n.getMessage('select_save'));
        $('#url').html(browser.i18n.getMessage('url_save'));

        //comment area
        $('#comment_tip').html(browser.i18n.getMessage('comment_tip'));
        $('#comment-info').attr('placeholder', browser.i18n.getMessage('add_comment'));

        $('#save_to_server').html(browser.i18n.getMessage('save_to_server'));

        //默认文件夹
        $('#category_info').html('/' + browser.i18n.getMessage('MyNotes') + '/').attr('location', '/My Notes/');

        var port = browser.runtime.connect({
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
    browser.runtime.connect({
        name: 'popupClosed'
    });

    wizPopupInitialize();
};
