<template>
    <el-row>
        <el-select v-model="shopId" placeholder="请选择店铺" style="width: 240px" @change="handleShopChange">
            <el-option v-for="item in shopOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" style="width: auto; margin-left: 20px;" @click="couponDialogTableVisible = true"
            :disabled="shopId === null">
            添加优惠券
        </el-button>
    </el-row>
    <div style="margin-top: 20px;" />
    <el-table :data="couponTable" style="width: 100%" max-height="470">
        <el-table-column prop="couponId" label="ID" width="60" />
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="threshold" label="使用门槛" width="80">
            <template #default="scope">
                ¥{{ formatPrice(scope.row.threshold) }}
            </template>
        </el-table-column>
        <el-table-column prop="discount" label="优惠金额" width="80">
            <template #default="scope">
                ¥{{ formatPrice(scope.row.discount) }}
            </template>
        </el-table-column>
        <el-table-column prop="discountPercentage" label="优惠百分比" width="100">
            <template #default="scope">
                {{ scope.row.discountPercentage || '0' }}%
            </template>
        </el-table-column>
        <el-table-column prop="validDate" label="有效期至" width="100" />
        <el-table-column label="操作" fixed="right" width="150">
            <template #default="scope">
                <el-button size="small" type="primary" @click.prevent="handleGift(scope.row.couponId)">
                    发放
                </el-button>
                <el-button size="small" type="danger" @click.prevent="handleDelete(scope.row.couponId)">
                    删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination layout="prev, pager, next" :total="couponQuantity" style="margin-top: 20px;justify-content: center;"
        @change="changePage" />
    <el-dialog v-model="couponDialogTableVisible" title="创建优惠券" width="800" @close="handleCouponDialogClose">
        <el-form ref="couponFormRef" style="max-width: 600px" :model="couponForm" :rules="couponFormRules"
            label-width="auto" :size="formSize" status-icon>
            <el-form-item label="优惠券名" prop="name">
                <el-input v-model="couponForm.name" placeholder="请输入优惠券名" disabled />
            </el-form-item>
            <el-form-item label="优惠券类型" prop="type">
                <el-segmented v-model="couponForm.type" :options="couponTypes" @change="handleTypeChange" />
            </el-form-item>
            <el-form-item label="使用门槛" prop="threshold">
                <el-input-number v-model="couponForm.threshold" />
            </el-form-item>
            <el-form-item label="有效期至" prop="date" required>
                <el-date-picker v-model="couponForm.date" type="date" aria-label="请选择日期" placeholder="请选择日期"
                    style="width: 100%" />
            </el-form-item>
            <el-form-item label="扣除百分比" prop="percentage" required v-if="couponForm.type === '优惠百分比'">
                <el-slider v-model="couponForm.percentage" />
            </el-form-item>
            <el-form-item label="扣除金额" prop="discount" required v-if="couponForm.type === '优惠金额'">
                <el-input-number v-model="couponForm.discount" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitCouponForm(couponFormRef)">
                    创建
                </el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
    <el-dialog v-model="giftDialogVisible" @close="handleGiftDialogClose">
        <el-form ref="giftFormRef" style="max-width: 600px" :model="giftForm" :rules="giftFormRules" label-width="auto"
            :size="formSize" status-icon>
            <el-form-item label="发放类型" prop="type">
                <el-checkbox v-model="giftForm.giftAll" label="全部发放" size="large" />
            </el-form-item>
            <el-form-item label="用户手机号" prop="userPhone" v-if="!giftForm.giftAll" required>
                <el-input v-model="giftForm.userPhone" />
            </el-form-item>
            <el-form-item label="数量" prop="quantity">
                <el-input-number v-model="giftForm.quantity" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitGiftForm(giftFormRef)">
                    发放
                </el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, watchEffect } from 'vue'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import { formatPrice } from '@/utils/FormatPrice'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useShopStore } from '@/stores/shop'
import { useCouponStore } from '@/stores/coupon'
import type { Coupon } from '@/stores/coupon'
import type { SelectOption } from '@/utils/enum'
import request from '@/utils/request'

interface CouponForm {
    name: string,
    threshold: number
    percentage: number,
    discount: number,
    date: string,
    type: string,
}

interface GiftForm {
    giftAll: boolean,
    quantity: number,
    userPhone: string,
    couponId: number | null,
}

const router = useRouter()
const userStore = useUserStore()
const shopStore = useShopStore()
const couponStore = useCouponStore()
const shopId = ref<number | null>(null)
const shopOptions: SelectOption[] = reactive([])
const couponQuantity = ref(0)
const couponTable = reactive<Coupon[]>([
])
const couponDialogTableVisible = ref(false)
const giftDialogVisible = ref(false)
const formSize = ref<ComponentSize>('default')
const couponFormRef = ref<FormInstance>()
const couponForm = reactive<CouponForm>({
    name: '',
    threshold: 0,
    percentage: 0,
    discount: 0,
    date: '',
    type: '优惠金额',
})
const giftForm = reactive<GiftForm>({
    giftAll: false,
    userPhone: '',
    couponId: null,
    quantity: 0
})
const giftFormRef = ref<FormInstance>()
const couponTypes = ['优惠金额', '优惠百分比']
const couponFormRules = reactive<FormRules<CouponForm>>({
    name: [
        { required: true, message: '请输入优惠券名', trigger: 'blur' },
        { max: 16, message: '名称不能超过16个字符', trigger: 'blur' },
    ],
    type: [
        {
            required: true,
            message: '请选择类型',
            trigger: 'change',
        },
    ],
    date: [
        {
            type: 'date',
            required: true,
            message: '请选择日期',
            trigger: 'change',
        },
        {
            validator: (rule, value, callback) => {
                if (new Date(value).getTime() < new Date().getTime()) {
                    callback(new Error('日期不能早于今天'))
                } else {
                    callback()
                }
            },
            trigger: 'change',
        },
    ],
    percentage: [
        {
            required: true,
            message: '请输入扣除百分比',
            trigger: 'change',
        },
        {
            validator: (rule, value, callback) => {
                if (value < 1 || value > 100) {
                    callback(new Error('优惠百分比应在1-100之间'))
                } else {
                    callback()
                }
            },
            trigger: 'change',
        },
    ],
    discount: [
        {
            required: true,
            message: '请输入扣除金额',
            trigger: 'change',
        },
        {
            validator: (rule, value, callback) => {
                if (value < 0) {
                    callback(new Error('金额不能为负数'))
                } else {
                    callback()
                }
            },
            trigger: 'change',
        },
    ],
    threshold: [
        {
            required: true,
            message: '请输入使用门槛',
            trigger: 'change',
        },
        {
            validator: (rule, value, callback) => {
                if (value < 0) {
                    callback(new Error('门槛不能为负数'))
                } else {
                    callback()
                }
            },
            trigger: 'change',
        },
    ],
})
const giftFormRules = reactive<FormRules<GiftForm>>({
    userPhone: [
        {
            required: true,
            message: '请输入用户手机号',
            trigger: 'change',
        },
        {
            validator: (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入手机号'))
                } else if (!/^1[3456789]\d{9}$/.test(value.toString())) {
                    callback(new Error('手机号格式错误'))
                } else {
                    callback()
                }
            },
            trigger: 'change',
        },
    ],
    quantity: [
        {
            required: true,
            message: '请输入数量',
            trigger: 'change',
        },
        {
            validator: (rule, value, callback) => {
                if (value < 1) {
                    callback(new Error('数量不能小于1'))
                } else if (value > 5) {
                    callback(new Error('数量不能大于5'))
                } else {
                    callback()
                }
            },
            trigger: 'change',
        },
    ],

})

const handleTypeChange = () => {
    couponForm.percentage = 0
    couponForm.discount = 0
}

const handleCouponDialogClose = () => {
    couponDialogTableVisible.value = false
    couponForm.name = ''
    couponForm.threshold = 0
    couponForm.percentage = 0
    couponForm.discount = 0
    couponForm.date = ''
    couponForm.type = '优惠金额'
}

const handleGift = (couponId: number) => {
    giftForm.couponId = couponId
    giftDialogVisible.value = true
}

const handleGiftDialogClose = () => {
    giftDialogVisible.value = false
    giftForm.giftAll = false
    giftForm.userPhone = ''
    giftForm.couponId = null
}

const handleShopChange = (value: number) => {
    couponTable.length = 0
    couponQuantity.value = couponStore.getCouponQuantityByShopId(value)
    couponTable.push(...couponStore.getCouponListByShopId(value, 0, 10))
}

const changePage = (value: number) => {
    couponTable.length = 0
    if (shopId.value != null)
        couponTable.push(...couponStore.getCouponListByShopId(shopId.value, (value - 1) * 10, 10))
}

const handleDelete = (couponId: number) => {
    ElMessageBox.confirm('删除这个优惠券同时会删除所有拥有该优惠券的用户的优惠券，是否确定？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })
        .then(() => {
            request
                .post(__API_URL__ + "manage/coupon/remove", {
                    coupon_id: couponId,
                })
                .then((res) => {
                    if (!res.data.error) {
                        ElMessage.success("优惠券删除成功");
                        couponTable.splice(couponTable.findIndex(coupon => coupon.couponId === couponId), 1)
                        couponStore.initializeCoupon();
                    } else {
                        ElMessage.error(res.data.error);
                    }
                })
                .catch((err) => {
                    ElMessage.error("商品数据获取失败");
                    console.log(err);
                });
        })
}

const submitGiftForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            if (!giftForm.couponId) {
                ElMessage.error('请选择优惠券')
                return
            }
            request
                .post(__API_URL__ + "manage/coupon/gift", {
                    gift_all: giftForm.giftAll,
                    coupon_id: giftForm.couponId,
                    shop_id: shopId.value,
                    phone: giftForm.userPhone,
                    quantity: giftForm.quantity,
                })
                .then((res) => {
                    if (!res.data.error) {
                        ElMessage.success("优惠券发放成功");
                        giftDialogVisible.value = false;
                    } else {
                        ElMessage.error(res.data.error);
                    }
                })
                .catch((err) => {
                    ElMessage.error("商品数据获取失败");
                    console.log(err);
                });
        } else {
            console.log('error submit!', fields)
        }
    })
}

const submitCouponForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            request
                .post(__API_URL__ + "manage/coupon/create", {
                    shop_id: shopId.value,
                    name: couponForm.name,
                    threshold: couponForm.threshold * 100,
                    discount: (couponForm.discount) ? couponForm.discount * 100 : null,
                    discount_percentage: (couponForm.percentage) ? couponForm.percentage : null,
                    valid_date: couponForm.date,
                })
                .then((res) => {
                    if (!res.data.error) {
                        ElMessage.success("优惠券创建成功");
                        couponDialogTableVisible.value = false;
                        couponStore.initializeCoupon();
                        if (shopId.value != null)
                            couponTable.push({
                                couponId: res.data.coupon_id,
                                shopId: shopId.value,
                                name: couponForm.name,
                                type: res.data.type,
                                threshold: couponForm.threshold,
                                discount: couponForm.discount,
                                discountPercentage: couponForm.percentage,
                                validDate: res.data.valid_date
                            })
                    } else {
                        ElMessage.error(res.data.error);
                    }
                })
                .catch((err) => {
                    ElMessage.error("商品数据获取失败");
                    console.log(err);
                });
        } else {
            console.log('error submit!', fields)
        }
    })
}

onMounted(() => {
    if (userStore.role > 1) {
        ElMessage.error('您没有权限')
        router.push('/')
    }
    if (shopStore.shopList.length === 0) {
        shopStore.initializeShop()
    }
    if (couponStore.couponList.length === 0) {
        couponStore.initializeCoupon()
    }
})


watchEffect(() => {
    shopOptions.length = 0;
    shopStore.shopList.forEach(shop => {
        shopOptions.push({
            value: shop.shopId,
            label: shop.name,
        })
    });
});

watchEffect(() => {
    let prefix = couponForm.threshold === 0 ? '全场' : `满${couponForm.threshold}元`
    if (couponForm.discount) {
        couponForm.name = `${prefix}减${couponForm.discount}`
    } else {
        couponForm.name = `${prefix}${(100 - couponForm.percentage) / 10}折`
    }
})
</script>
