var tabContainer;
var tabContainer;
var tabItems;

var docCookies = {
    getItem: function (sKey) {
        if (!sKey || !this.hasItem(sKey)) { return null; }
        return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return; }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toGMTString();
                    break;
            }
        }
        document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    },
    removeItem: function (sKey, sPath) {
        if (!sKey || !this.hasItem(sKey)) { return; }
        document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
    },
    hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: /* optional method: you can safely remove it! */ function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = unescape(aKeys[nIdx]); }
        return aKeys;
    }
};

var tabOrder = (docCookies.getItem('gsTabOrder') || '').split('_');

(function getContainer() {
    setTimeout(function () {
        tabContainer = document.getElementById('hdtb_msb');
        if (tabContainer) {
            tabContainer.style.display = 'none';
            getTabItems();
        } else {
            getContainer();
        }
    }, 0);
})();

function getTabItems() {
    setTimeout(function () {
        tabItems = document.getElementsByClassName('hdtb_mitem');
        if (tabItems.length) {
            changeTabMenu();
        } else {
            getTabItems();
        }
    }, 0);
}

function changeTabMenu() {
    var tabElements = document.getElementsByClassName('hdtb_mitem');
    document.getElementById('hdtb_more').style.display = 'none';
    var tabItems = [];
    for (var i = 0, il = tabElements.length; i < il; i++) {
        var tabItem = { elm: tabElements[i] };
        var elm = tabElements[i].getElementsByClassName('q qs');
        if (elm.length) {
            idx = getMenuOrderIndexAndKey(elm[0].href, tabItem);
        } else {
            idx = getMenuOrderIndexAndKey(location.href, tabItem);
        }
        tabItems.push(tabItem);
    }
    tabItems.sort(tabItemSort);


    var keys = [];
    for (var i = 0, il = tabItems.length; i < il; i++) {
        keys.push(tabItems[i].key);
        if (tabItems[i].parentNode === tabContainer) {
            tabContainer.removeChild(tabItems[i].elm);
        }
    }
    docCookies.setItem('gsTabOrder', keys.join('_'));

    
    for (var i = tabItems.length; i--;) {
        tabContainer.insertBefore(tabItems[i].elm, tabContainer.firstChild);
    }
    setTimeout(function () {
        tabContainer.style.display = '';
    }, 0);
}

function getMenuOrderIndexAndKey(href, tabItem) {
    var ret = /tbm=([^&]*)/.exec(href);
    if (ret) {
        tabItem.idx = tabOrder.indexOf(ret[1]) + 2;
        tabItem.key = ret[1];
    } else {
        if (href.indexOf('maps.google') != -1) {
            // 地図
            tabItem.idx = 1;
            tabItem.key = 'map';
        } else {
            // tbm=xxx がない場合は"ウェブ"
            // "ウェブ"は一番左固定
            tabItem.idx = -1;
            tabItem.key = 'web';
        }
    }
}

function tabItemSort(a, b) {
    return a.idx - b.idx;
}