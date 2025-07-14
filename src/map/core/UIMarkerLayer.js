export default class UIMarkerLayer {

    constructor() {
        this.markers = [];
        this.map = null;
        this.zIndex = null;
        this.maxZoom = null;
        this.minZoom = null;
        this.opacity = 1;
    }

    _checkMarkers() {
        if (!this.map) {
            return this;
        }
        this.markers.forEach(marker => {
            if (!marker.getMap) {
                return;
            }
            if (!marker.getMap()) {
                marker.addTo(this.map);
            }
        });
        return this;
    }

    _removeMarkers(markers) {
        markers.forEach(marker => {
            if (this.markers.indexOf(marker) > -1) {
                marker.remove();
            }
        });
        return this;
    }

    getMap() {
        return this.map;
    }

    addTo(map) {
        if (this.map) {
            console.warn('has add to map');
            return this;
        }
        this.map = map;
        this._checkMarkers();
        return this;
    }

    remove() {
        this._removeMarkers(this.markers);
        this.map = null;
        return this;
    }

    clear() {
        this._removeMarkers(this.markers);
        this.markers = [];
        return this;
    }

    show() {
        this.markers.forEach(marker => {
            marker.options.visible = true;
        });
        return this;
    }

    hide() {
        this.markers.forEach(marker => {
            marker.options.visible = false;
        });
        return this;
    }

    _markersArrayJudge(markers) {
        markers = Array.isArray(markers) ? markers : [markers];
        return markers.filter(marker => {
            return !!(marker && marker.getMap);
        });
    }

    addMarker(markers) {
        markers = this._markersArrayJudge(markers);
        markers.forEach(marker => {
            if (this.markers.indexOf(marker) === -1) {
                this.markers.push(marker);
            }
        });
        this._checkMarkers();
        return this;
    }

    removeMarker(markers) {
        markers = this._markersArrayJudge(markers);
        this._removeMarkers(markers);
        this.markers = this.markers.filter(marker => {
            return markers.indexOf(marker) === -1;
        });
        return this;
    }

    getMarkers() {
        return this.markers.map(marker => {
            return marker;
        });
    }

    setZIndex(zIndex) {
        if (!maptalks.Util.isNumber(zIndex)) {
            return this;
        }
        this.markers.forEach(marker => {
            marker.setZIndex(zIndex);
        });
        this.zIndex = zIndex;
        return this;
    }

    getZIndex() {
        return this.zIndex;
    }

    setMinZoom(minZoom) {
        if (!maptalks.Util.isNumber(minZoom)) {
            return this;
        }
        this.markers.forEach(marker => {
            marker.options.minZoom = minZoom;
        });
        this.minZoom = minZoom;
        return this;
    }

    getMinZoom() {
        return this.minZoom;
    }

    setMaxZoom(maxZoom) {
        if (!maptalks.Util.isNumber(maxZoom)) {
            return this;
        }
        this.markers.forEach(marker => {
            marker.options.maxZoom = maxZoom;
        });
        this.maxZoom = maxZoom;
        return this;
    }


    getMaxZoom() {
        return this.maxZoom;
    }

    setOpacity(opacity) {
        if (!maptalks.Util.isNumber(opacity)) {
            return this;
        }
        opacity = Math.min(1, opacity);
        opacity = Math.max(0, opacity);
        this.markers.forEach(marker => {
            const dom = marker.getDOM();
            if (dom) {
                dom.style.opacity = opacity;
            }
        });
        this.opacity = opacity;
        return this;
    }

    getOpacity() {
        return this.opacity;
    }

}
