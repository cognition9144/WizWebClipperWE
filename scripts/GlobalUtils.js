/*
 This file is a collection of globally accessible utility functions. They're intended to be used from anywhere you
 might need them, which could be in various extension pages, or in content scripts, etc. This is design ed to be a
 small library, so don't include massive amounts of stuff. Think C standard library. A bit of text processing, etc.
 These are also all inserted into the global namespace, so no 'Evernote' object needs to be defined to use them.
 */

var GlobalUtils = {};
(function () {
    "use strict";

    var defaultStyle = /^(font|background|color|line|margin|padding|border|list|display)/;

    var urlMatcher = /^(.*?):\/\/((www\.)?(.*?))(:\d+)?(\/.*?)(\?.*)?$/;
    var domainMatcher = /^.*?:\/\/([^\/:]*).*$/;

    var BAD_FAV_ICON_URLS = {"http://localhost/favicon.ico": true};

    var filterTagsObj = {
        br: 1,
        style: 1,
        script: 1,
        link: 1,
        iframe: 1,
        frame: 1,
        frameset: 1,
        noscript: 1,
        head: 1,
        html: 1,
        applet: 1,
        base: 1,
        basefont: 1,
        bgsound: 1,
        blink: 1,
        ilayer: 1,
        layer: 1,
        meta: 1,
        object: 1,
        embed: 1,
//        input: 1,
//        textarea: 1,
//        select: 1,
//        button: 1,
        canvas: 1,
        map: 1
    };
    var saveStyles =  {
        'background': 'rgba(0, 0, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box',
            'border': '0px none rgb(0, 0, 0)',
            'bottom': 'auto',
            'box-shadow': 'none',
            'clear': 'none',
            'color': 'rgb(0, 0, 0)',
            'cursor': 'auto',
            'display': '',
            //consider inline tag or block tag, this value must have
            'float': 'none',
            'font': '',
            //this value must have, since it affect the appearance very much and style inherit is very complex
            'height': 'auto',
            'left': 'auto',
            'letter-spacing': 'normal',
            'line-height': 'normal',
            'margin': '',
            'max-height': 'none',
            'max-width': 'none',
            'min-height': '0px',
            'min-width': '0px',
            'opacity': '1',
            'outline': 'rgb(0, 0, 0) none 0px',
            'overflow': 'visible',
            'padding': '',
            'position': 'static',
            'right': 'auto',
            'table-layout': 'auto',
            'text-align': 'start',
            'text-decoration': '',
            'text-indent': '0px',
            'text-shadow': 'none',
            'text-overflow': 'clip',
            'text-transform': 'none',
            'top': 'auto',
            'vertical-align': 'baseline',
            'visibility': 'visible',
            'white-space': 'normal',
            'width': 'auto',
            'word-break': 'normal',
            'word-spacing': '0px',
            'word-wrap': 'normal',
            'z-index': 'auto',
            'zoom': '1'
    };

    GlobalUtils.getDomainFromUrl = function (url) {
        return url.replace(domainMatcher, '$1');
    };
    GlobalUtils.componentizeUrl = function (url) {
        var data = {
            protocol   : null,
            domain     : null,
            domainNoWww: null,
            port       : null,
            path       : null,
            queryString: null
        };
        var matches = urlMatcher.exec(url);
        data.protocol = matches[1];
        data.domain = matches[2];
        data.domainNoWww = matches[4];
        data.port = matches[5];
        data.path = matches[6];
        data.queryString = matches[7];
        return data;
    };

    GlobalUtils.localize = function (element) {
        var node = element.nodeName.toLowerCase();
        var localizedMessage;
        if (node == "input" || node == "textarea") {
            var type = element.type;
            if (node == "textarea") {
                type = "textarea";
            }
            switch (element.type) {
                case "text":
                case "textarea":
                case "button":
                case "submit":
                case "search":
                    if (element.attributes.placeholder) {
                        localizedMessage = browser.i18n.getMessage(element.attributes.placeholder.value);
                        if (localizedMessage) {
                            element.placeholder = localizedMessage;
                        }
                    }
                    if (element.attributes.message) {
                        localizedMessage = browser.i18n.getMessage(element.attributes.message.value);
                        if (localizedMessage) {
                            element.value = localizedMessage;
                        }
                    }
                    break;
                case "checkbox":
                case "password":
                case "hidden":
                    break;

                default:
                    throw new Error("We need to localize the value of input elements.");
            }
        }

        else if (element.attributes.message) {
            localizedMessage = browser.i18n.getMessage(element.attributes.message.value);
            if (localizedMessage) {
                element.innerHTML = localizedMessage;
            }
        }

        if (element.title) {
            var localizedTitle = browser.i18n.getMessage(element.title);
            if (localizedTitle) {
                element.title = localizedTitle;
            }
        }

        for (var i = 0; i < element.children.length; i++) {
            GlobalUtils.localize(element.children[i]);
        }
    };

    GlobalUtils.getQueryParams = function (url) {
        var data = GlobalUtils.componentizeUrl(url);
        var queryString = data.queryString;
        var params = {};
        if (!queryString) {
            return params;
        }
        queryString = queryString.substr(1); // Don't want the question mark.
        queryString = queryString.split("#")[0]; // Get rid of any fragment identifier.
        var pairs = queryString.split("&");
        var i;
        for (i = 0; i < pairs.length; i++) {
            var item = pairs[i].split("=");
            if (item[1]) {
                item[1] = item[1].replace(/\+/g, " ");
            }
            params[item[0].toLowerCase()] = item[1];
        }
        return params;
    };

    GlobalUtils.escapeXML = function (str) {
        var map = {
            "&" : "&amp;",
            "<" : "&lt;",
            ">" : "&gt;",
            "\"": "&quot;",
            "'" : "&apos;"
        };

        var a = str.split("");
        for (var i = 0; i < a.length; i++) {
            if (map[a[i]]) {
                a[i] = map[a[i]];
            }
        }
        return a.join("");
    };

    GlobalUtils.createUrlClipContent = function (title, url, favIcoUrl) {
        var titleAttr = (title) ? GlobalUtils.escapeXML(title) : "";
        var style = "font-size: 12pt; line-height: 18px; display: inline;";
        var content = "<a title=\"" + titleAttr + "\" style=\"" + style + "\" href=\"" + url + "\">" + url + "</a>";
        var titleDiv = '<div style="color: #000;border-bottom: 1px solid #ccc;">' + titleAttr + '</div>';
        if (favIcoUrl && !BAD_FAV_ICON_URLS[favIcoUrl.toLowerCase()]) {
            var imgStyle = "display:inline;border: none; width: 16px; height: 16px; padding: 0px; margin: 0px 8px -2px 0px;";
            content = titleDiv + "<span style='padding: 10px 0 5px 0;display: inline-block;'><img title=\"" + titleAttr + "\" style=\"" + imgStyle + "\" src=\"" + favIcoUrl + "\"/>" + content + "</span>";
        } else {
            content = titleDiv + "<span style='padding: 10px 0 5px 0;display: inline-block;'>" + content + "</span>";
        }
        return content;
    };
    GlobalUtils.setStyleSrc2Target = function (s, t) {
        if (!t) {
            t = s;
        }
        var tagName = s.tagName.toLowerCase();
        if (filterTagsObj[tagName]) {
            return null;
        }
        var css = window.getComputedStyle(s, null), cssValue, styleObj={};
        if (css.display === 'none') {
            t.style.display = 'none';
            return;
        }
        for (var cssProperty in saveStyles) {
            if (saveStyles.hasOwnProperty(cssProperty)) {
                cssValue = css[cssProperty];
                if (cssValue == saveStyles[cssProperty]) {
                    continue;
                }
                styleObj[cssProperty] = cssValue;
            }
        }
        if (tagName === 'a') {
            t.href = s.href;
        }
        $(t).css(styleObj).removeAttr('id').removeAttr('class');
    };
    GlobalUtils.setAllStyleSrc2Target = function (src, target) {
        if (!src || !target) {
            return;
        }
        GlobalUtils.setStyleSrc2Target(src, target);
        var srcChildNodes = src.children,
            targetChildNodes = target.children,i, j;
        for (i = 0, j = srcChildNodes.length; i < j; i++) {
            GlobalUtils.setAllStyleSrc2Target(srcChildNodes[i], targetChildNodes[i]);
        }
    };
    GlobalUtils.cloneElement = function (obj) {
        if (!obj) {
            return;
        }
        // 克隆元素，不应该在这里去除display:none 的元素，会使后面的dom元素样式copy出现问题
//        var css;
//        if (obj.nodeType == Node.ELEMENT_NODE) {
//            css = window.getComputedStyle(obj, null);
//            if (css.display == 'none') {
//                return;
//            }
//        }
        var cloneObj = obj.cloneNode(false), childNodes = obj.childNodes, i, j, c;
        for (i = 0, j = childNodes.length; i < j; i++) {
            c = GlobalUtils.cloneElement(childNodes[i]);
            if (c) {
                cloneObj.appendChild(c);
            }
        }
        return cloneObj;
    };

    GlobalUtils.scriptFilter = function (html) {
        return html.replace(/<script[^<>]*\/>/ig, "").replace(/<script[^<>]*>(((?!<\/script>).)|(\r?\n))*<\/script>/ig, "");
    };

    GlobalUtils.getParentsHTML = function (childDom, content) {
        //console.log();
        childDom.parentsUntil($('html')).each(function (index, element) {
            content = element.outerHTML.replace(element.innerHTML, content);
        });
        return content;
    };

    Object.preventExtensions(GlobalUtils);
})();
