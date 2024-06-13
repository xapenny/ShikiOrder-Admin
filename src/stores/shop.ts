import { defineStore } from 'pinia'
import request from '@/utils/request';
import { ElMessage } from 'element-plus';

interface Shop {
    shopId: number
    name: string
    address: string
    email: string
    phone: number
    announcement: string
    about: string
    swipers: Swiper[]
}

interface Swiper {
    id: number
    shop_id: number
    image: string
}

const useShopStore = defineStore('shop', {
    state: () => ({
        shopList: [] as Shop[],
    }),
    actions: {
        initializeShop() {
            request
                .get(__API_URL__ + "manage/shop/get")
                .then((res) => {
                    if (!res.data.error) {
                        this.setShopList(res.data.shops);
                    } else {
                        ElMessage.error(res.data.error);
                    }
                })
                .catch((err) => {
                    ElMessage.error("数据获取失败");
                    console.log(err);
                });
        },
        setShopList(shopList: Shop[]) {
            this.shopList = shopList
        },
        clearShopList() {
            this.shopList = []
        },
        setShopSwipers(shopId: number, swipers: Swiper[]) {
            this.shopList.find(shop => shop.shopId === shopId)!.swipers = swipers
        },
        getShopById(shopId: number) {
            return this.shopList.find(shop => shop.shopId === shopId)
        },
        clearStore() {
            this.clearShopList()
        }
    }
})


export { useShopStore };
export type { Shop, Swiper };
