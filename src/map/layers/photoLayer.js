import BaseLayer from './baseLayer';
import { VectorLayer, Marker, ui } from 'maptalks-gl';
import eventBus from '@/utils/EventBus';
import UIMarkerLayer from '../core/UIMarkerLayer';

import componentToHtml from '@/map/tools/componentToHtml';
import { AlbumPopup, PhotoPopup } from '@/components/map/popups';

class PhotoLayer extends BaseLayer {
  constructor(options = {}) {
    super(options);
    this.markerLayer = null;
    this.photos = [];
    this.albums = [];
    this.isAlbumMode = false;
    this.infoWindow = null;
    this.uiMarkerLayer = null;
  }

  init(map) {
    super.init(map, false);
    // 创建标记图层
    this.markerLayer = new VectorLayer('photo-markers');
    this.map.addLayer(this.markerLayer);
    this.uiMarkerLayer = new UIMarkerLayer().addTo(map);
    // 注册事件监听器
    this.registerEvents();
  }

  registerEvents() {
    // 直接使用基类的 addEventListeners 方法注册事件
    super.addEventListeners([
      {
        event: 'updatePhotoMarkers',
        handler: (data) => this.updatePhotoMarkers(data.photos || []),
      },
      {
        event: 'updateAlbumMarkers',
        handler: (data) => this.updateAlbumMarkers(data.albums || []),
      },
      {
        event: 'switchMapMode',
        handler: (data) => {
          const { mode, photos, albums } = data;
          this.isAlbumMode = mode === 'album';

          if (this.isAlbumMode) {
            this.updateAlbumMarkers(albums || []);
          } else {
            this.updatePhotoMarkers(photos || []);
          }
        },
      },
    ]);
  }

  /**
   * 更新照片标记
   */
  updatePhotoMarkers(photos) {
    this.photos = photos;
    this.isAlbumMode = false;
    this.clearMarkers();

    if (!this.markerLayer || !photos.length) return;

    const validCoordinates = [];
    // const markers = photos.map((photo) => {
    //   return new ui.UIMarker(photo.coordinates, {
    //     collision: true,
    //     content: componentToHtml({
    //       component: PhotoPopup,
    //       props: {
    //         photo,
    //       },
    //     }),
    //   });
    // });

    // this.uiMarkerLayer.addMarker(markers);

    photos.forEach((photo) => {
      if (!photo.coordinates) return;

      validCoordinates.push(photo.coordinates);

      // 创建照片标记
      const marker = new Marker(photo.coordinates, {
        symbol: {
          markerType: 'pin',
          markerFill: '#4CAF50', // 照片使用绿色
          markerLineColor: '#fff',
          markerLineWidth: 2,
          markerWidth: 30,
          markerHeight: 40,
        },
      });

      // 点击标记显示信息窗口
      marker.on('click', () => {
        this.showPhotoPopup(photo, photo.coordinates);
      });

      // 添加到图层
      marker.addTo(this.markerLayer);
    });

    // 智能定位
    this.updateMapView(validCoordinates);
  }

  /**
   * 更新相册标记
   */
  updateAlbumMarkers(albums) {
    this.albums = albums;
    this.isAlbumMode = true;
    this.clearMarkers();

    if (!this.markerLayer) return;

    // 如果没有相册，跳转到默认位置
    if (!albums.length) {
      this.updateMapView([]);
      return;
    }

    const validCoordinates = [];

    albums.forEach((album) => {
      // 使用第一张照片的坐标作为相册坐标
      if (!album.photos || album.photos.length === 0 || !album.photos[0].coordinates) return;

      const coordinates = album.photos[0].coordinates;
      validCoordinates.push(coordinates);

      // 创建相册标记
      const marker = new Marker(coordinates, {
        symbol: {
          markerType: 'pin',
          markerFill: '#ff6b6b', // 相册使用红色
          markerLineColor: '#fff',
          markerLineWidth: 2,
          markerWidth: 35,
          markerHeight: 45,
        },
      });

      // 点击标记显示信息窗口
      marker.on('click', () => {
        this.showAlbumPopup(album, coordinates);
      });

      // 添加到图层
      marker.addTo(this.markerLayer);
    });

    // 智能定位
    this.updateMapView(validCoordinates);
  }

  /**
   * 显示照片弹窗
   */
  showPhotoPopup(photo, coordinates) {
    if (this.infoWindow) {
      this.infoWindow.remove();
    }

    this.infoWindow = new ui.InfoWindow({
      title: photo.title || '照片',
      content: componentToHtml({
        component: PhotoPopup,
        props: {
          photo,
        },
      }),
    });

    this.infoWindow.addTo(this.map).show(coordinates);

    // 为查看按钮添加点击事件
    setTimeout(() => {
      const viewBtn = document.querySelector('.popup-view-btn');
      if (viewBtn) {
        viewBtn.addEventListener('click', () => {
          eventBus.emit('photo-selected', photo);
          this.infoWindow.remove();
        });
      }
    }, 100);
  }

  /**
   * 显示相册弹窗
   */
  showAlbumPopup(album, coordinates) {
    if (this.infoWindow) {
      this.infoWindow.remove();
    }

    this.infoWindow = new ui.InfoWindow({
      title: album.title,
      content: componentToHtml({
        component: AlbumPopup,
        props: {
          album,
        },
      }),
    });

    this.infoWindow.addTo(this.map).show(coordinates);

    // 为查看按钮添加点击事件
    setTimeout(() => {
      const viewBtn = document.querySelector('.popup-view-btn');
      if (viewBtn) {
        viewBtn.addEventListener('click', () => {
          eventBus.emit('album-selected', album);
          this.infoWindow.remove();
        });
      }
    }, 100);
  }

  /**
   * 清除所有标记
   */
  clearMarkers() {
    if (this.markerLayer) {
      this.markerLayer.clear();
    }
    if (this.infoWindow) {
      this.infoWindow.remove();
      this.infoWindow = null;
    }
  }

  /**
   * 智能定位地图视图
   */
  updateMapView(coordinates) {
    if (!this.map || !coordinates.length) {
      this.goHome();
      return;
    }

    if (coordinates.length === 1) {
      // 只有一个坐标，定位到该点
      this.map.animateTo(
        {
          center: coordinates[0],
          zoom: 12,
        },
        {
          duration: 1000,
        },
      );
    } else {
      // 多个坐标，计算边界并自适应显示
      try {
        let minLng = coordinates[0][0],
          maxLng = coordinates[0][0];
        let minLat = coordinates[0][1],
          maxLat = coordinates[0][1];

        coordinates.forEach((coord) => {
          minLng = Math.min(minLng, coord[0]);
          maxLng = Math.max(maxLng, coord[0]);
          minLat = Math.min(minLat, coord[1]);
          maxLat = Math.max(maxLat, coord[1]);
        });

        // 添加一些边距
        const padding = 0.01;
        const extent = [minLng - padding, minLat - padding, maxLng + padding, maxLat + padding];

        this.map.fitExtent(extent, 0, { animation: true });
      } catch (_error) {
        // fitExtent失败，使用第一个坐标的中心点
        this.map.animateTo(
          {
            center: coordinates[0],
            zoom: 10,
          },
          {
            duration: 1000,
          },
        );
      }
    }
  }

  _showCore(_options) {
    if (this.markerLayer) {
      this.markerLayer.show();
    }
    this._visible = true;
  }

  _hideCore(_options) {
    if (this.markerLayer) {
      this.markerLayer.hide();
    }
    if (this.infoWindow) {
      this.infoWindow.remove();
      this.infoWindow = null;
    }
    this._visible = false;
  }

  destroy() {
    this.clearMarkers();
    if (this.markerLayer) {
      this.map.removeLayer(this.markerLayer);
      this.markerLayer = null;
    }

    // 基类会自动清理事件监听器，无需手动调用
  }
}

const photoLayer = new PhotoLayer();
export default photoLayer;
