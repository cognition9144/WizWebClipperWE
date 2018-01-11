'use strict';
var Wiz = Wiz || {};
Wiz.Browser = {
    onRequest : function(){
        try {
//            console.log('Wiz.Browse() onRequest(): ');
//            console.log(arguments);
            return browser.runtime.onMessage;
        } catch (err) {
            console.log('Wiz.Browser onRequest() Error : ' + err);
        }
    },
    sendRequest : function (tabId, params, callback) {
        try {
//            console.log('Wiz.Browser() sendRequest(): ');
//            console.log(arguments);
            // if (browser.tabs.sendMessage) {
            try {
                // Chrome 45 bug， 如果不加 frameId 则会导致 消息发给所有的 tab
                // throws on Chrome prior to 41
                browser.tabs.sendMessage(tabId, params, {frameId: 0}, callback);
            } catch(e) {
                browser.tabs.sendMessage(tabId, params, callback);
            }
            // } else {
            //     browser.tabs.sendMessage(tabId, params, callback);
            // }
//            return (browser.tabs.sendMessage) ? (browser.tabs.sendMessage) : (browser.tabs.sendMessage);
        } catch (err) {
            console.log('Wiz.Browser sendMessage() Error : ' + err);
        }
    }
};
