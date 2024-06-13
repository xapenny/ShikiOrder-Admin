<template>
    <div>
        <el-container>
            <el-container>
                <el-aside width="200px">
                    <el-row class="tac">
                        <el-col>
                            <el-menu default-active="0" class="el-menu-vertical-demo" @select="handleSelect">
                                <el-menu-item index="0">
                                    <el-icon><icon-edit /></el-icon>
                                    <span>个人资料</span>
                                </el-menu-item>
                                <el-menu-item index="1">
                                    <el-icon><icon-key /></el-icon>
                                    <span>修改密码</span>
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
import { useRouter } from 'vue-router'
import {
    Key as IconKey,
    Edit as IconEdit,
} from '@element-plus/icons-vue'

const router = useRouter();

const handleSelect = (key: string) => {
    switch (key) {
        case '0':
            router.push('/user/info')
            break
        case '1':
            router.push('/user/password')
            break
    }
}
</script>