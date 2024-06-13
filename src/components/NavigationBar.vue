<template>
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :ellipsis="false"
        @select="handleSelect">
        <el-menu-item>
            <img style="width: 50px" src="http://localhost/favicon.ico" alt="Element logo" />
        </el-menu-item>
        <el-menu-item index="0">仪表盘</el-menu-item>
        <el-menu-item index="1">后台管理</el-menu-item>
        <el-menu-item index="2">个人中心</el-menu-item>
        <div class="flex-grow" />
        <el-sub-menu index="3">
            <template #title>欢迎您，{{ userStore.username }}</template>
            <el-menu-item index="3-1">个人中心</el-menu-item>
            <el-menu-item index="3-2" @click="logout">退出登录</el-menu-item>
        </el-sub-menu>
    </el-menu>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const activeIndex = computed(() => {
    let index = '0';
    switch (router.currentRoute.value.matched[1].name) {
        case 'dashboard':
            index = '0';
            break;
        case 'admin_base':
            index = '1';
            break;
        case 'user_base':
            index = '2';
            break;
    }
    return index
})

onMounted(() => {
    if (userStore.id < 0) {
        userStore.initializeUser()
    }
})

const logout = () => {
    userStore.logoutUser();
    ElMessage.success('登出成功');
    router.push('/login');
}

const handleSelect = (key: string) => {
    switch (key) {
        case '0':
            router.push('/dashboard')
            break
        case '1':
            router.push('/admin')
            break
        case '2':
        case '3-1':
            router.push('/user')
            break
        case '3-2':
            router.push('/')
            break
    }
}
</script>

<style>
.flex-grow {
    flex-grow: 1;
}
</style>