import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "home" */ '../views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/theme-demo',
      name: 'theme-demo',
      component: () => import(/* webpackChunkName: "theme-demo" */ '@/components/demo/ThemeDemo.vue'),
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: () => import(/* webpackChunkName: "gallery" */ '@/views/GalleryView.vue'),
    },
    {
      path: '/map',
      name: 'map',
      component: () => import(/* webpackChunkName: "map" */ '@/views/MapViewTest.vue')
    },
    {
      path: '/mapView',
      name: 'mapView',
      component: () => import(/* webpackChunkName: "map" */ '@/views/GalleryMapView.vue')
    },
    {
      path: '/3d',
      name: 'threed',
      component: () => import(/* webpackChunkName: "threed" */ '@/views/ThreeDView.vue')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import(/* webpackChunkName: "threed" */ '@/views/TestView.vue')
    },
    {
      path: '/geo-worker-demo',
      name: 'GeoWorkerDemo',
      component: () => import('@/components/demo/GeoWorkerDemo.vue')
    },
  ],
})

export default router
