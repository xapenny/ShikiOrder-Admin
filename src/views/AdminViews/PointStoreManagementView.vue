<template>
    <el-row>
        <el-select v-model="shopId" placeholder="请选择店铺" style="width: 240px" @change="handleShopChange">
            <el-option v-for="item in shopOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" style="width: auto; margin-left: 20px;" @click="handleAddItem"
            :disabled="shopId === null">
            添加商品
        </el-button>
    </el-row>
    <div style="margin-top: 20px;" />
    <el-table :data="itemTable" style="width: 100%" max-height="470">
        <el-table-column prop="itemId" label="ID" width="60" />
        <el-table-column prop="image" label="图片" width="100">
            <template #default="{ row }">
                <img :src="row.image" style="width: 75px; height: 75px" />
            </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="160" />
        <el-table-column prop="price" label="消耗积分" width="80" />
        <el-table-column prop="stock" label="库存" width="60" />
        <el-table-column prop="description" label="描述" width="200" />
        <el-table-column label="操作" fixed="right" width="150">
            <template #default="{ row }">
                <el-button size="small" type="primary" @click="editItem(row)">
                    编辑
                </el-button>
                <el-button size="small" type="danger" @click="deleteItem(row)">
                    删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination layout="prev, pager, next" :total="itemQuantity" style="margin-top: 20px;justify-content: center;"
        @change="changePage" />
    <el-dialog v-model="dialogTableVisible" :title="dialogTitle" width="800">
        <el-form ref="itemFormRef" style="max-width: 600px" :model="itemForm" :rules="rules" label-width="auto"
            :size="formSize" status-icon>
            <el-form-item label="商品名" prop="name">
                <el-input v-model="itemForm.name" placeholder="请输入商品名" />
            </el-form-item>
            <el-form-item label="图片" prop="image" required>
                <input type="file" accept="image/*" @change="uploadImage" />
            </el-form-item>
            <el-form-item label="消耗积分" prop="price">
                <el-input-number v-model="itemForm.price" />
            </el-form-item>
            <el-form-item label="库存" prop="stock">
                <el-input-number v-model="itemForm.stock" />
            </el-form-item>
            <el-form-item label="描述" prop="desc">
                <el-input v-model="itemForm.description" placeholder="请输入商品描述" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm(itemFormRef)">
                    提交
                </el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { useShopStore } from '@/stores/shop';
import { usePointStoreItemStore } from '@/stores/point';
import { useRouter } from 'vue-router';
import { reactive, ref, onMounted, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'
import type { SelectOption } from '@/utils/enum';
import type { PointStoreItem } from '@/stores/point';
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'
import request from '@/utils/request';

const router = useRouter()
const userStore = useUserStore()
const shopStore = useShopStore()
const pointStoreItemStore = usePointStoreItemStore()
const shopId = ref<number | null>(null)
const shopOptions: SelectOption[] = reactive([])
const dialogTableVisible = ref(false)
const dialogTitle = ref('添加商品')
const formSize = ref<ComponentSize>('default')
const itemFormRef = ref<FormInstance>()
const itemForm = reactive<PointStoreItem>({
    itemId: -1,
    shopId: -1,
    name: '',
    type: 0,
    image: '',
    price: 0,
    stock: 0,
    description: '',
})
const itemQuantity = ref(0)
const rules = reactive<FormRules<PointStoreItem>>({
    name: [
        { required: true, message: '请输入商品名', trigger: 'blur' },
    ],
    type: [
        { required: true, message: '请选择类型', trigger: 'change' },
    ],
    image: [
        { required: true, message: '请上传图片', trigger: 'change' },
    ],
    price: [
        { required: true, message: '请输入消耗积分', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value < 1) {
                    callback(new Error('消耗积分不能小于1'))
                } else {
                    callback()
                }
            },
            trigger: 'change',
        },
    ],
    stock: [
        { required: true, message: '请输入库存', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value < 1) {
                    callback(new Error('库存不能小于1'))
                } else {
                    callback()
                }
            },
            trigger: 'change',
        },
    ],

})
const itemTable = reactive<PointStoreItem[]>([])

const uploadImage = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            itemForm.image = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}

const handleAddItem = () => {
    dialogTitle.value = '添加商品'
    itemForm.itemId = -1
    itemForm.name = ''
    itemForm.shopId = shopId.value as number
    itemForm.type = 0
    itemForm.image = ''
    itemForm.price = 0
    itemForm.stock = 0
    itemForm.description = ''
    dialogTableVisible.value = true
}

const handleShopChange = (value: number) => {
    itemTable.length = 0
    itemQuantity.value = pointStoreItemStore.getItemQuantityByShopId(value)
    itemTable.push(...pointStoreItemStore.getItemListByShopId(value, 0, 10))
}

const changePage = (value: number) => {
    itemTable.length = 0
    if (shopId.value != null)
        itemTable.push(...pointStoreItemStore.getItemListByShopId(shopId.value, (value - 1) * 10, 10))
}

const editItem = (item: PointStoreItem) => {
    dialogTitle.value = '编辑商品'
    itemForm.itemId = item.itemId
    itemForm.name = item.name
    itemForm.price = item.price
    itemForm.stock = item.stock
    itemForm.description = item.description
    itemForm.image = item.image
    dialogTableVisible.value = true
}

const deleteItem = (item: PointStoreItem) => {
    request
        .post(__API_URL__ + "manage/point-store/remove", {
            item_id: item.itemId,
        })
        .then((res) => {
            if (!res.data.error) {
                ElMessage.success("删除成功!");
                itemTable.splice(itemTable.indexOf(item), 1)
            } else {
                ElMessage.error(res.data.error);
            }
        })
        .catch((err) => {
            ElMessage.error("数据获取失败");
            console.log(err);
        });
}

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
            request
                .post(__API_URL__ + "manage/point-store/update", {
                    item_id: itemForm.itemId,
                    shop_id: itemForm.shopId,
                    item_name: itemForm.name,
                    item_type: 0,
                    item_price: itemForm.price,
                    item_stock: itemForm.stock,
                    item_description: itemForm.description || '',
                    item_image: itemForm.image,
                })
                .then((res) => {
                    if (!res.data.error) {
                        ElMessage.success("提交成功!");
                        dialogTableVisible.value = false
                        pointStoreItemStore.initializePointStore()
                        if (shopId.value === null) return
                        if (itemForm.itemId === -1) {
                            itemTable.push({
                                itemId: res.data.item_id,
                                shopId: shopId.value,
                                type: 0,
                                name: itemForm.name,
                                price: itemForm.price,
                                stock: itemForm.stock,
                                description: itemForm.description || '',
                                image: itemForm.image,
                            })
                        } else {
                            itemTable.forEach(item => {
                                if (item.itemId === itemForm.itemId) {
                                    item.name = itemForm.name
                                    item.price = itemForm.price
                                    item.stock = itemForm.stock
                                    item.description = itemForm.description || ''
                                    item.image = itemForm.image
                                }
                            })
                        }

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

onMounted(() => {
    if (userStore.role > 1) {
        ElMessage.error('您没有权限')
        router.push('/')
    }
    if (shopStore.shopList.length === 0) {
        shopStore.initializeShop()
    }
    if (pointStoreItemStore.itemList.length === 0) {
        pointStoreItemStore.initializePointStore()
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
