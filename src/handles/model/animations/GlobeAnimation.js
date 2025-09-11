

import * as TWEEN from 'tween'
class GlobeAnimation {
    constructor() {
        this.requestId = null
        this.callbacks = []
        this._animation()
        this.addAnimation(TWEEN.update)
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