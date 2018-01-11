//// 将选项保存在 browser.storage 中。
//function save_options() {
//    var color = document.getElementById('color').value;
//    var likesColor = document.getElementById('like').checked;
//    browser.storage.sync.set({
//        favoriteColor: color,
//        likesColor: likesColor
//    }, function() {
//        // 更新状态，告诉用户选项已保存。
//        var status = document.getElementById('status');
//        status.textContent = '选项已保存。';
//        setTimeout(function() {
//            status.textContent = '';
//        }, 750);
//    });
//}
//
//// 从保存在 browser.storage 中的首选项恢复选择框和复选框状态。
//function restore_options() {
//    // 使用默认值 color = 'red' 和 likesColor = true 。
//    browser.storage.sync.get({
//        favoriteColor: 'red',
//        likesColor: true
//    }, function(items) {
//        document.getElementById('color').value = items.favoriteColor;
//        document.getElementById('like').checked = items.likesColor;
//    });
//}
//document.addEventListener('DOMContentLoaded', restore_options);
//document.getElementById('save').addEventListener('click',
//    save_options);


$(function () {

    var optionsHttpsObj = $('#options-protocol-https');
    var optionsHttpObj = $('#options-protocol-http');
    var defaultOptions = {
        protocol: 'https:'
    };

    function localize() {
        $('head title').html(browser.i18n.getMessage('options_title'));
        $('#options-title').html(browser.i18n.getMessage('WizNote'));
        $('.options-name').each(function() {
            $(this).html(browser.i18n.getMessage('options'));
        });
        $('.options-about').each(function() {
            $(this).html(browser.i18n.getMessage('about'));
        });
        $('#options-protocol-title').html(browser.i18n.getMessage('protocol'));
        $('#options-protocol-tip').html(browser.i18n.getMessage('protocol_tip'));
    }

    function restoreOptions(options) {
        browser.storage.sync.get(options, function(items) {
            var isHttps = items.protocol === 'https:';
            optionsHttpsObj[0].checked = isHttps;
            optionsHttpObj[0].checked = !isHttps;
        });
    }

    function onChangeProtocol() {
        var protocol = optionsHttpsObj[0].checked ? 'https:' : 'http:';
        browser.storage.sync.set({
            protocol: protocol
        }, function() {
            browser.runtime.connect({
                name: 'updateProtocol'
            });
        });
    }

    function initEvent() {
        $('.menu a').click(function (ev) {
            ev.preventDefault();
            var selected = 'selected';

            $('.mainview > *').removeClass(selected);
            $('.menu li').removeClass(selected);
            setTimeout(function () {
                $('.mainview > *:not(.selected)').css('display', 'none');
            }, 100);

            $(ev.currentTarget).parent().addClass(selected);
            var currentView = $($(ev.currentTarget).attr('href'));
            currentView.css('display', 'block');
            setTimeout(function () {
                currentView.addClass(selected);
            }, 0);

            setTimeout(function () {
                $('body')[0].scrollTop = 0;
            }, 200);
        });
        $('.mainview > *:not(.selected)').css('display', 'none');

        //listen the checkbox event of save img to server
        optionsHttpsObj.on('click', onChangeProtocol);
        optionsHttpObj.on('click', onChangeProtocol);
    }
    function init() {
        localize();
        initEvent();
        restoreOptions(defaultOptions);
    }
    init();
});
