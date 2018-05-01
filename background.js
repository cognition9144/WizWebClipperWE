'use strict';

var Wiz_Context = {};

(function () {
    var CONST = Wiz.Constant;
    var expiredays = CONST.COOKIE.EXPIRE;

    initWizContext();

    var _data = {
        // 专门用于获取 tag category这种数据
        getLocalStorage: function (dataName, timeName, overTime) {
            var localStr = localStorage[dataName],
                storedTimeStr = localStorage[timeName],
                storedTime = new Date(parseInt(storedTimeStr)).valueOf() || 0,
                nowTime = new Date(),
                // 是否过期
                isOverTime = ((nowTime - storedTime) / 1000 >= overTime);

            if (isOverTime || !localStr || localStr.length < 1) {
                return "";
            } else {
                return localStr;
            }
        },
        getCategory: function (port) {
            if (!port) {
                return;
            }

            var categoryStr = _data.getLocalStorage(CONST.COOKIE.CATEGORY,
                CONST.COOKIE.CATEGORY_TIME,
                CONST.COOKIE.EXPIRE_CATEGORY);
            if (categoryStr && port.name !== 'requestCategoryForce') {
                port.postMessage(categoryStr);
                return;
            }
            Wiz.Remote.getCategory({
                kbGuid: Wiz_Context.kbGuid
            }, function (data, error) {
                handler.onGetCategory(data, error, port);
            });
        },
        getSaveStatus: function (id, docGuid, title) {
            if (Wiz_Context.queryTime >= Wiz_Context.queryTimeArray.length) {
                return false;
            }
            var params = {
                id: id,
                custom_id: docGuid
            };
            Wiz.Remote.getSaveStatus(params, function (data, error) {
                handler.onGetSaveStatus(data, error, id, docGuid, title);
            });
        },
        getTag: function (port) {
            if (!port) {
                return;
            }

            var tagStr = _data.getLocalStorage(CONST.COOKIE.TAG,
                CONST.COOKIE.TAG_TIME,
                CONST.COOKIE.EXPIRE_TAG);
            if (tagStr) {
                port.postMessage(tagStr);
                return;
            }

            Wiz.Remote.getTag({
                kbGuid: Wiz_Context.kbGuid
            }, function (data, error) {
                handler.onGetTag(data, error, port);
            });
        },
        getUserInfo: function (port) {
            initWizContext();
            Wiz.Remote.getUserInfo({}, function (data, error) {
                handler.onGetUserInfo(data, error, port);
            });
        },
        login: function (params, port, callback) {
            initWizContext();
            //缓存userid
            Wiz_Context.userId = params.userId;
            Wiz.Remote.login(params, function (data, error) {
                handler.onLogin(data, error, port, callback);
            });
        },
        logout: function (port) {
            initWizContext();
            clearStorage();
            Wiz.Remote.logout({}, function () {
                Wiz.Cookie.removeCookies(CONST.COOKIE.HOST, CONST.COOKIE.TOKEN);
                Wiz.Cookie.removeCookies(CONST.COOKIE.HOST, CONST.COOKIE.AUTO_LOGIN_FLAG);
                Wiz.Cookie.removeCookies(CONST.COOKIE.HOST, CONST.COOKIE.AUTO_LOGIN_PARAMS);
                port.postMessage({});
            });
        },
        saveToServer: function (info) {
            // console.log('info.title:' + info.title);
            var docGuid = genGuid();
            var coefficient;

            info.params = "myWiz='" + Wiz_Context.userGuid + "@userguid' SaveResources='true' document_guid='" + docGuid + "' " + info.params;
            var params = {
                type: 'clipper',
                data: info.params,
                customId: docGuid
            };

            //根据剪辑内容大小来设置等待时间
            coefficient = info.params.length / 102400;

            //显示正在剪辑
            browser.notifications.create(docGuid + '_clipping', {
                type: "basic",
                title: info.title,
                message: browser.i18n.getMessage('clipResult_clipping'),
                iconUrl: "images/scissors.png"
            }, function (notificationId) {
            });
            Wiz.Remote.saveToServer(params, function(data, error) {
                handler.onSaveToServer(data, error, docGuid, info.title, coefficient);
            });
        },
        saveUserInfo: function () {
            var isChangeUser = true;
            var lastUser = localStorage[Wiz.Constant.LOCAL_STORAGE.USER];
            if (lastUser) {
                try {
                    lastUser = JSON.parse(lastUser);
                    isChangeUser = lastUser.guid !== Wiz_Context.userGuid;
                } catch (e) {
                }
            }

            if (isChangeUser) {
                clearStorage();
            }

            localStorage[Wiz.Constant.LOCAL_STORAGE.USER] = JSON.stringify({
                name: Wiz_Context.userName,
                id: Wiz_Context.userId,
                guid: Wiz_Context.userGuid
            });
        }
    };

    var handler = {
        onConnectListener: function (port) {
            // console.log('-------onConnectListener----');
            // console.log(port);
            var name = port.name;
            if (!name) {
                return;
            }
            switch (name) {
                case 'getUserInfo':
                    _data.getUserInfo(port);
                    break;
                case 'getWebClientUrl':
                    port.postMessage(CONST.Default.WEBCLIENT_URL);
                    break;
                case 'getRegisterUrl':
                    port.postMessage(CONST.Default.REGISTER_URL);
                    break;
                case 'login':
                    port.onMessage.addListener(_data.login);
                    break;
                case 'logout':
                    _data.logout(port);
                    break;
                case 'onKeyDownAtPreview':
                    port.onMessage.addListener(function (msg) {
                        var direction = msg.direction;
                        getCurTab(handler.onKeyDownAtPreview, direction);
                    });
                    break;
                case 'popupClosed':
                    port.onDisconnect.addListener(function () {
                        getCurTab(handler.onPopupClosed);
                    });
                    break;
                case 'requestCategory':
                    _data.getCategory(port);
                    break;
                case 'requestCategoryForce':
                    _data.getCategory(port);
                    break;
                case 'requestTag':
                    _data.getTag(port);
                    break;
                case 'retryClip':
                    //不自动增加cookie时间
                    port.onMessage.addListener(function (info) {
                        if (info && info.title && info.params) {
                            _data.saveToServer(info);
                        }
                    });
                    break;
                case 'saveDocument':
                    port.onMessage.addListener(function (info) {
                        //console.log(info);
                        if (!info) {
                            return;
                        }

                        if (!info.title || !info.params) {
                            return;
                        }
                        //登录成功后保存
                        _data.saveToServer(info);
                    });
                    break;
                case 'setPreviewByClipPage':
                    port.onMessage.addListener(function (op) {
                        if (!op) {
                            return;
                        }
                        getCurTab(setPreview, op);
                    });
                    break;
                case 'setPreviewByPopup':
                    //页面初始化请求，需要返回是否已登录
                    getCurTab(setPreview);
                    port.postMessage({});
                    break;
                case 'updateProtocol':
                    getOpenApiUrl();
                    break;
            }
        },
        onGetCategory: function (data, error, port) {
            var categoryList = [], categoryPos, location, parentLocation,
                locationList = [], locationStr,
                i, nameList, name,
                result;
            if (data && data.code === 200) {
                categoryPos = data.pos;
                for (i = 0; i < data.result.length; i++) {
                    location = data.result[i];
                    nameList = location.replace(/(^\/)|(\/$)/g, '').split('/');
                    if (nameList.length === 1) {
                        parentLocation = '/';
                        name = nameList[0];
                    } else {
                        name = nameList.splice(nameList.length - 1, 1)[0];
                        parentLocation = '/' + nameList.join('/') + '/';
                    }
                    categoryList.push({
                        name: name,
                        location: location,
                        position: categoryPos[location] || null
                    });
                }
                categoryList.sort(function (a, b) {
                    if (a.position !== null && b.position !== null) {
                        return a.position - b.position;
                    } else if (b.position !== null) {
                        return 1;
                    } else if (a.position !== null) {
                        return -1;
                    }
                    // 如果没有顺序信息，则直接通过名称排序
                    return a.name.localeCompare(b.name);
                });

                for (i = 0; i < categoryList.length; i++) {
                    locationList.push(categoryList[i].location);
                }
                locationStr = locationList.join('*');
                localStorage[CONST.COOKIE.CATEGORY] = locationStr;
                localStorage[CONST.COOKIE.CATEGORY_TIME] = new Date().valueOf().toString();
                result = locationStr;
            } else {
                localStorage.removeItem(CONST.COOKIE.CATEGORY);
                localStorage.removeItem(CONST.COOKIE.CATEGORY_TIME);
                result = {
                    code: data ? data.code : -1
                };
            }

            if (port) {
                try {
                    port.postMessage(result);
                } catch (_err) {
                    console.log('_data.login Error: ' + _err);
                }
            }
        },
        onGetSaveStatus: function (data, error, id, docGuid, title) {
            if (data && data.code === 200) {
                var message;
                var status = +data.status;
                if (status >= 0) {
                    // 剪辑完成
//                console.log('docGuid:' + docGuid + ' title:' + title + ' message' + browser.i18n.getMessage('clipResult_success'));
                    //清除正在剪辑任务
                    if (status === 0) {
                        message = browser.i18n.getMessage('clipResult_success');
                    } else if (status === 101) {
                        message = browser.i18n.getMessage('save_image_to_server_fail');
                    }
                    browser.notifications.clear(docGuid + '_clipping', function () {
                    });
                    browser.notifications.create(docGuid + '_success', {
                        "type": "basic",
                        "title": title,
                        "message": message,
                        "iconUrl": "images/check.png",
                        "buttons": [{
                            "title": browser.i18n.getMessage('clipResult_webclient'),
                            "iconUrl": 'images/wiz-clipper-16.png'
                        }]
                    }, function (notificationId) {
                    });
                } else if (data.status === 'doing' || data.status === 'new') {
                    // 任务正在队列中
                    Wiz_Context.queryTime++;
                    setTimeout(function () {
                        _data.getSaveStatus(id, docGuid, title);
                    }, Wiz_Context.queryTimeArray[Wiz_Context.queryTime] * 1000);
                } else {
                    // 剪辑失败
                    browser.notifications.clear(docGuid + '_clipping', function () {
                    });
                    browser.notifications.create(Wiz_Context.kbGuid + '_error', {
                        type: "basic",
                        title: title,
                        message: browser.i18n.getMessage('clipResult_error'),
                        iconUrl: "images/warning.png"
                    }, function (notificationId) {
                    });
                }
            } else {
                console.log('getSaveStatus error');
            }
        },
        onGetTag: function (data, error, port) {
            var tagList, tagNameList = [], i;
            if (data && data.code === 200) {
                tagList = data.result;
                for (i = 0; i < tagList.length; i++) {
                    tagNameList.push(tagList[i].name);
                }
                localStorage[CONST.COOKIE.TAG] = tagNameList.join(',');
                localStorage[CONST.COOKIE.TAG_TIME] = new Date().valueOf().toString();
            } else {
                localStorage.removeItem(CONST.COOKIE.TAG);
                localStorage.removeItem(CONST.COOKIE.TAG_TIME);
            }

            if (port) {
                try {
                    port.postMessage({
                        code: data ? data.code : -1
                    });
                } catch (_err) {
                    console.log('_data.login Error: ' + _err);
                }
            }
        },
        onGetUserInfo: function (data, error, port) {
            if (data && data.code === 200) {
                Wiz_Context.kbGuid = data.result.kbGuid;
                Wiz_Context.userGuid = data.result.userGuid;
                Wiz_Context.userId = data.result.userId;
                Wiz_Context.userName = data.result.displayname;
                _data.saveUserInfo();

            } else {
                initWizContext();
            }

            if (port) {
                try {
                    port.postMessage({
                        code: data ? data.code : -1,
                        userName: Wiz_Context.userName
                    });
                } catch (_err) {
                    console.log('_data.login Error: ' + _err);
                }
            }

        },
        onKeyDownAtPreview: function (tab, direction) {
            if (!tab) {
                return;
            }
            Wiz.Browser.sendRequest(tab.id, {
                name: 'preview',
                op: 'keydown',
                opCmd: direction
            });
        },
        onLogin: function (data, error, port, callback) {
            var errMsg;

            if (!data || data.code !== 200) {
                if (port) {
                    errMsg = (data && data.code) ? {code: data.code} : error;
                    try {
                        port.postMessage(errMsg);
                    } catch (_err) {
                        console.log('_data.login Error: ' + _err);
                    }
                }
                initWizContext();
                return;
            }

            //console.log(responseJSON);
            var token = data.result.token;

            Wiz_Context.kbGuid = data.result.kbGuid;
            Wiz_Context.userGuid = data.result.user.userGuid;
            Wiz_Context.userId = data.result.user.userId;
            Wiz_Context.userName = data.result.user.displayName;
            _data.saveUserInfo();

            if (data.wizAutoLoginEnabled) {
                Wiz.Cookie.setCookies(CONST.COOKIE.HOST,
                    CONST.COOKIE.AUTO_LOGIN_FLAG,
                    data.wizAutoLoginEnabled.toString(), expiredays);
                Wiz.Cookie.setCookies(CONST.COOKIE.HOST,
                    CONST.COOKIE.AUTO_LOGIN_PARAMS,
                    data.wizAutoLoginParams, expiredays);
            } else {
                Wiz.Cookie.removeCookies(CONST.COOKIE.HOST, CONST.COOKIE.AUTO_LOGIN_FLAG);
                Wiz.Cookie.removeCookies(CONST.COOKIE.HOST, CONST.COOKIE.AUTO_LOGIN_PARAMS);
            }

            // 必须要先删除 cookie，否则有可能会跟其他域名创建的 token 冲突，导致页面内有两个 token 的 cookie
            Wiz.Cookie.removeCookies(CONST.COOKIE.HOST, CONST.COOKIE.TOKEN);
            Wiz.Cookie.setCookies(CONST.COOKIE.HOST, CONST.COOKIE.TOKEN, token, expiredays);

            if (port) {
                try {
                    port.postMessage({
                        code: data.code
                    });
                } catch (_err) {
                    console.log('_data.login Error: ' + _err);
                }

                getCurTab(setPreview);
                if (callback) {
                    callback(port);
                }
            }
        },
        onPopupClosed: function (tab) {
            if (!tab) {
                return;
            }
            Wiz.Browser.sendRequest(tab.id, {
                name: 'preview',
                op: 'clear'
            });
        },
        /**
         *请求剪辑页面回调函数
         */
        onPreviewCallback: function (option) {
            if (!option) {
                //当前页面无法剪辑
                browser.runtime.connect({
                    'name': 'pagePreviewFailure'
                });
            }
        },
        onPreviewSubmitCallback: function (option) {
            //要等页面完全加载后，右键点击仍然无返回，提示无法剪辑
            if (!option && Wiz_Context.tab.status === 'complete') {
                var pageClipFailure = browser.i18n.getMessage('pageClipFailure');
                alert(pageClipFailure);
            }
        },
        onSaveToServer: function (data, error, docGuid, title, coefficient) {
            if (data && data.code === 200) {
                Wiz_Context.queryTime = 0;
                //发送成功，开始轮询服务器查询状态
                setTimeout(function () {
                    _data.getSaveStatus(data.id, data.custom_id, title);
                }, Wiz_Context.queryTimeArray[Wiz_Context.queryTime] * 1000 * coefficient);
            } else {
                // 请求失败
                setTimeout(function () {
                    browser.notifications.clear(docGuid + '_clipping', function () {
                    });
                    browser.notifications.create(docGuid + '_error', {
                        type: "basic",
                        title: title,
                        message: browser.i18n.getMessage('clipResult_error'),
                        iconUrl: "images/warning.png"
                    }, function () {
                    });
                }, 5000);
            }
        }
    };

    function initWizContext() {
        Wiz_Context = {
            tab: null,
            userGuid: '',
            userId: null,
            userName: '',
            queryTime: 0,  // 当前轮询次数
            queryTimeArray: CONST.Service.QUERY_TIME_ARRAY,
            cookies: null
        };
    }

    function clearStorage() {
        localStorage.clear();
    }

    /**
     *获取当前页面的tab信息
     */
    function getCurTab(callback, params) {
        browser.tabs.query({active: true, currentWindow: true}, function (tabs) {
            Wiz_Context.tab = tabs[0];
            callback(tabs[0], params);
        });
    }

    function genGuid() {
        return (genGuidItem() + genGuidItem() + "-" + genGuidItem() + "-" + genGuidItem() + "-" + genGuidItem() + "-" + genGuidItem() + genGuidItem() + genGuidItem());
    }
    function genGuidItem() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    function setPreview(tab, op) {
        if (!tab) {
            return;
        }

        //默认为文章
        op = op || 'article';
        Wiz.Browser.sendRequest(tab.id, {
            name: 'preview',
            op: op
        }, handler.onPreviewCallback);
    }

    //var authenticationErrorMsg = browser.i18n.getMessage('AuthenticationFailure');

    var onButtonClickedCallback = function (notificationId, buttonIndex) {
        var index = notificationId.indexOf('_success');
        if (index > -1) {
            browser.tabs.create({url: Wiz_Context.COOKIE.HOST + '?kb=' + Wiz_Context.kbGuid + '&dc=' + notificationId.substring(0, index)}, function () {
            });
        }
    };
    browser.notifications.onButtonClicked.addListener(onButtonClickedCallback);

    function wizSavePageContextMenuClick(info, tab) {
        var type = 'fullPage';
        Wiz_Context.tab = tab;

        //判断是否用户手动选择
        if (info.selectionText) {
            type = 'selection';
        }

        info.title = tab.title;
        Wiz.Browser.sendRequest(tab.id, {
            name: 'preview',
            op: 'submit',
            info: info,
            type: type
        }, handler.onPreviewSubmitCallback);

            // var notification = Notification.createNotification(
            //     'images/wiz-clipper-16.png',
            //     browser.i18n.getMessage('extName'),
            //     browser.i18n.getMessage("note_login")
            // );
            // notification.show();
            // setTimeout(function () {
            //     notification.cancel();
            // }, 3000);

    }

    function wiz_initContextMenus() {
        var clipPageContext = browser.i18n.getMessage('contextMenus_clipPage'),
            allowableUrls = ['http://*/*', 'https://*/*'];

        browser.contextMenus.create({
            'title': clipPageContext,
            'contexts': ['all'],
            'documentUrlPatterns': allowableUrls,
            'onclick': wizSavePageContextMenuClick
        });
    }

// 从api.wiz.cn获取openapi地址
    function getOpenApiUrl() {
        browser.storage.sync.get({
            protocol: 'https:'
        }, function (items) {
            CONST.Default.PROTOCOL = items.protocol;
            Wiz.Remote.getAPI({}, function(data, error) {
                if (data && !error) {
                    CONST.API.AUTO_LOGIN.url = data.autoLogin;
                    CONST.API.GET_CATEGORY.url = data.getCategory;
                    CONST.API.GET_SAVE_STATUS.url = data.getSaveStatus;
                    CONST.API.GET_TAG.url = data.getTag;
                    CONST.API.GET_USER_INFO.url = data.getUserInfo;
                    CONST.API.LOGIN.url = data.login;
                    CONST.API.LOGOUT.url = data.logout;
                    CONST.API.SAVE_TO_SERVER.url = data.saveToServer;

                    CONST.Default.WEBCLIENT_URL = data.webClient;
                    CONST.Default.REGISTER_URL = data.register;
                    return;
                }
                console.log('error: ' + error);
            });
        });
    }

    browser.runtime.onConnect.addListener(handler.onConnectListener);
    wiz_initContextMenus();

    // 初始化的时候获取一次
    setTimeout(function () {
        getOpenApiUrl();
    }, 300);

})();
