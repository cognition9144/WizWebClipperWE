// 'use strict';
var Base64 = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // public method for encoding
    encode : function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }

        return output;
    },
    // private method for UTF-8 encoding
    _utf8_encode : function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    }
};


var ClientClipper = function () {
    var SAVE_CONTENT = 'save_content',
        SAVE_FULLPAGE = 'save_all',
        SAVE_SELECTION = 'save_sel',
        SAVE_URL = 'save_url';

    function wiz_base64Encode(str) {
        if (!str || str.length < 1) {
            return "";
        }
        var base64str = Base64.encode(GlobalUtils.scriptFilter(str));
        return base64str;
    }

    function wiz_getFrameNodes(win) {
        var doc = win.document;
        if (doc === null) {
            return null;
        }

        var result = [],
            frameNodes = doc.getElementsByTagName("iframe");
        if (frameNodes === null || frameNodes.length === 0) {
            frameNodes = doc.getElementsByTagName("frame");
            if (frameNodes === null || frameNodes.length === 0) {
                return null;
            }
        }

        var realDomain = document.domain, domain;
        for (var i = frameNodes.length-1; i >= 0; i--) {
            domain = GlobalUtils.getDomainFromUrl(frameNodes[i].src);
            if (!domain || domain.lastIndexOf(realDomain) == domain.length - realDomain.length) {
                result.push(frameNodes[i]);
            }
        }

        return result;
    }

    var wiz_g_frameNameIndex = 0;

    function wiz_prepareFrameNodes(win) {
        var frameNodes = wiz_getFrameNodes(win);
        if (frameNodes === null)
            return;
        for (var i = 0; i < frameNodes.length; i++) {
            var node = frameNodes[i];
            node.setAttribute("wiz_ext_name", "Frame_" + wiz_g_frameNameIndex);
            wiz_g_frameNameIndex++;
        }
    }

    function wiz_prepareFrames(win) {
        if (win === null) {
            return;
        }

        var doc = win.document;
        if (doc === null) {
            return;
        }

        wiz_prepareFrameNodes(win);

        var frames = win.frames;
        if (frames === null) {
            return;
        }

        var realDomain = document.domain, domain;
        for (var i = 0; i < frames.length; i++) {
            var frame = frames[i];
            try {
                domain = GlobalUtils.getDomainFromUrl(frame.src);
                if (!domain || domain.lastIndexOf(realDomain) == domain.length - realDomain.length) {
                    wiz_prepareFrames(frame);
                }
            } catch(e) {

            }
        }
    }

    function wiz_prepareAllFrames(win) {
        wiz_g_frameNameIndex = 0;
        wiz_prepareFrames(win);
    }

    var wiz_g_frameFilesIndex = 0;
    function wiz_collectFrames(win) {
        var params = "";
        var doc = null;
        var i;
        if (win === null) {
            return "";
        }
        try {
            doc = win.document;
        } catch(e) {

        }
        if (doc === null) {
            return "";
        }

        var frameNodes = wiz_getFrameNodes(win);

        if (!frameNodes) {
            return "";
        }

        for (i = 0; i < frameNodes.length; i++) {
            var frameNode = frameNodes[i];
            if (frameNode !== null) {
                var id = frameNode.getAttribute("id") || '';
                var name = frameNode.getAttribute("name") || '';
                var extName = frameNode.getAttribute("wiz_ext_name") || '';
                var frameDoc = null;
                try {
                    frameDoc = frameNode.contentDocument;
                } catch(e) {}
                if (frameDoc !== null) {
                    params += wiz_g_frameFilesIndex + "_FrameURL='" + wiz_base64Encode(frameDoc.URL) + "' ";
                    params += wiz_g_frameFilesIndex + "_FrameName='" + name + "' ";
                    params += wiz_g_frameFilesIndex + "_FrameID='" + id + "' ";
                    params += wiz_g_frameFilesIndex + "_FrameExtName='" + extName + "' ";
                    var source_html = wiz_base64Encode(frameDoc.documentElement.innerHTML);
                    params += wiz_g_frameFilesIndex + "_FrameHtml='" + source_html + "' ";
                    wiz_g_frameFilesIndex++;
                }
            }
        }

        var frames = win.frames;
        for (i = 0; i < frames.length; i++) {
            var frame = frames[i];
            params += wiz_collectFrames(frame);
        }
        return params;
    }

    function wiz_collectAllFrames(win, info) {//
        var params = "";
        var base = "<base href='" + document.URL + "'/>";
        if (typeof (win) == "object") {
            var source_url = wiz_base64Encode(win.location.href);
            var source_title = wiz_base64Encode(info.title);
            wiz_prepareAllFrames(win);
            var htmlCloneDOM = $('html').clone();
            htmlCloneDOM.find('head').prepend(base).end().find("script").remove();
            var htmlStr = htmlCloneDOM[0].outerHTML;
            htmlStr = htmlStr.replace(/(<iframe[^<>]*chrome-extension[^<>]*>((?!<\/iframe>).)*<\/iframe>)/ig, '');
            var docType = document.doctype;
            if (!!docType && !!docType.systemId && !!docType.publicId) {
                docType = '<!DOCTYPE HTML PUBLIC "' + docType.publicId + '" "' + docType.systemId + '" >';
            } else {
                docType = '<!DOCTYPE HTML>';
            }
            var source_html = wiz_base64Encode(docType + htmlStr);
            params = "param-location='" + source_url + "' ";
            params += "param-title='" + source_title + "' ";

            wiz_g_frameFilesIndex = 0;

            params += wiz_g_frameFilesIndex + "_FrameURL='" + source_url + "' ";
            params += wiz_g_frameFilesIndex + "_FrameHtml='" + source_html + "' ";

            wiz_g_frameFilesIndex++;
            params += wiz_collectFrames(win);
            params = "param-fcount='" + wiz_g_frameFilesIndex + "' " + params;
        }
        return params;
    }

    function wiz_collectSelectionServer(win, selecteHTML, info) {
        var params = "";
        if (typeof (win) == "object") {
            var source_url = wiz_base64Encode(win.location.href);
            var source_title = wiz_base64Encode(info.title);

//            wiz_prepareAllFrames(win);
            var htmlCloneDOM = $('html').clone();
            var headCloneDOM = htmlCloneDOM.find('head');
            var bodyCloneDOM = htmlCloneDOM.find('body');
            var titleText = headCloneDOM.find('title').text();

            headCloneDOM.html('<meta charset="UTF-8"><title>'+ titleText + '</title>');

            bodyCloneDOM[0].outerHTML= selecteHTML;
            var htmlStr = htmlCloneDOM[0].outerHTML;
            htmlStr = htmlStr.replace(/(<iframe[^<>]*chrome-extension[^<>]*>((?!<\/iframe>).)*<\/iframe>)/ig, '');
            var docType = document.doctype;
            if (!!docType && !!docType.systemId && !!docType.publicId) {
                docType = '<!DOCTYPE HTML PUBLIC "' + docType.publicId + '" "' + docType.systemId + '" >';
            } else {
                docType = '<!DOCTYPE HTML>';
            }
            var source_html = wiz_base64Encode(docType + htmlStr);
            params = "param-location='" + source_url + "' ";
            params += "param-title='" + source_title + "' ";

            params += "0_FrameURL='" + source_url + "' ";
            params += "0_FrameHtml='" + source_html + "' ";

            params = "param-fcount='1' " + params;
        }
        return params;
    }

    function wiz_getActiveFrame(win) {
        if (win === null) {
            return null;
        }
        var activeFrame = null;
        var frames = win.frames;
        for (var i = 0; i < frames.length; i++) {
            var frame = frames[i];
            if (frame !== null && frame.document !== null) {
                var seltxt = frame.getSelection();
                if (seltxt !== null && seltxt.toString() !== "") {
                    activeFrame = frame;
                }
            }
            if (activeFrame !== null) {
                return activeFrame;
            }
            activeFrame = wiz_getActiveFrame(frame);
            if (activeFrame !== null) {
                return activeFrame;
            }
        }
        return null;
    }

    function wiz_getSelected(win) {
        var params = "";
        if (typeof (win) == "object") {
            var source_url = wiz_base64Encode(win.location.href);
            var source_html = "";
            var frame_url = source_url;

            var winsel = wiz_contentPreview.getArticleElement();
            if (winsel === null || winsel.toString() === "") {
                var activeFrame = wiz_getActiveFrame(win);
                if (activeFrame !== null) {
                    winsel = activeFrame.getSelection();
                    frame_url = wiz_base64Encode(activeFrame.location.href);
                }
            }

            if (winsel === null || winsel === "") {
                winsel = win.getSelection().toString();
            }
            if (winsel === null || winsel === "") {
                params = "";
            } else {
                //var docFragment = winsel.getRangeAt(0).cloneContents();
                //var docFragment = winsel.innerHTML;
                //var myp = window.document.createElement("<div>" + docFragment + "</Div>");
                var _winsel = GlobalUtils.cloneElement(winsel);
                GlobalUtils.setAllStyleSrc2Target(winsel, _winsel);
                source_html = (_winsel.outerHTML) ? (_winsel.outerHTML) : _winsel;
                if (source_html === null) {
                    source_html = "";
                }
                //调用base64处理
                source_html = wiz_base64Encode(source_html);
                var localParams = params +  "param-surl='" + frame_url + "' ";
                localParams += "param-shtml='" + source_html + "' ";
                params = localParams;
            }
        }
        return params;
    }

    function wiz_getSelectedServer(win, info) {
        var params = "";
        if (typeof (win) == "object") {
            var source_url = wiz_base64Encode(win.location.href);
            var source_html = "";
            var source_title = wiz_base64Encode(info.title);

            var winsel = wiz_contentPreview.getArticleElement();
            if (winsel === null || winsel.toString() === "") {
                var activeFrame = wiz_getActiveFrame(win);
                if (activeFrame !== null) {
                    winsel = activeFrame.getSelection();
                    source_url = wiz_base64Encode(activeFrame.location.href);
                }
            }

            if (winsel === null || winsel === "") {
                winsel = win.getSelection().toString();
            }
            if (winsel === null || winsel === "") {
                params = "";
            } else {
                //var docFragment = winsel.getRangeAt(0).cloneContents();
                //var docFragment = winsel.innerHTML;
                //var myp = window.document.createElement("<div>" + docFragment + "</Div>");
                //console.log(winsel);

                var _winsel = GlobalUtils.cloneElement(winsel);
                GlobalUtils.setAllStyleSrc2Target(winsel, _winsel);
                //source_html = (_winsel.outerHTML) ? (_winsel.outerHTML) : _winsel;
                if (_winsel.outerHTML) {
                    source_html = GlobalUtils.getParentsHTML($(winsel), _winsel.outerHTML);
                    //console.log(source_html);
                } else {
                    source_html = _winsel;
                }
                if (source_html === null) {
                    source_html = "";
                }

                //调用base64处理
                var base = "<base href='" + document.URL + "'/>";
                wiz_prepareAllFrames(win);
                var htmlCloneDOM = $('html').clone();
                htmlCloneDOM.find('head').prepend(base).end().find("script").remove();
                htmlCloneDOM.find('body').html(source_html);
                var htmlStr = htmlCloneDOM[0].outerHTML;
                htmlStr = htmlStr.replace(/(<iframe[^<>]*chrome-extension[^<>]*>((?!<\/iframe>).)*<\/iframe>)/ig, '');
                var docType = document.doctype;
                if (!!docType && !!docType.systemId && !!docType.publicId) {
                    docType = '<!DOCTYPE HTML PUBLIC "' + docType.publicId + '" "' + docType.systemId + '" >';
                } else {
                    docType = '<!DOCTYPE HTML>';
                }
                source_html = wiz_base64Encode(docType + htmlStr);
                params = "param-location='" + source_url + "' ";
                params += "param-title='" + source_title + "' ";

                params +=  "0_FrameURL='" + source_url + "' ";
                params +=  "0_FrameHtml='" + source_html + "' ";

                params = "param-fcount='1' " + params;
            }
        }
        return params;
    }

    function launchClientClipperArticle(info) {
        var params = wiz_getSelectedServer(window, info);
        info.params = params;
        info.cmd = SAVE_CONTENT;
        requestSaveDoc(info);
    }

    function launchClientClipperFullPage(info) {
        var params = wiz_collectAllFrames(window, info);
        info.params = params;
        info.cmd = SAVE_FULLPAGE;
        requestSaveDoc(info);
    }

    function launchClientClipperSelection(info) {
        var bodyHTML, params;
        bodyHTML = getSelectedHTML();
        params = wiz_collectSelectionServer(window, bodyHTML, info);
        info.params = params;
        info.cmd = SAVE_SELECTION;
        requestSaveDoc(info);
    }

    function launchClientClipperUrl(info) {
        var body = '<a href="' + window.location.href + '">' + window.location.href + '</a>';
        var params = wiz_collectAllFrames(window, info)  + formatParams(info.url, body);
        info.params = params;
        info.cmd = SAVE_URL;
        requestSaveDoc(info);
    }

    function formatParams(url, source_html) {
        if (!source_html) {
            return "";
        }
        var frame_url = wiz_base64Encode(url);
        source_html = wiz_base64Encode(source_html);
        var params = "param-surl='" + frame_url + "' ";
        params += "param-shtml='" + source_html + "' ";
        return params;
    }

    function getFullpageHTML() {
        // var base = "<base href='" + window.location.protocol + "//" + window.location.host + "'/>";
        var base = "<base href='" + document.URL + "'/>";
        var page_content = document.getElementsByTagName("html")[0];
        page_content = $(page_content).clone().find("script").remove().end().html();
        //保存服务器也去除其他扩展添加的iframe
        page_content = page_content.replace(/(<iframe[^<>]*chrome-extension[^<>]*>((?!<\/iframe>).)*<\/iframe>)/ig, '');
        var pattern = /^<head[^>]*>/i;
        var headResult = pattern.exec(page_content);
        var index;
        if (headResult) {
            index = headResult.index + headResult[0].length;
        }

        var docType = document.doctype;
        if (!!docType && !docType.systemId && !docType.publicId) {
            docType = '<!DOCTYPE HTML>';
        } else if (!!docType) {
            docType = '<!DOCTYPE HTML PUBLIC "' + docType.publicId + '" "' + docType.systemId + '" >';
        } else {
            docType = '<!DOCTYPE HTML>';
        }
        var fullPage = [];
        if (headResult) {
            fullPage.push(docType + '<html>',
                page_content.substring(0, index), base, page_content.substring(index), '</html>');
        } else {
            fullPage.push(docType + '<html><head>',
                base, '</head>', page_content, '</html>');
        }
        return fullPage.join('');
    }

    function getSelectedHTML() {
        var selection = document.getSelection();
        var isBody = false;
        var range, commonAncestorContainer, dom, cloneDom,
            result;
        // 删选掉插入符
        if (selection.rangeCount > 0 && selection.type !== 'Caret') {
            range = selection.getRangeAt(0);
            commonAncestorContainer = range.commonAncestorContainer;
            isBody = commonAncestorContainer === document.body;
//            var _document = commonAncestorContainer.ownerDocument;
            if (isBody) {
                dom = document.createElement('div');
            } else {
                dom = GlobalUtils.cloneElement(commonAncestorContainer);
                dom.innerHTML = '';
            }

//            dom.setAttribute('style','width:0;height:0;overflow:hidden;');
            dom.appendChild(range.cloneContents());
            if (isBody) {
                document.body.appendChild(dom);
            } else {
                $(dom).insertAfter($(commonAncestorContainer));
            }

            cloneDom = GlobalUtils.cloneElement(dom);
            cloneDom.removeAttribute('style');
            GlobalUtils.setAllStyleSrc2Target(dom, cloneDom);
            result  = GlobalUtils.getParentsHTML($(commonAncestorContainer), cloneDom.outerHTML);
            $(dom).remove();
            dom = null;
            $(cloneDom).remove();
            cloneDom = null;
            // console.log(result);
            return result;
        } else {
            return '';
        }
    }

    /**
     * 保存到本地客户端前需要做的相关处理
     * @param {[type]} info   [description]
     */
    function addExtraParams(info) {
        //console.log(info);
        try {
            var comment = (info.comment) ? ('<div>' + info.comment.replace(/\n/gi, '<br />') + '</div>') : '',
            params = info.params + ' save-command="' + info.cmd + '" userid="' + info.userid +
                '" location="' + wiz_base64Encode(info.category) + '" comment="' + wiz_base64Encode(comment)  +
                '" tag="' + wiz_base64Encode(info.tag) + '"';
            return params;
        } catch (err) {
            console.warn('ClipPageControl.addExtraParams() Error : ' + err);
        }
    }

    function requestSaveDoc(info, isSaveMore) {
        if(!isSaveMore){
            info.params = addExtraParams(info);
        }
        info.url = document.location.href;
        setTimeout(function(){
            chrome.extension.connect({
                name : "saveDocument"
            }).postMessage(info);
        }, 300);
    }


    this.launchClientClipperArticle = launchClientClipperArticle;
    this.launchClientClipperUrl = launchClientClipperUrl;
    this.launchClientClipperSelection = launchClientClipperSelection;
    this.launchClientClipperFullPage = launchClientClipperFullPage;
};

var wiz_clipper = new ClientClipper();