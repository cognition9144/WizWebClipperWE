'use strict';
var Wiz = Wiz || {};
Wiz.Constant = {
    Default : {
        DOC_CATEGORY: '/My Notes/',
        DOC_TITLE: 'no title',
        PROTOCOL: 'https:',
        WEBCLIENT_URL: 'https://note.wiz.cn/web',
        REGISTER_URL: 'https://note.wiz.cn/login?p=reg',

        PREVIEW_OVER_TIME_MS: 5000, // 30秒超时
        SAVE_TYPE: 'wiz-save-type'
    },
    COOKIE: {
        EXPIRE: 14 * 24 * 60 * 60,
        EXPIRE_CATEGORY: 24 * 60 * 60,
        EXPIRE_TAG: 10 * 60,

        HOST: 'http://note.wiz.cn',

        TOKEN: 'token',
        AUTO_LOGIN_FLAG: 'wizAutoLoginEnabled',
        AUTO_LOGIN_PARAMS: 'wizAutoLoginParams',
        CATEGORY: 'wiz-all-category',
        CATEGORY_LAST: 'wiz-last-category',
        CATEGORY_TIME: 'wiz-category-stored-time',
        TAG: 'wiz-all-tag',
        TAG_TIME: 'wiz-tag-stored-time',
    },
    LOCAL_STORAGE: {
        USER: 'wiz-clip-user-info',
    },

    Service: {
        QUERY_TIME_ARRAY: [5, 5, 10, 20, 20, 20, 20, 20, 20, 20]
    },

    API_COMMON: {
        API_VERSION: 10,
        CLIENT_TYPE: 'webclip_chrome',
        CLIENT_VERSION: '4.0.9',
        SERVER_ERROR_RETRY_TIME: 3 * 1000,
        SERVER_ERROR_RETRY_TIMES: 3
    },
    API : {
        API_URL: {
            url: '//api.wiz.cn/?p=wiz&c=webclipper_openapi_url&protocol=:protocol',
            action: 'get'
        },
        AUTO_LOGIN: {
            url: 'https://note.wiz.cn/as/user/login/auto',
            action: 'get'
        },
        GET_CATEGORY: {
            url: 'https://note.wiz.cn/ks/category/all/:kbGuid',
            action: 'get'
        },
        GET_SAVE_STATUS: {
            url: 'https://note.wiz.cn/ks/gather/status',
            action: 'get'
        },
        GET_TAG: {
            url: 'https://note.wiz.cn/ks/tag/all/:kbGuid',
            action: 'get'
        },
        GET_USER_INFO: {
            url: 'https://note.wiz.cn/as/user/info',
            action: 'get'
        },
        LOGIN: {
            // 先使用client_login方法登录
            url: 'https://note.wiz.cn/as/user/login',
            action: 'post',
            sendDataType: 'json'
        },
        LOGOUT: {
            url: 'https://note.wiz.cn/as/user/logout',
            action: 'get'
        },
        SAVE_TO_SERVER: {
            // 先使用client_login方法登录
            url: 'https://note.wiz.cn/ks/gather',
            action: 'post',
            sendDataType: 'json'
        },

        //
        // ACCOUNT_LOGIN: 'accounts.clientLogin',
        // ACCOUNT_KEEPALIVE: 'accounts.keepAlive',
        // ACCOUNT_GETOKEN: 'accounts.getToken',
        // GET_AllCATEGORIES: 'category.getAll',
        // GET_ALLTAGS: 'tag.getList',
        // DOCUMENT_POSTSIMPLE: 'document.postSimpleData'
    },
    ListenType : {
        SERVICE: 'wiz_service',
        CONTENT: 'wiz_content',
        POPUP: 'wiz_popup'
    }
};

//var cookieUrl = 'http://service.wiz.cn/web',
//    cookieName = 'wiz-clip-auth',
//    cookieExpiredays = 14 * 24 * 60 * 60,
//    updateClientUrl = 'http://blog.wiz.cn/wiz-faq-npapi.html';
//
//apiUrl: 'http://api.wiz.cn/?p=wiz&c=openapi_url',
//    openapiUrl : '',
//    betaUrl: 'http://note.wiz.cn',
//    cookieUrl : 'http://service.wiz.cn/web',
//    cookieName : 'wiz-clip-auth',
//    cookie_category: 'wiz-all-category',
//    cookie_category_time: 'wiz-category-stored-time',
//    category_expireSec:  10 * 60,