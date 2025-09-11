/*
 * @Author: your name
 * @Date: 2020-05-16 09:37:34
 * @LastEditTime: 2020-05-16 11:33:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \AS\webgisvisualization\src\Animation\Animation.js
 */
class Animation {
    constructor(object) {

    }
    //一般如果直接修改shader的uniform值的话就不需要animateCallback同步去操作了,如果是修改height之类的话还是需要animateCallback同步去操作
    // 修改值大小
    static animate(objecet, attr, endvalue, time, callback = () => { }) {
        const starttime = Date.now()
        const startvalue = objecet[attr]
        const endtime = Date.now() + time * 1000
        if (time === 0) {
            objecet[attr] = endvalue
            callback()
        } else {
            Animation._animation(objecet, attr, startvalue, endvalue, starttime, endtime, callback)
        }
    }
    static _animation(objecet, attr, startvalue, endvalue, starttime, endtime, callback, id) {
        const currenttime = Date.now()
        const progress = (currenttime - starttime) / (endtime - starttime)
        const meaning = startvalue - endvalue
        if (progress <= 1) {
            if (meaning > 0) {
                objecet[attr] = startvalue - progress * Math.abs(meaning)
            } else if (meaning < 0) {
                objecet[attr] = startvalue + progress * Math.abs(meaning)
            }
            const id = requestAnimationFrame(() => {
                Animation._animation(objecet, attr, startvalue, endvalue, starttime, endtime, callback, id)
            })
        } else if (progress >= 1) {
            cancelAnimationFrame(id)
            callback()
        }
    }
    // 同步上述animate修改值大小后进行同步操作
    static animateCallback(callback1, time, callback2 = () => { }) {
        const starttime = Date.now()
        const endtime = Date.now() + time * 1000
        if (time === 0) {
            callback1()
        } else {
            Animation._animationCallback(callback1, starttime, endtime, callback2)
        }
    }
    static _animationCallback(callback1, starttime, endtime, callback2, id) {
        const currenttime = Date.now()
        const progress = (currenttime - starttime) / (endtime - starttime)
        if (progress <= 1) {
            callback1()
            const id = requestAnimationFrame(() => {
                Animation._animationCallback(callback1, starttime, endtime, callback2, id)
            })
        } else if (progress >= 1) {
            cancelAnimationFrame(id)
            callback2()
        }
    }
}

export { Animation }