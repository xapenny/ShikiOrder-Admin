<template>
    <div>
        <el-container>
            <el-container>
                <el-aside width="200px">
                    <el-row class="tac">
                        <el-col>
                            <el-menu :default-active="activeIndex" class="el-menu-vertical-demo" @select="handleSelect">
                                <el-menu-item index="0">
                                    <el-icon><icon-list /></el-icon>
                                    <span>订单管理</span>
                                </el-menu-item>
                                <el-menu-item index="1" v-if="userStore.role < 2">
                                    <el-icon><icon-user /></el-icon>
                                    <span>用户管理</span>
                                </el-menu-item>
                                <el-menu-item index="2">
                                    <el-icon><icon-box /></el-icon>
                                    <span>菜品管理</span>
                                </el-menu-item>
                                <el-menu-item index="3" v-if="userStore.role < 2">
                                    <el-icon><icon-shop /></el-icon>
                                    <span>店铺管理</span>
                                </el-menu-item>
                                <el-menu-item index="4" v-if="userStore.role < 2">
                                    <el-icon><icon-tickets /></el-icon>
                                    <span>优惠券管理</span>
                                </el-menu-item>
                                <el-menu-item index="5" v-if="userStore.role < 2">
                                    <el-icon><icon-star /></el-icon>
                                    <span>积分商城管理</span>
                                </el-menu-item>
                            </el-menu>
                        </el-col>
                    </el-row>
                </el-aside>
                <el-container>
                    <el-main>
                        <router-view />
                    </el-main>
                </el-container>
            </el-container>
        </el-container>
    </div>
</template>

<script lang="ts" setup>
import {
    User as IconUser,
    Box as IconBox,
    Shop as IconShop,
    Tickets as IconTickets,
    Star as IconStar,
    List as IconList,
} from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const activeIndex = computed(() => {
    let index = '0';
    switch (router.currentRoute.value.path) {
        case '/admin/order':
            index = '0';
            break;
        case '/admin/user':
            index = '1';
            break;
        case '/admin/product':
            index = '2';
            break;
        case '/admin/shop':
            index = '3';
            break;
        case '/admin/coupon':
            index = '4';
            break;
        case '/admin/point':
            index = '5';
            break;
    }
    return index
})

const handleSelect = (key: string) => {
    switch (key) {
        case '0':
            router.push('/admin/order')
            break
        case '1':
            router.push('/admin/user')
            break
        case '2':
            router.push('/admin/product')
            break
        case '3':
            router.push('/admin/shop')
            break
        case '4':
            router.push('/admin/coupon')
            break
        case '5':
            router.push('/admin/point')
            break
    }
}
</script>