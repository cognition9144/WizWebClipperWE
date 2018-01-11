'use strict';
var Wiz = Wiz || {};

(function() {
    var _this = this;
    var CONST = Wiz.Constant;

    var autoLoginDoing = false,
        autoLoginCallback = [];

    function sendRequest (apiObj, params, callback, callError, options) {
        var _this = this;

        if (!params) {
            return;
        }
        if (!apiObj || !apiObj.url || !apiObj.action) {
            if (console) {
                console.error('remote.sendRequest apiObj: ' + apiObj.url + '-' + apiObj.action + ' Error');
            }
            return;
        }

        if (!apiObj.errCount) {
            apiObj.errCount = 0;
        }

        if (!callError) {
            callError = function (data, error) {
                callback(data, error);
                delete apiObj.errCount;
            };
        }
        // 统一在发送请求这一层处理，不用每个地方都处理
        var _callSuccess = function (data) {
            if (data && !data.code) {
                data.code = data.returnCode || data.return_code || data.err_code || data.error_code;
            }
            //token 失效直接拦截
            if (apiObj.errCount < CONST.API_COMMON.SERVER_ERROR_RETRY_TIMES &&
                !checkApi(apiObj.url, CONST.API.AUTO_LOGIN.url) && //非 自动登录 接口 才使用 自动登录
                !checkApi(apiObj.url, CONST.API.LOGIN.url) &&
                data && data.code === 301) {
                Wiz.Cookie.getCookies(CONST.COOKIE.HOST, CONST.COOKIE.AUTO_LOGIN_FLAG, function(cookie) {
                    if (cookie && cookie.value === 'true') {
                        Wiz.Remote.autoLogin(function (_data) {
                            if (_data && _data.code === 200) {
                                apiObj.errCount++;
                                sendRequest.apply(_this, [apiObj, params, callback, callError, options]);
                            } else {
                                delete apiObj.errCount;
                                callback(data);
                            }

                        });
                    } else {
                        delete apiObj.errCount;
                        callback(data);
                    }
                }, true);
            } else if (!data && apiObj.errCount < CONST.API_COMMON.SERVER_ERROR_RETRY_TIMES) {
                reTryCall();

            } else {
                delete apiObj.errCount;
                callback(data);
            }
        };
        var _callError = function (jqXHR, status, error) {
            if ('abort' === status) {
                // 手动停掉的不做任何
                return;
            }

            if (apiObj.errCount < CONST.API_COMMON.SERVER_ERROR_RETRY_TIMES) {
                reTryCall();
                return;
            }

            // handlerJqueryAjaxError(jqXHR, status, error);
            callError(null, JSON.stringify(jqXHR));
            delete apiObj.errCount;
        };
        var reTryCall = function () {
            setTimeout(function () {
                apiObj.errCount++;
                sendRequest.apply(_this, [apiObj, params, callback, callError, options]);
            }, CONST.API_COMMON.SERVER_ERROR_RETRY_TIME);
        };
        var url = apiObj.url;//options ? (apiObj.url + '/' + options) : apiObj.url;
        var tmpParams = [];
        if (apiObj.action.toLowerCase() === 'delete') {
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    tmpParams.push(key + '=' + encodeURIComponent(params[key]));
                }
            }
            if (tmpParams.length > 0) {
                url += (url.indexOf('?') > -1 ? '&' : '?') + tmpParams.join('&');
                params = {};
            }
        }
        setTimeout(function () {
            var data = params;
            var contentType;
            if (apiObj.sendDataType === 'json') {
                data = JSON.stringify(data);
                contentType = 'application/json; charset=utf-8';
            }
            var ajaxOptions = {
                url: url,
                data: data,
                dataType: 'json',
                type: apiObj.action,
                async: apiObj.async !== false,
                success: _callSuccess,
                error: _callError,
                cache: false
            };
            if (contentType) {
                ajaxOptions.contentType = contentType;
            }
            $.ajax(ajaxOptions);
        }, 0);
    }

    function checkApi(urlTarget, urlSrc) {
        if (!urlTarget || !urlSrc) {
            return false;
        }
        var index = urlSrc.indexOf('/:');
        if (index >= 0) {
            urlSrc = urlSrc.substr(0, index);
        }
        return urlTarget.indexOf(urlSrc) === 0;
    }

    /**
     * 统一处理接口的 url
     * @param url
     * @param params
     * @returns {*}
     */
    function initApiUrl (url, params) {
        var reg = /(\/|\=)(:([^/?&]*))/g;
        var match, paramKeys = {};
        while ((match = reg.exec(url)) !== null) {
            paramKeys[match[2]] = match[3];
        }
        var key, value;
        for (key in paramKeys) {
            if (paramKeys.hasOwnProperty(key)) {
                value = paramKeys[key];
                url = url.replace(key, params[value]);
            }
        }
        url = Wiz.Remote.utils.setUrlParams(url, {
            clientType: CONST.API_COMMON.CLIENT_TYPE,
            clientVersion: CONST.API_COMMON.CLIENT_VERSION,
            apiVersion: CONST.API_COMMON.API_VERSION,
            lang: browser.i18n.getUILanguage()
        });
        return url;
    }

    Wiz.Remote = {
        autoLogin: function (callback) {
            autoLoginCallback.push(callback);
            if (autoLoginDoing) {
                return;
            }

            function _callback (data) {
                autoLoginDoing = false;
                if (data && data.code === 200) {
                    // data.result.token
                    while (autoLoginCallback.length > 0) {
                        autoLoginCallback.shift().call(_this, data);
                    }
                } else {
                    autoLoginCallback.shift().call(_this, data);
                }
                autoLoginCallback = [];
            }

            autoLoginDoing = true;
            sendRequest({
                url: initApiUrl(CONST.API.AUTO_LOGIN.url, {}),
                action: CONST.API.AUTO_LOGIN.action
            }, {}, _callback);
        },
        getAPI: function(params, callback) {
            sendRequest({
                url: initApiUrl(CONST.Default.PROTOCOL + CONST.API.API_URL.url, {
                    protocol: CONST.Default.PROTOCOL.replace(':', '')
                }),
                action: CONST.API.API_URL.action,
                async: false
            }, params, callback);
        },
        getCategory: function(params, callback) {
            sendRequest({
                url: initApiUrl(CONST.API.GET_CATEGORY.url, {
                    kbGuid: params.kbGuid
                }),
                action: CONST.API.GET_CATEGORY.action
            }, params, callback);
        },
        getSaveStatus: function(params, callback) {
            sendRequest({
                url: initApiUrl(CONST.API.GET_SAVE_STATUS.url, {}),
                action: CONST.API.GET_SAVE_STATUS.action
            }, params, callback);
        },
        getTag: function(params, callback) {
            sendRequest({
                url: initApiUrl(CONST.API.GET_TAG.url, {
                    kbGuid: params.kbGuid
                }),
                action: CONST.API.GET_TAG.action
            }, params, callback);
        },
        getUserInfo: function(params, callback) {
            sendRequest({
                url: initApiUrl(CONST.API.GET_USER_INFO.url, {}),
                action: CONST.API.GET_USER_INFO.action
            }, params, callback);
        },
        login: function(params, callback) {
            sendRequest({
                url: initApiUrl(CONST.API.LOGIN.url, {}),
                action: CONST.API.LOGIN.action,
                sendDataType: CONST.API.LOGIN.sendDataType
            }, params, callback);
        },
        logout: function (params, callback) {
            sendRequest({
                url: initApiUrl(CONST.API.LOGOUT.url, {}),
                action: CONST.API.LOGOUT.action
            }, {}, callback);
        },
        saveToServer: function(params, callback) {
            sendRequest({
                url: initApiUrl(CONST.API.SAVE_TO_SERVER.url, {}),
                action: CONST.API.SAVE_TO_SERVER.action,
                sendDataType: CONST.API.SAVE_TO_SERVER.sendDataType
            }, params, callback);
        },
        utils: {
            setUrlParams: function (url, params) {
                var splitCh = '?';
                if (url.indexOf('?') > -1) {
                    splitCh = '&';
                }
                url = url.replace('?', '?&');
                var k, v, q = [], reg;
                for (k in params) {
                    if (params.hasOwnProperty(k)) {
                        reg = new RegExp('&' + k + '=[^&]*', 'ig');
                        url = url.replace(reg, '');
                        v = params[k];
                        if (v !== null && v !== undefined && v !== '') {
                            q.push(splitCh, k, '=', encodeURIComponent(params[k]));
                            splitCh = '&';
                        }
                    }
                }
                url = url.replace('?&', '?');
                return url + q.join('');
            }
        }
    };
})();
