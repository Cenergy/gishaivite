import { createApp, h } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import router from '@/router';

/**
 *
 * @param {*} options
 * 地图marker和popup使用组件
 * component是导入的组件
 * props是传递给组件的属性数据
 *
   const starRating = componentToHtml({
      component: Image,
      props: { hello: 12321 }
    });

    // marker示例
     const popover = new mapboxgl.Marker({
      element: starRating,
      anchor: "bottom"
    })
      .setLngLat(coordinates)
      .addTo(map);

      //popup 示例
    var popup = new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setDOMContent(starRating)
      .setMaxWidth("300px")
      .addTo(map);
 */
export default function(options) {
    const { component, props = {} } = options;
    if (!component) return document.createElement('div');
    
    // 创建一个临时的容器元素
    const container = document.createElement('div');
    
    // 创建Vue 3应用实例
    const app = createApp({
        render() {
            return h(component, props);
        }
    }).mount(container);
    
    return app.$el || container;
}
