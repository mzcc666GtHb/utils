/**
 * @Description: 移动端工具函数
 * @author  xuweifeng
 * @date 2019/5/9
 */

/**
 * 判断运行平台
 */
export const platform = (() => {
    let u = navigator.userAgent
    return {
        isMobile: !!u.match(/AppleWebKit.*Mobile.*/),          //移动终端
        isIOS: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),     //ios终端
        isAndroid: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
        isIPhone: u.indexOf('iPhone') > -1,                            //是否为iPhone
        isWX: u.indexOf('MicroMessenger') > -1                         //是否微信
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
 * 基于750rem布局
 * 建议在页面最先引入
 * 可以保证在系统字体默认放大的情况下保持布局
 * 注意:不支持某些页面上手动设置字体大小
 */

export const rem = () => {
    const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = () => {
            let cW = document.documentElement.clientWidth,
                iW = window.innerWidth,
                w = Math.max(cW, iW),
                fz
            w = w > 750 ? 750 : w
            fz = ~~(w / 7.5)
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

