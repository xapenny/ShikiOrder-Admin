import { defineStore } from 'pinia'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { useShopStore } from './shop'
import { useProductStore } from './products'

interface UserInfo {
    id: number
    username: string
    phone: string
    role: number
    permission: number
}

export const useUserStore = defineStore('user', {
    state: () => ({
        id: -1,
        username: '',
        phone: '',
        role: -1,
        permission: -1,
    }),
    actions: {
        initializeUser() {
            request
                .get(__API_URL__ + "info")
                .then((res) => {
                    if (!res.data.error) {
                        const userInfo = res.data;
                        const userObj = {
                            id: userInfo.user_id,
                            username: userInfo.nickname,
                            phone: userInfo.phone,
                            role: userInfo.role,
                            permission: userInfo.permission
                        };
                        this.setUserInfo(userObj);
                    } else {
                        ElMessage.error(res.data.error);
                    }
                })
                .catch((err) => {
                    ElMessage.error("数据获取失败");
                    console.log(err);
                });

        },
        setUserInfo(userInfo: UserInfo) {
            this.id = userInfo.id
            this.username = userInfo.username
            this.phone = userInfo.phone
            this.role = userInfo.role
            this.permission = userInfo.permission
        },
        updateUserBasicInfo(username: string, phone: string) {
            this.username = username
            this.phone = phone
        },
        logoutUser() {
            this.id = -1
            this.username = ''
            this.phone = ''
            this.role = -1
            this.permission = -1
            localStorage.removeItem('bearer')
            useShopStore().clearStore()
            useProductStore().clearStore()
        },
    }
})
