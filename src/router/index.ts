import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'base_view',
      redirect: '/dashboard',
      component: () => import('@/views/BaseView.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashBoardView.vue'),
        },
        {
          path: 'admin',
          name: 'admin_base',
          redirect: '/admin/order',
          component: () => import('@/views/AdminViews/AdminBaseView.vue'),
          children: [
            {
              path: 'order',
              name: 'order-management',
              component: () => import('@/views/AdminViews/OrderManagementView.vue'),
            },
            {
              path: 'user',
              name: 'user-management',
              component: () => import('@/views/AdminViews/UserManagementView.vue'),
            },
            {
              path: 'product',
              name: 'product-management',
              component: () => import('@/views/AdminViews/ProductManagementView.vue'),
            },
            {
              path: 'shop',
              name: 'shop-management',
              component: () => import('@/views/AdminViews/ShopManagementView.vue'),
            },
            {
              path: 'coupon',
              name: 'coupon-management',
              component: () => import('@/views/AdminViews/CouponManagementView.vue'),
            },
            {
              path: 'point',
              name: 'point-management',
              component: () => import('@/views/AdminViews/PointStoreManagementView.vue'),
            }
          ]
        },
        {
          path: 'user',
          name: 'user_base',
          redirect: '/user/info',
          component: () => import('@/views/UserViews/UserBaseView.vue'),
          children: [
            {
              path: 'info',
              name: 'user_info',
              component: () => import('@/views/UserViews/UserInfoView.vue'),
            },
            {
              path: 'password',
              name: 'user_password',
              component: () => import('@/views/UserViews/ChangePasswordView.vue'),
            }
          ]
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
        path: "/:catchAll(.*)",
        redirect: "/dashboard"
    }
  ]
})

export default router
