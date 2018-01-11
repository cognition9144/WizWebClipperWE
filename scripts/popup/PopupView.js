'use strict';
var PopupView = {
    changeSubmitDisplayByType : function() {
    },
    showCategoryTreeFromLoading : function() {
        PopupView.hideCategoryLoading();
        PopupView.switchCategoryTreeVisible(true);
    },
    showCategoryLoading : function(msg) {
        var categoryLoading = $('#category_loading');
        categoryLoading.show();
    },
    hideCategoryLoading : function() {
        $('#category_loading').hide();
    },
    showClipFailure : function(msg) {
        var errPageTip = $('#errorpage_tip');
        $('#waiting_div').hide();
        errPageTip.show();
//        $('#errorpage_tip label').html(msg);
        errPageTip.find('label').html(msg);
    },
    showLoginError : function(msg) {
        $('#wiz_login').show();
        $('#wiz_clip_detail').hide();
        $('#div_error_validator').html(msg);
        $('#waiting').hide();
    },
    showWaiting : function(msg) {
        $('#waiting').show();
        $('#waiting-label').html(msg);
        $('#wiz_login').hide();
        $('#wiz_clip_detail').hide();
    },
    showLogin : function() {
        $("#waiting").hide();
        $("#wiz_login").show();
        $('#loginoff_div').show();
        $('#userId').focus();
        $("#wiz_clip_detail").hide();
    },
    hideCategoryTreeAfterSelect : function(display) {
        $("#category_info").html(display);
        $("#ztree_container").removeClass('active');
    },
    hideCreateDiv : function() {
        $('#waiting_div').hide();
    },
    hideLogoffDiv: function () {
        $('#loginoff_div').hide();
    },
    switchCategoryTreeVisible: function (isActive) {
        var ztreeContainer = $('#ztree_container');

        if (ztreeContainer.hasClass('first')) {
            //初次加载时，不展开
            ztreeContainer.removeClass('first');
        } else if (!isActive && ztreeContainer.hasClass('active')) {
            ztreeContainer.removeClass('active');
        } else {
            ztreeContainer.addClass('active');
        }
    }
};