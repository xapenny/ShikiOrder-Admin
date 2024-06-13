import { defineStore } from 'pinia'
import request from '@/utils/request';
import { ElMessage } from 'element-plus';

interface Product {
    productId: number
    shopId: number
    name: string
    price: number
    description: string
    image: string
    categoryId: number
    categoryName: string
    stock: number
}

interface Category {
    categoryId: number
    shopId: number
    name: string
}


const useProductStore = defineStore('product', {
    state: () => ({
        productList: [] as Product[],
        categoryList: [] as Category[]
    }),
    actions: {
        initializeProduct() {
            request
                .get(__API_URL__ + "manage/product/get")
                .then((res) => {
                    if (!res.data.error) {
                        res.data.products.forEach((product: Product) => {
                            product.categoryName = this.getCategoryNameById(product.categoryId)
                        })
                        this.setProductList(res.data.products);
                    } else {
                        ElMessage.error(res.data.error);
                    }
                })
                .catch((err) => {
                    ElMessage.error("商品数据获取失败");
                    console.log(err);
                });
            request
                .get(__API_URL__ + "manage/category/get")
                .then((res) => {
                    if (!res.data.error) {
                        this.setCategoryList(res.data.categories);
                    } else {
                        ElMessage.error(res.data.error);
                    }
                })
                .catch((err) => {
                    ElMessage.error("分类获取失败");
                    console.log(err);
                });
        },
        setProductList(productList: Product[]) {
            this.productList = productList
        },
        setCategoryList(categoryList: Category[]) {
            this.categoryList = categoryList
        },
        clearProductList() {
            this.productList = []
        },
        clearCategoryList() {
            this.categoryList = []
        },
        getProductById(productId: number) {
            return this.productList.find(product => product.productId === productId)
        },
        getProductListByShopId(shopId: number, offset: number, limit: number) {
            return this.productList.filter(product => product.shopId === shopId).slice(offset, offset + limit)
        },
        getProductQuantityByShopId(shopId: number) {
            return this.productList.filter(product => product.shopId === shopId).length
        },
        getCategoryListByShopId(shopId: number) {
            return this.categoryList.filter(category => category.shopId === shopId)
        },
        getCategoryNameById(categoryId: number) {
            return this.categoryList.find(category => category.categoryId === categoryId)?.name || ''
        },
        clearStore() {
            this.clearProductList()
            this.clearCategoryList()
        }
    }
})


export { useProductStore };
export type { Product, Category };
