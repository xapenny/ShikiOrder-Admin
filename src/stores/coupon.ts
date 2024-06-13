import { defineStore } from 'pinia'
import request from '@/utils/request';
import { ElMessage } from 'element-plus';

interface Coupon {
    couponId: number,
    shopId: number,
    name: string,
    threshold: number,
    discount: number,
    discountPercentage: number,
    validDate: string,
    type: '优惠金额' | '优惠百分比'
}

const useCouponStore = defineStore('coupon', {
    state: () => ({
        couponList: [] as Coupon[],
    }),
    actions: {
        initializeCoupon() {
            request
                .get(__API_URL__ + "manage/coupon/get")
                .then((res) => {
                    if (!res.data.error) {
                        this.setCouponList(res.data.coupons);
                    } else {
                        ElMessage.error(res.data.error);
                    }
                })
                .catch((err) => {
                    ElMessage.error("商品数据获取失败");
                    console.log(err);
                });
        },
        setCouponList(couponList: Coupon[]) {
            this.couponList = couponList
        },
        clearCouponList() {
            this.couponList = []
        },
        getCouponById(couponId: number) {
            return this.couponList.find(coupon => coupon.couponId === couponId)
        },
        getCouponListByShopId(shopId: number, offset: number, limit: number) {
            return this.couponList.filter(coupon => coupon.shopId === shopId).slice(offset, offset + limit)
        },
        getCouponQuantityByShopId(shopId: number) {
            return this.couponList.filter(coupon => coupon.shopId === shopId).length
        },
        clearStore() {
            this.clearCouponList()
        }
    }
})


export { useCouponStore };
export type { Coupon };
