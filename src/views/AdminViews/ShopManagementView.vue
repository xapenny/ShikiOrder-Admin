<template>
    <el-row v-if="shopId != -1">
        <el-select v-model="shopId" placeholder="请选择店铺" style="width: 240px" @change="shopChange">
            <el-option v-for="item in shopOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="success" style="width: auto; margin-left: 10px;" @click="addShop">
            添加店铺
        </el-button>
        <el-button type="primary" style="width: auto; margin-left: 10px;" :disabled="!shopId"
            @click="manageSwiperDialogVisible = true; addSwiperVisible = false">
            轮播图
        </el-button>
        <el-button type="warning" style="width: auto; margin-left: 10px;" :disabled="!shopId"
            @click="qrDialogVisible = true">
            二维码
        </el-button>
        <el-button type="danger" style="width: auto; margin-left: 10px;" :disabled="!shopId" @click=removeShop>
            删除店铺
        </el-button>
    </el-row>
    <el-row v-if="shopId == -1">
        <el-button style="width: auto;" @click="shopId = null">
            返回
        </el-button>
    </el-row>
    <div style="margin-top: 20px;" />
    <el-form ref="shopFormRef" style="max-width: 605px" :model="shopForm" :rules="ShopFormRules" label-width="auto"
        :size="formSize" status-icon v-if="shopId != null">
        <el-form-item label="店铺名" prop="name">
            <el-input v-model="shopForm.name" placeholder="请输入店铺名" />
        </el-form-item>
        <el-form-item label="店铺公告" prop="announcement">
            <el-input v-model="shopForm.announcement" placeholder="请输入店铺公告" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
            <el-input v-model="shopForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="联系邮箱" prop="email">
            <el-input v-model="shopForm.email" placeholder="请输入联系邮箱" />
        </el-form-item>
        <el-form-item label="关于本店" prop="about">
            <el-input v-model="shopForm.about" type="textarea" placeholder="请输入关于信息" />
        </el-form-item>
        <el-form-item label="地址" required>
            <vqqmap v-model="location" @update="qmapChange" :options="qmapOptions"></vqqmap>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitForm(shopFormRef)">
                提交
            </el-button>
        </el-form-item>
    </el-form>
    <el-dialog v-model="manageSwiperDialogVisible" title="轮播图管理" width="800">
        <el-table :data="shopSwipers" style="width: 100%" max-height="400">
            <el-table-column prop="id" label="ID" width="50" />
            <el-table-column property="image" label="图片">
                <template #default="{ row }">
                    <img :src="row.image" style="width: 175px; height: 175px" />
                </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="100">
                <template #default="{ row }">
                    <el-button type="danger" @click="removeSwiper(row)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-button type="primary" style="width: 100%; margin-top: 20px;" v-if="!addSwiperVisible"
            @click="addSwiperVisible = true">添加轮播图</el-button>
        <el-form ref="swiperFormRef" style="margin-top: 20px" :model="swiperForm" label-width="auto"
            v-if="addSwiperVisible" :rules="swiperFormRules">
            <el-form-item label="图片" prop="image">
                <input type="file" accept="image/*" @change="uploadImage" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" style="width: 100%;" @click="submitSwiperForm(swiperFormRef)">
                    提交
                </el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
    <el-dialog v-model="qrDialogVisible" title="二维码" width="500" :before-close="qrClose">
        <el-input-number v-model="tableId" :min="1" :max="10" @change="qrChange" placeholder="请输入桌号"
            style="width: 100%;" />
        <qrcode-vue :value="qrString" style="width: 100%" type="image/jpeg"
            :color="{ dark: '#000000ff', light: '#ffffffff' }" v-if="tableId" />
    </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watchEffect } from 'vue'
import { useUserStore } from '@/stores/user';
import { useShopStore } from '@/stores/shop';
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import QrcodeVue from 'vue-qrcode'
// @ts-ignore
import vqqmap from 'vue-qqmap'
import request from '@/utils/request';
import type { Swiper } from '@/stores/shop';
import type { SelectOption } from '@/utils/enum'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'

interface ShopForm {
    name: string
    announcement: string
    phone: number | null
    email: string
    about: string
    location: string
}

interface SwiperForm {
    image: string
}

const router = useRouter()
const userStore = useUserStore()
const shopStore = useShopStore()
const shopId = ref<number | null>(null)
const tableId = ref<number | null>(null)
const shopOptions: SelectOption[] = reactive([])
const shopSwipers: Swiper[] = reactive([])
const location = reactive({ lat: '', lng: '', address: '' });
const manageSwiperDialogVisible = ref(false)
const addSwiperVisible = ref(false)
const qrDialogVisible = ref(false)
const qrString = ref('')
const qmapOptions = reactive({
    key: ''
})
const formSize = ref<ComponentSize>('default')
const shopFormRef = ref<FormInstance>()
const shopForm = reactive<ShopForm>({
    name: '',
    announcement: '',
    phone: null,
    email: '',
    about: '',
    location: ''
})
const swiperFormRef = ref<FormInstance>()
const swiperForm = reactive<SwiperForm>({
    image: ''
})
const ShopFormRules = reactive<FormRules<ShopForm>>({
    name: [
        { required: true, message: '请输入店铺名', trigger: 'blur' },
        { min: 2, max: 100, message: '店名长度应介于2-100之间', trigger: 'blur' },
    ],
    phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^\d{11}$/, message: '电话号码应为11位数字', trigger: 'blur' },
    ],
    email: [
        { required: true, message: '请输入联系邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
    ],
    about: [
        { required: true, message: '请输入店铺介绍', trigger: 'blur' },
        { min: 2, max: 1000, message: '店铺介绍长度应介于2-1000之间', trigger: 'blur' },
    ],
    location: [
        { required: true, message: '请选择店铺地址', trigger: 'blur' },
        { pattern: /^.+,\d+\.\d+,\d+\.\d+$/, message: '地址格式错误', trigger: 'blur' },
    ],

})
const swiperFormRules = reactive<FormRules<SwiperForm>>({
    image: [
        { required: true, message: '请上传图片', trigger: 'blur' },
    ],
})
const qrClose = () => {
    tableId.value = null
    qrString.value = ''
    qrDialogVisible.value = false
}
const qrChange = () => {
    qrString.value = `shopId=${shopId.value}&tableId=${tableId.value}`
}
const shopChange = (value: number) => {
    shopId.value = value
    addSwiperVisible.value = false
    if (value !== -1) {
        shopStore.shopList.forEach(shop => {
            if (shop.shopId === value) {
                shopSwipers.length = 0
                shop.swipers.forEach(swiper => {
                    // @ts-ignore
                    shopSwipers.push(swiper.__values__)
                })
                shopForm.name = shop.name
                shopForm.announcement = shop.announcement
                shopForm.phone = shop.phone
                shopForm.email = shop.email
                shopForm.about = shop.about
                shopForm.location = shop.address
                const splitResult = shop.address.split(',');
                if (splitResult.length === 3) {
                    location.address = splitResult[0]
                    location.lat = splitResult[1]
                    location.lng = splitResult[2]
                }
            }
        })
    } else {
        shopSwipers.length = 0
        shopForm.name = ''
        shopForm.announcement = ''
        shopForm.phone = null
        shopForm.email = ''
        shopForm.about = ''
        shopForm.location = ''
    }
}

const qmapChange = (data: any) => {
    if (data.address && data.lat && data.lng) {
        shopForm.location = `${data.address},${data.lat},${data.lng}`
    } else {
        shopForm.location = ''
    }
}

const uploadImage = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            swiperForm.image = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}

const addShop = () => {
    shopId.value = -1
    shopForm.name = ''
    shopForm.announcement = ''
    shopForm.phone = null
    shopForm.email = ''
    shopForm.about = ''
    shopForm.location = ''
    location.address = ''
    location.lat = ''
    location.lng = ''
}

const removeShop = () => {
    ElMessageBox.confirm(
        '删除店铺会删除该店铺的所有信息，包括商品、订单、积分商城、优惠券等信息，确定继续吗',
        'Warning',
        {
            confirmButtonText: '继续',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            request
                .post(__API_URL__ + "manage/shop/remove", {
                    shop_id: shopId.value
                })
                .then((res) => {
                    if (!res.data.error) {
                        ElMessage.success("删除成功!");
                        shopId.value = null
                        shopOptions.length = 0
                        shopStore.initializeShop()
                    } else {
                        ElMessage.error(res.data.error);
                    }
                })
                .catch((err) => {
                    ElMessage.error("数据获取失败");
                    console.log(err);
                });
        })

}

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        console.log(shopForm)
        if (valid) {
            if (shopForm.location === '') {
                ElMessage.error('请选择店铺地址')
                return
            } else {
                request
                    .post(__API_URL__ + "manage/shop/update", {
                        shop_id: shopId.value,
                        shop_name: shopForm.name,
                        shop_announcement: shopForm.announcement,
                        shop_phone: shopForm.phone,
                        shop_email: shopForm.email,
                        shop_about: shopForm.about,
                        shop_address: shopForm.location,
                    })
                    .then((res) => {
                        if (!res.data.error) {
                            ElMessage.success("提交成功!");
                            router.go(0);
                        } else {
                            ElMessage.error(res.data.error);
                        }
                    })
                    .catch((err) => {
                        ElMessage.error("数据获取失败");
                        console.log(err);
                    });
            }
        } else {
            ElMessage.error('请检查输入')
            console.log('error submit!', fields)
        }
    })
}

const submitSwiperForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
            request
                .post(__API_URL__ + "manage/swiper/add", {
                    shop_id: shopId.value,
                    image: swiperForm.image
                })
                .then((res) => {
                    if (!res.data.error) {
                        ElMessage.success("提交成功!");
                        addSwiperVisible.value = false
                        if (shopId.value == null) return;
                        shopSwipers.push({
                            id: res.data.swiper_id,
                            image: swiperForm.image,
                            shop_id: shopId.value
                        })
                        shopStore.initializeShop()
                        swiperForm.image = ''
                    } else {
                        ElMessage.error(res.data.error);
                    }
                })
                .catch((err) => {
                    ElMessage.error("数据获取失败");
                    console.log(err);
                });
        } else {
            ElMessage.error('请检查输入')
        }
    })
}

const removeSwiper = async (row: Swiper) => {
    request
        .post(__API_URL__ + "manage/swiper/remove", {
            swiper_id: row.id
        })
        .then((res) => {
            if (!res.data.error) {
                ElMessage.success("删除成功!");
                shopSwipers.forEach((swiper, index) => {
                    if (swiper.id === row.id) {
                        shopSwipers.splice(index, 1)
                    }
                })
            } else {
                ElMessage.error(res.data.error);
            }
        })
        .catch((err) => {
            ElMessage.error("数据获取失败");
            console.log(err);
        });
}

onMounted(() => {
    if (userStore.role > 1) {
        ElMessage.error('您没有权限')
        router.push('/')
    }
    if (shopStore.shopList.length === 0) {
        shopStore.initializeShop()
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

</script>