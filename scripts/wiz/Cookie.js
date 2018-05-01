'use strict';
var Wiz = Wiz || {};
Wiz.Cookie = {
    setCookies: function(url, name, value, expireSecond) {
        //var exdate = new Date();
        var param = {
            url : url,
            name : name,
            value : value,
            path: '/'
        };
        if (!!expireSecond) {
            param.expirationDate = new Date().getTime() / 1000 + expireSecond;
        }
        chrome.cookies.set(param, function(cookie) {});
    },
    getCookies: function(url, key, callback, isAutoDelay, params) {
        chrome.cookies.get({
            url : url,
            name : key
        }, function(cookies) {
            if (cookies && cookies.value && isAutoDelay) {
                //自动延长cookie时间
                Wiz.Cookie.setCookies(url, key, cookies.value, Wiz.Constant.COOKIE.EXPIRE);
            }
            if (params) {
                callback(cookies, params);
            } else {
                callback(cookies);
            }
        });
    },
    removeCookies: function(url, key, callback) {
        chrome.cookies.remove({
            url : url,
            name : key
        }, callback);
    }
};
