/*===================================================================
#    FileName: jUtils.js
#      Author: Maelon.J
#       Email: maelon.j@gmail.com
#  CreateTime: 2016-04-21 22:31
# Description: jUtils
===================================================================*/

window.jUtils = (function () {

    var Utils = function () {
        if (Utils._instance)
            throw new Error('Utils is singleton, please use Utils.getInstance()');
    };
    Utils.prototype = {
        /**************** debug ****************/
        /**
        * window.jUtils.isDebug = true  启用debug模式
        * window.jUtils.useDebug(true)
        */
        'isDebug': false,
        'useDebug': function (use) {
            this.isDebug = !!use;
        },
        /**
        * debug模式下会弹出alert
        */
        'debugAlert': function (content, delay) {
            if (this.isDebug) {
                setTimeout(function (msg) {
                    window.alert(msg);
                }, delay || 0, content);
            }
        },

        /**************** trim ****************/
        'trim': function (str) {
            return str.replace(/(^\s*)|(\s*$)/g, ''); 
        },
        'ltrim': function (str) {
            return str.replace(/(^\s*)/g, ''); 
        },
        'rtrim': function (str) {
            return str.replace(/(\s*$)/g, ''); 
        },

        /**************** clone ****************/
        /**
        * from raphealjs 深度拷贝
        */
        'clone': function (obj) {
	        if (typeof obj == "function" || Object(obj) !== obj) {
	            return obj;
	        }
	        var res = new obj.constructor;
	        for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    res[key] = this.clone(obj[key]);
                }
            }
	        return res;
	    },

        /**************** time ****************/
        /**
        * 将毫秒转换为[天，小时，分，秒]
        * format true将小时，分，秒写成两位字符
        */
        'transTime': function (time, format) {
            var timeArr = [];
            var day = parseInt(time / 36E5 / 24, 10);
            var hour = parseInt((time - day * 24 * 36E5) / 36E5 % 24, 10);
            var minute = parseInt((time - day * 24 * 36E5 - hour * 36E5) / 6E4 % 60, 10);
            var second = parseInt((time - day * 24 * 36E5 - hour * 36E5 - minute * 6E4) / 1E3, 10);
            var timezoneOffset = (new Date()).getTimezoneOffset() / 60;
            var zoneHour = hour - timezoneOffset;
            timeArr.push(day >= 0 ? day : '');
            timeArr.push(zoneHour >= 0 ? (format ? ((zoneHour > 9 ? '' : '0') + zoneHour) : zoneHour) : '');
            timeArr.push(minute >= 0 ? (format ? ((minute > 9 ? '' : '0') + minute) : minute) : '');
            timeArr.push(second >= 0 ? (format ? ((second > 9 ? '' : '0') + second) : second) : '');
            return timeArr;
        },

        /**************** apptype ****************/
        /**
        * 根据ua获取当前环境类型
        */
        'appTypeEnum': {},
        'getAppType': function () {
            var ua = window.navigator.userAgent.toLowerCase();
            var match = ua.match(/MicroMessenger/i);
            if (match && match[0] === 'micromessenger') {
                return 'weixin';
            } else {
                for(var s in this.appTypeEnum) {
                    match = ua.match(new RegExp(s, 'i'));
                    if (match && match[0] === s.toLowerCase()) {
                        return this.appTypeEnum[s];
                    }
                }
            }
            return 'app';
        },

        /**************** class ****************/
        /**
        * 继承类
        */
        'extendClass': function (child, parent) {
            if(typeof child !== 'function')
                throw new TypeError('extendClass child must be function type');
            if(typeof parent !== 'function')
                throw new TypeError('extendClass parent must be function type');

            if(child === parent)
                return ;
            var Transitive = new Function();
            Transitive.prototype = parent.prototype;
            child.prototype = new Transitive();
            return child.prototype.constructor = child;
        },

        /**************** object ****************/
        /**
        * 装饰对象
        */
        'decorate': function (target, source) {
            for (var s in source) {
                target[s] = source[s];
            }
            return target;
        },


        /**************** css class ****************/
        'css': function (dom, attr, value) {
            switch (arguments.length) {
                case 2:
                    if (typeof arguments[1] === 'object') {
                        for (var name in attr) {
                            dom.style[name] = attr[name];
                        }
                    } else {
                        return dom.currentStyle ? dom.currentStyle[attr] : getComputedStyle(dom, null)[attr]
                    }
                    break;
                case 3:
                    dom.style[attr] = value;
                    break;
                default:
                    return '';
            }
        },
        'hasClass': function (dom, cls) {
            return dom.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        },
        'addClass': function (dom, cls) {
            if (!this.hasClass(dom, cls)) {
                var classes = dom.className.split(/\s+/);
                classes.push(cls + '');
                dom.className = classes.join(' ');
            }
        },
        'removeClass': function (dom, cls) {
            if (this.hasClass(dom, cls)) {
                var reg = new RegExp('(\\s+|^)' + cls + '(\\s+|$)');
                dom.className = dom.className.replace(reg, ' ');
            }
        },
        /**
         * css {'div': {'animate': 'move 1s', 'color': '#000'}}
         * keyframe {'move': {'from': {'width': '0'}, 'to': {'width': '100'}}}
         */
        'createStyleSheet': function (css, keyframe) {
            var style = document.createElement('style');
            style.type = 'text/css';
            document.head.appendChild(style);
            var prefix = ['', '-webkit-', '-moz-'];
            var formatCSS = function (css, pf) {
                var rulesObj;
                var rulesArr;
                var retArr = [];
                for(var selector in css) {
                    rulesObj = css[selector];
                    rulesArr = [];
                    for(var prop in rulesObj) {
                        if(['animate', 'transform', 'transform-origin'].indexOf(prop) < 0) {
                            rulesArr.push(prop + ':' + rulesObj[prop] + ';');
                        } else {
                            if(pf !== undefined) {
                                rulesArr.push(pf + prop + ':' + rulesObj[prop] + ';');
                            } else {
                                for(var i = 0; i < prefix.length; i++) {
                                    rulesArr.push(prefix[i] + prop + ':' + rulesObj[prop] + ';');
                                }
                            }
                        }
                    }
                    retArr.push(selector + ' {' + rulesArr.join('') + '}');
                }
                return retArr;
            };
            var cssList = formatCSS(css);
            var frameList = [];
            var arr;
            if(keyframe) {
                arr = [];
                for(var keyname in keyframe) {
                    for(var i = 0; i < prefix.length; i++) {
                        frameList = formatCSS(keyframe[keyname], prefix[i]);
                        arr.push('@' + prefix[i] + 'keyframes ' + keyname + ' {' + frameList.join(' ') + '}');
                    }
                }
                frameList = arr;
            }
            cssList = cssList.concat(frameList);
            for(i = 0; i < cssList.length; i++) {
                //style.sheet.insertRule(cssList[i], style.sheet.cssRules.length);
                style.appendChild(document.createTextNode(cssList[i]));
            }
            return style.sheet;
        },
        'requestAnimFrame': (function () {
            return (
                window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (callback) {
                    window.setTimeout(callback, 1000 / 33);
                });
        })(),
        'cancelAnimFrame': (function (id) {
            return (
                window.cancelAnimationFrame ||
                    window.webkitCancelAnimationFrame ||
                    window.mozCancelAnimationFrame ||
                    window.oCancelAnimationFrame ||
                    window.msCancelAnimationFrame ||
                    function (id) {
                    window.clearTimeout(id);
                });
        })(),
        'fixCanvasSmooth': function (canvas) {
            var ctx = canvas.getContext('2d');
            var devicePixelRatio = window.devicePixelRatio || 1;
            var backingStorePixelRatio = ctx.backingStorePixelRatio ||
                ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio || 1;
            if (devicePixelRatio !== backingStorePixelRatio) {
                var ratio = devicePixelRatio / backingStorePixelRatio;
                var oldWidth = canvas.width;
                var oldHeight = canvas.height;
                canvas.width = oldWidth * ratio;
                canvas.height = oldHeight * ratio;
                canvas.style.width = oldWidth + 'px';
                canvas.style.height = oldHeight + 'px';
                ctx.scale(ratio, ratio);
            }
        },
        'getElementLeft': function (element){
            var actualLeft = element.offsetLeft;
            var current = element.offsetParent;
            while (current !== null){
                actualLeft += current.offsetLeft;
                current = current.offsetParent;
            }
            return actualLeft;
        },
        'getElementTop':function (element){
            var actualTop = element.offsetTop;
            var current = element.offsetParent;
            while (current !== null){
                actualTop += current.offsetTop;
                current = current.offsetParent;
            }
            return actualTop;
        },


        /**************** GUID ****************/
        /**
        * GUID静态属性
        * Added by maelon 2015-07-24 14:37
        */
        'jGUID': {
            '__version': '0.1.0',
            'callCount': 0
        },
        /**
        * GUID(hex):
        *    xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        */
        'makeSimpleGUID': function () {
            var guid = '00000000000000000000000000000000';
            var count = Math.abs(this.jGUID['callCount']++);
            var count16 = count.toString(16);
            guid = (guid + count16).slice(count16.length);
            return guid.slice(0, 8) + '-' + guid.slice(8, 12) + '-' + guid.slice(12, 16) + '-' + guid.slice(16, 20) + '-' + guid.slice(20);
        },

        /**************** url ****************/
        /**
        * 对于url的search部分进行处理
        * http://test.com?a=123&b=&c&a=222
        * queryList = {
        *   a: ['123', '222'],
        *   b: [''],
        *   c: []
        * }
        */
        'queryList': undefined,
        'parseURL': function (url) {
            var a = document.createElement('a');
            a.href = url;
            return {
                href: url,
                protocol: a.protocol,
                host: a.host,
                hostname: a.hostname,
                port: a.port,
                search: a.search,
                hash: a.hash,
                pathname: a.pathname
            };
        },
        'getQueryList': function (url) {
            if (url === undefined && this.queryList !== undefined) {
                return this.clone(this.queryList);
            }
            var search = url ? this.parseURL(url).search : window.location.search;
            var result = search.match(new RegExp('[?&][^?&]+=?[^?&]*', 'g'));
            if (result === null) {
                if (url) {
                    return [];
                }
                !this.queryList && (this.queryList = {});
                return this.clone(this.queryList);
            }
            var retObj = {};
            var name;
            var qs;
            for (var i = 0; i < result.length; i++) {
                result[i] = result[i].substring(1);
                qs = result[i].split('=');
                name = qs[0];
                if (retObj[name] !== undefined) {
                    qs.length > 1 && retObj[name].push(qs[1]);
                } else {
                    retObj[name] = qs.length > 1 ? [qs[1]] : [];
                }
            }
            if (url)
                return retObj;
            !this.queryList && (this.queryList = retObj);
            return this.clone(this.queryList);
        },
        /**
        * 要据参数名获取参数值 a -> ['123', '222']
        */
        'getQueryString': function (name, url, ignore) {
            var qsList = this.getQueryList(url);
            var ig = !!ignore;
            if (ig) {
                var queryName = name.toLowerCase();
                var arr = [];
                for(var name in qsList) {
                    if (name.toLowerCase() === queryName) {
                        arr = arr.concat(qsList[name]);
                    }
                }
                return arr;
            } else {
                return qsList[name];
            }
        },
        /**
        * 将参数对象转换为url search
        * 例如 http://test.com?a=123&b=12
        *    设置参数  {
        *                  a: 222, 改变值
        *                  b: null, 删除
        *                  c: haha 新增
        *              }
        *       转换为 ?a=222&c=haha
        */
        'setQueryString': function (query, url, ignore, needtidy) {
            var qsList = this.getQueryList(url);
            var qName;
            var hasQS = function (name, list, ignore) {
                if (ignore) {
                    for(var s in list) {
                        if (s.toLowerCase() === name.toLowerCase()) {
                            return true;
                        }
                    }
                    return false;
                } else {
                    return list[name] !== undefined;
                }
            };
            for (var name in query) {
                if (hasQS(name, qsList, ignore)) {
                    if (ignore) {
                        for(var qname in qsList) {
                            if (qname.toLowerCase() === name.toLowerCase()) {
                                if (query[name] !== null) {
                                    qsList[qname] = qsList[qname].concat(query[name] instanceof Array ? query[name] : [query[name]]);
                                } else {
                                    delete qsList[qname];
                                }
                            }
                        }
                    } else {
                        if (query[name] !== null) {
                            qsList[name] = qsList[name].concat(query[name] instanceof Array ? query[name] : [query[name]]);
                        } else {
                            delete qsList[name];
                        }
                    }
                } else {
                    if (query[name] !== null) {
                        qsList[name] = query[name] instanceof Array ? query[name] : [query[name]];
                    }
                }
            }
            var qs = [];
            var qv;
            for (name in qsList) {
                if (!!needtidy) {
                    if (qsList[name].length > 0) {
                        qv = qsList[name].pop();
                        qv !== null && qs.push(name + '=' + qv);
                    } else {
                        qs.push(name);
                    }
                } else {
                    if (qsList[name].length > 0) {
                        if(qsList[name].indexOf(null) < 0) {
                            for(var i = 0; i < qsList[name].length; i++) {
                                qv = qsList[name][i];
                                qs.push(name + '=' + qv);
                            }
                        }
                    } else {
                        qs.push(name);
                    }
                }
            }
            return '?' + qs.join('&');
        },
        /**
        * 输出结果为完整url
        */
        'setQueryStringURL': function (query, url, ignore, needtidy) {
            var urlLoc = url ? this.parseURL(url) : window.location;
            return urlLoc.protocol + '//' + urlLoc.host + urlLoc.pathname + this.setQueryString(query, url, ignore, needtidy) + urlLoc.hash;
        },

        /**************** cookie ****************/
        'setCookie': function (name, value, expires) {
            var exp = new Date();
            exp.setTime(exp.getTime() + expires);
            document.cookie = name + '=' + escape(value) + '; path=/; expires=' + exp.toGMTString();
        },
        'getCookie': function (name) {
            var reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
            var arr;
            if(arr = document.cookie.match(reg)){
                return unescape(arr[2]);
            } else{
                return null;
            }
        },
        'removeCookie': function (name) {
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = this.getCookie(name);
            if(cval !== null){
                document.cookie = name + '=' + cval + '; path=/; expires=' + exp.toGMTString();
            }
        },

        /**************** validate ****************/
        'validatePhoneNumberFormat': function (phoneNumber) {
            var phoneReg = /^(1((3[0-9])|(5[0-3|5-9])|(8[0-9])|(45|47|7[6-8]|70))\d{8})$/;
            if (phoneReg.test(phoneNumber)) {
                return true;
            }
            else {
                return false;
            }
            return false;
        },
        'validatePhoneCodeFormat': function (code) {
            var codeReg = /^[\d]{4}$/;
            if (codeReg.test(code)) {
                return true;
            }
            else {
                return false;
            }
            return false;
        },
        'validatePhoneCode6Format': function (code) {
            var codeReg = /^[\d]{6}$/;
            if (codeReg.test(code)) {
                return true;
            }
            else {
                return false;
            }
            return false;
        },
        'validatePasswordFormat': function (password) {
            var passReg = /^[\w]{6,16}$/;
            if (passReg.test(password)) {
                return true;
            }
            else {
                return false;
            }
            return false;
        },
        /**
        * data:{
        *     method:DOMString,
        *     url:DOMString,
        *     asynic:boolean,
        *     dataType:DOMString,
        *     withCredentials: boolen,
        *     header:Object,
        *     data:DOMString/FormData,
        *     timeout: Number,
        *     success:function,
        *     error:function
        * }
        */
        'ajax': function (data) {
            var method = data['method'] && data['method'].toLowerCase();
            if(method && method !== 'get' && method !== 'post') {
                throw new Error('Invalid ajax method');
            }

            var url = data['url'];
            if(url === undefined || typeof url !== 'string' || url === '') {
                throw new Error('Invalid ajax url');
            }

            var xhr;
            if(window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else if(window.ActiveXObject) {
                try {
                    xhr = new ActiveXObject("Msxml2.XMLHTTP");
                } catch(e) {
                    try {
                        xhr = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch(e) {
                    }
                }
            }

            if(xhr) {
                //'' 'arraybuffer' 'blob' 'document' 'json' 'text'
                if(data['dataType'] && typeof data['dataType'] === 'string') {
                    xhr.responseType = data['dataType'].toLowerCase();
                }

                if(data['timeout'] !== undefined) {
                    xhr.timeout = parseInt(data['timeout']) || 0;
                }

                xhr.jajax = {};
                if(data['success'] && typeof data['success'] === 'function') {
                    xhr.jajax['success'] = data['success'];
                }
                if(data['error'] && typeof data['error'] === 'function') {
                    xhr.jajax['error'] = data['error'];
                }
                if(data['withCredentials'] !== undefined) {
                    xhr.withCredentials = !!data['withCredentials'];
                }

                xhr.onreadystatechange = function (e) {
                    if(this.readyState === 4) {
                        if(this.status === 200) {
                            if(this.responseType === '' || this.responseType === 'text') {
                                this.jajax['success'] && this.jajax['success'](this.responseText, this);
                            } else if(this.responseType === 'json') {
                                this.jajax['success'] && this.jajax['success'](this.response, this);
                            }
                        } else {
                            this.jajax['error'] && this.jajax['error'](this.statusText, this);
                        }
                    }
                }

                method = method || 'get';
                var async = data['async'] !== undefined ? !!data['async'] : true;
                var sendData = data['data'] || null;
                var serializeSendData = function (data, type) {
                    if(data) {
                       if(Object.prototype.toString.call(data) === '[object Object]') {
                           if(type === 'json') {
                               return JSON.stringify(data);
                           } else if(type === 'form' || type === null) {
                               var dataArr = [];
                               for(var s in data) {
                                   if(data[s]) {
                                       dataArr.push(s + '=' + data[s]);
                                       continue;
                                   }
                                   dataArr.push(s);
                               }
                               return dataArr.join('&');
                           }
                       } else {
                           return '' + data;
                       }
                    }
                    return '';
                };
                if(method === 'get') {
                    var data = serializeSendData(sendData, 'form');
                    url = url.replace(/((\?*&*|&*\?*)#\w*)$/, '');
                    url = url + (url.indexOf('?') < 0 ? (data ? '?' : '') : '') + data;
                    xhr.open(method, url, async);
                    xhr.send();
                } else if(method === 'post') {
                    xhr.open(method, url, async);
                    var dataType = 'form';
                    if(data['header'] && Object.prototype.toString.call(data['header']) === '[object Object]') {
                        var header = data['header'];
                        for(var s in header) {
                            if(s.toLowerCase() === 'contenttype') {
                                var contenttype = this.__jajax['contentType'][header[s]] || header[s];
                                xhr.setRequestHeader('Content-Type', contenttype);
                                if(contenttype.indexOf('x-www-form-urlencoded') > -1) {
                                    dataType = 'form';
                                } else if(contenttype.indexOf('json') > -1) {
                                    dataType = 'json';
                                }
                                continue;
                            }
                            xhr.setRequestHeader(s, header[s]);
                        }
                    }
                    xhr.send(serializeSendData(sendData, dataType));
                }
            } else {
                throw new Error('Not support xmlhttprequest');
            }
        },
        /**
        * ajax静态属性
        */
        '__jajax': {
            '__version': '0.1.0',
            'contentType': {
                'form': 'application/x-www-form-urlencoded; charset=utf-8',
                'json': 'application/json; charset=utf-8',
                'multipart': 'multipart/form-data; charset=utf-8'
            }
        },

        'mergeSortArray': function (list, comparefunc) {

            function _merge(left, right, comparefunc) {
                var result  = [];
                var il = 0;
                var ir = 0;
                while(il < left.length && ir < right.length) {
                    if(typeof comparefunc === 'function') {
                        if(comparefunc(left[il], right[ir]) <= 0) {
                            result.push(left[il++]);
                        } else {
                            result.push(right[ir++]);
                        }
                    } else {
                        if(left[il] <= right[ir]) {
                            result.push(left[il++]);
                        } else {
                            result.push(right[ir++]);
                        }
                    }
                }
                return result.concat(left.slice(il)).concat(right.slice(ir));
            }

            function _mergeSort(items, comparefunc){
                if (items.length < 2) {
                    return items;
                }
                var middle = Math.floor(items.length / 2);
                var left = items.slice(0, middle);
                var right = items.slice(middle);

                return _merge(_mergeSort(left, comparefunc), _mergeSort(right, comparefunc), comparefunc);
            }

            return _mergeSort(list, comparefunc);
        }
    };
    Utils.getInstance = function () {
        if (!Utils._instance)
            Utils._instance = new Utils();
        return Utils._instance;
    };

    return new Utils();
})();
