

import { gsap } from 'gsap'
class GlobeAnimation {
    constructor() {
        this.requestId = null
        this.callbacks = []
        this._animation()
        // GSAP自动处理更新，不需要手动添加update函数
    }
    addAnimation(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback)
        }
    }
    removeAnimation(callback) {
        let result
        this.callbacks.forEach((item, index) => {
            if (callback === item) {
                result = index
            }
        })
        if (typeof result === 'number') {
            this.callbacks.splice(result, 1)
        }
    }
    _animation() {
        try {
            this.callbacks.forEach((item) => {
                item()
            })
        } catch (e) {

        }
        this.requestId = requestAnimationFrame(() => {
            this._animation()
        })
    }
}
export default new GlobeAnimation()