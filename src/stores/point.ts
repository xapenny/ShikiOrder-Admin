import { defineStore } from 'pinia'
import request from '@/utils/request';
import { ElMessage } from 'element-plus';

interface PointStoreItem {
    itemId: number
    shopId: number
    type: number
    name: string
    price: number
    image: string
    stock: number
    description: string
}


const usePointStoreItemStore = defineStore('pointStore', {
    state: () => ({
        itemList: [] as PointStoreItem[]
    }),
    actions: {
        initializePointStore() {
            request
                .get(__API_URL__ + "manage/point-store/get")
                .then((res) => {
                    if (!res.data.error) {
                        this.setItemList(res.data.items);
                    } else {
                        ElMessage.error(res.data.error);
                    }
                })
                .catch((err) => {
                    ElMessage.error("商品数据获取失败");
                    console.log(err);
                });
        },
        setItemList(pointStoreItemList: PointStoreItem[]) {
            this.itemList = pointStoreItemList
        },
        clearItemList() {
            this.itemList = []
        },
        getItemById(itemId: number) {
            return this.itemList.find(item => item.itemId === itemId)
        },
        getItemListByShopId(shopId: number, offset: number, limit: number) {
            return this.itemList.filter(item => item.shopId === shopId).slice(offset, offset + limit)
        },
        getItemQuantityByShopId(shopId: number) {
            return this.itemList.filter(item => item.shopId === shopId).length
        },
        clearStore() {
            this.clearItemList()
        }
    }
})


export { usePointStoreItemStore };
export type { PointStoreItem };
