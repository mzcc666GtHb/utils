/**
 * @Description: 常用工具函数
 * @author  xuweifeng
 * @date 2019/5/9
 */

/**
 * rem布局(默认750的设计稿)
 * 建议在页面最先引入
 * 可以保证在系统字体默认放大的情况下保持布局
 */

export const rem = (draft = 750) => {
    const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = () => {
            let cW = document.documentElement.clientWidth,
                iW = window.innerWidth,
                w = Math.max(cW, iW),
                fz
            w = w > draft ? draft : w
            fz = ~~(w / (draft / 100))
            document.getElementsByTagName('html')[0].style.cssText = 'font-size: ' + fz + 'px'
            document.getElementsByTagName('body')[0].style.cssText = 'font-size: ' + 16 + 'px'

            const setHtmlSize = () => {
                let realfz = ~~(+window.getComputedStyle(document.getElementsByTagName('html')[0]).fontSize.replace('px', ''))
                if (fz !== realfz) {
                    document.getElementsByTagName('html')[0].style.cssText = 'font-size: ' + fz * (fz / realfz) + 'px'
                }
            }
            setHtmlSize()
        }
    recalc()
    window.addEventListener(resizeEvt, recalc)
    document.addEventListener('DOMContentLoaded', recalc)
}


/**
 * 判断运行平台
 */
export const platform = (() => {
    let ua = navigator.userAgent
    return {
        isMobile: !!ua.match(/AppleWebKit.*Mobile.*/),          //移动终端
        isIOS: !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),     //ios终端
        isAndroid: ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1, //android终端
        isIPhone: ua.indexOf('iPhone') > -1,                            //是否为iPhone
        isWX: ua.indexOf('MicroMessenger') > -1                         //是否微信
    }
})()

/**
 * 键盘弹出收起事件(依赖 platform)
 * @param eject   弹出回调函数
 * @param retract 收起回调函数
 * @returns {*}   返回事件处理函数
 */

export const kbEvt = (eject, retract) => {
    if (platform.isAndroid) {
        const clientHeight = document.documentElement.clientHeight || document.body.clientHeight,
            androidEvt = () => {
                const nowClientHeight = document.documentElement.clientHeight || document.body.clientHeight
                if (clientHeight > nowClientHeight) {
                    eject()
                } else {
                    retract()
                }
            }
        window.addEventListener('resize', androidEvt)
        return {
            androidEvt
        }
    }
    if (platform.isIOS) {
        const focusinEvt = () => {
                eject()
            },
            focusoutEvt = () => {
                retract()
            }
        document.addEventListener('focusin', focusinEvt, false)
        document.addEventListener('focusout', focusoutEvt, false)
        return {
            focusinEvt,
            focusoutEvt
        }
    }
}
/**
 * 清除键盘事件（依赖 platform ,kbEvt）
 * @param evtObj 默认传入事件处理函数
 */

export const removeKbEvt = (evtObj) => {
    if (platform.isAndroid) {
        window.removeEventListener('resize', evtObj.androidEvt)
    }
    if (platform.isIOS) {
        document.removeEventListener('focusin', evtObj.focusinEvt)
        document.removeEventListener('focusout', evtObj.focusoutEvt)
    }
}


/**
 * 分时函数
 * @param ary       完整的数据
 * @param fn        逻辑处理函数
 * @param count     每次渲染的个数
 */

export const timeChunk = (ary, fn, count, inerval) => {
    let timer,
        start = () => {
            for (let i = 0; i < Math.min(count || 1, ary.length); i++) {
                let obj = ary.shift()
                fn(obj)
            }
        }
    timer = setInterval(() => {
        if (ary.length === 0) {
            return clearInterval(timer)
        }
        start()
    }, inerval || 200)
};

/**
 * 节流函数
 * @param fn        需要节流的函数
 * @param interval  时间间隔
 */

export const throttle = (func, interval) => {
    let timer,
        firstTime = true
    return function () {
        let args = arguments,
            self = this
        if (firstTime) {
            func.apply(self, args)
            return firstTime = false
        }
        if (!timer) {
            timer = setTimeout(() => {
                clearTimeout(timer)
                timer = null
                func.apply(self, args)
            }, interval || 500)
        }

    }
}


/**
 * 防抖函数
 * @param 需要防抖的函数
 * @param 等待时间
 */
export const debounce = (func, wait) => {
    let timeout
    return function () {
        let self = this
        clearTimeout(timeout)
        timeout = setTimeout(function () {
            func.apply(self, arguments)
        }, wait || 500)
    }
}


/**
 * ios 原生和H5交互
 */

export const bridge = (() => {
    const setupWebViewJavascriptBridge = (callback) => {
        if (window.WebViewJavascriptBridge) {
            return callback(window.WebViewJavascriptBridge)
        }
        if (window.WVJBCallbacks) {
            return window.WVJBCallbacks.push(callback)
        }
        window.WVJBCallbacks = [callback]
        let WVJBIframe = document.createElement('iframe')
        WVJBIframe.style.display = 'none'
        WVJBIframe.src = 'https://__bridge_loaded__'
        document.documentElement.appendChild(WVJBIframe)
        setTimeout(() => {
            document.documentElement.removeChild(WVJBIframe)
        }, 0)
    }
    return {
        /**
         * h5主动调用ios注册的方法
         * @param name ios提供的方法
         * @param data 传给ios的参数为json对象，
         * @param callback 回调函数
         */
        callhandler(name, data, callback) {
            let args = [...arguments]
            typeof args[1] === 'function' ? args.splice(1, 0, {}) : args
            setupWebViewJavascriptBridge(function (bridge) {
                bridge.callHandler(...args)
            })
        },
        /**
         * h5 注册方法由 ios调用
         * @param name     方法名
         * @param callback 回调函数
         */
        registerhandler(name, callback) {
            setupWebViewJavascriptBridge(function (bridge) {
                bridge.registerHandler(name, function (data, responseCallback) {
                    callback(data, responseCallback)
                })
            })
        }
    }
})()


/**
 * 解析URL传参
 * @param {Object} key
 */

export const getQueryString = (key) => {
    let search = window.location.search;
    if (window.location.indexOf('?') === -1) return null; //如果url中没有传参直接返回空
    //key存在先通过search取值如果取不到就通过hash来取
    search = search.substr(1) || window.location.hash.split("?")[1];

    if (search) {
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
        var r = search.match(reg);
        if (r != null) {
            return decodeURIComponent(r[2]);
        } else {
            return null;
        }
    }
}


/**
 * 通过a标签下载
 * @param
 */
export const downloadFileA = (url) => {
    const aLink = document.createElement('a')
    const evt = document.createEvent('MouseEvents')
    evt.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    aLink.setAttribute('download', '')
    aLink.href = url
    aLink.dispatchEvent(evt)
    aLink.remove()
    return aLink.href;
}


export const snowFalling = {
    inserted(el, bind) {
        let type = bind.value, leafs, count
        if (type === 'spring') {
            leafs = [leaf0, leaf1, leaf2, leaf3, leaf4, leaf5, leaf6, leaf7, leaf8];
            count = 200;
        } else if (type === 'midAutomn') {
            leafs = [midLeaf1, midLeaf2, midFlower1, midFlower2];
            count = 10;
        }


        // Cross-browser-compliant
        requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            function (callback) {
                setTimeout(callback, 1000 / 60);
            };

        /**
         * Snow Class
         * @param {int}   x
         * @param {int}   y
         * @param {int}   radius
         * @param {Function} fn     Formular to calculate x pos and y pos
         */
        function Snow(x, y, radius, fn, leafs) {
            this.src = leafs[Math.floor(Math.random() * leafs.length)]
            this.x = x;
            this.y = y;
            this.r = radius;
            this.fn = fn;
        }

        Snow.prototype.update = function () {
            this.x = this.fn.x(this.x, this.y);
            this.y = this.fn.y(this.y, this.y);

            if (this.x > window.innerWidth ||
                this.x < 0 ||
                this.y > window.innerHeight ||
                this.y < 0
            ) {
                this.x = getRandom('x');
                this.y = 0;
            }
        }
        Snow.prototype.draw = function (cxt) {
            var img = new Image();
            img.src = this.src;
            cxt.drawImage(img, this.x, this.y);
            img = null;
            // var grd = cxt.createRadialGradient (this.x, this.y, 0, this.x, this.y, this.r);
            // grd.addColorStop(0, "rgba(255, 255, 255, 0.9)");
            // grd.addColorStop(.5, "rgba(255, 255, 255, 0.5)");
            // grd.addColorStop(1, "rgba(255, 255, 255, 0)");
            // cxt.fillStyle = grd;
            // cxt.fillRect (this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
        }

        /**
         * Snowlist class
         * Container to hold snow objects
         */
        let SnowList = function () {
            this.list = [];
        }
        SnowList.prototype.push = function (snow) {
            this.list.push(snow);
        }
        SnowList.prototype.update = function () {
            for (var i = 0, len = this.list.length; i < len; i++) {
                this.list[i].update();
            }
        }
        SnowList.prototype.draw = function (cxt) {
            for (var i = 0, len = this.list.length; i < len; i++) {
                this.list[i].draw(cxt);
            }
        }
        SnowList.prototype.get = function (i) {
            return this.list[i];
        }
        SnowList.prototype.size = function () {
            return this.list.length;
        }

        /**
         * Generate random x-pos, y-pos or fn functions
         * @param  {string} option x|y|fnx|fny
         * @return {int|Function}
         */
        function getRandom(option) {
            var ret, random;
            switch (option) {
                case 'x':
                    ret = Math.random() * window.innerWidth;
                    break;
                case 'y':
                    ret = Math.random() * window.innerHeight;
                    break;
                case 'r':
                    ret = 2 + (Math.random() * 6);
                    break;
                case 'fnx':
                    random = 27 + Math.random() * 100;
                    ret = function (x, y) {
                        return x + 0.5 * Math.sin(y / random);
                    };
                    break;
                case 'fny':
                    random = 0.4 + Math.random() * 1.4
                    ret = function (x, y) {
                        return y + random;
                    };
                    break;
            }
            return ret;
        }

        // Start snow
        function startSnow() {
            // Create canvas
            var canvas = document.createElement('canvas'), cxt;
            canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;
            canvas.setAttribute('style', 'position: fixed;left: 0;top: 0;pointer-events: none;');
            canvas.setAttribute('id', 'canvas_snow');
            el.appendChild(canvas);
            cxt = canvas.getContext('2d');
            // Create snow objects
            var snowList = new SnowList();
            for (var i = 0; i < count; i++) {
                var snow, randomX, randomY, randomR, randomFnx, randomFny;
                randomX = getRandom('x');
                randomY = getRandom('y');
                randomR = getRandom('r');
                randomFnx = getRandom('fnx');
                randomFny = getRandom('fny');
                snow = new Snow(randomX, randomY, randomR, {
                    x: randomFnx,
                    y: randomFny
                }, leafs);
                snow.draw(cxt);
                snowList.push(snow);
            }
            // 递归调用
            loop();

            function loop() {
                requestAnimationFrame(function () {
                    cxt.clearRect(0, 0, canvas.width, canvas.height);
                    snowList.update();
                    snowList.draw(cxt);
                    loop();
                })
            }
        }

        // 窗口变化
        window.onresize = function () {
            var canvasSnow = document.getElementById('canvas_snow');
            canvasSnow.width = window.innerWidth;
            canvasSnow.height = window.innerHeight;
        }

        startSnow();
    }
}

const clickoutsideContext = '@@clickoutsideContext';
export const clickoutside = {
    /*
       @param el 指令所绑定的元素
       @param binding {Object}
       @param vnode vue编译生成的虚拟节点
   */
    bind(el, binding, vnode) {
        const documentHandler = function (e) {
            // console.log(el)
            // console.log(e.target);
            // console.log(vnode);
            // console.log(binding);

            if (!vnode.context || el.contains(e.target)) {
                return false;
            }
            if (binding.expression) {
                vnode.context[el[clickoutsideContext].methodName](e)
            } else {
                el[clickoutsideContext].bindingFn(e);
            }
        }
        el[clickoutsideContext] = {
            documentHandler,
            methodName: binding.expression,
            bindingFn: binding.value
        }
        setTimeout(() => {
            document.addEventListener('click', documentHandler);
        }, 0)
    },
    update(el, binding) {
        el[clickoutsideContext].methodName = binding.expression;
        el[clickoutsideContext].bindingFn = binding.value;
    },
    unbind(el) {
        document.removeEventListener('click', el[clickoutsideContext].documentHandler);
    }
}
