<template>
    <el-row>
        <el-select v-model="shopId" placeholder="请选择店铺" style="width: 240px" @change="handleShopChange">
            <el-option v-for="item in shopOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" style="width: auto; margin-left: 20px;" :disabled="shopId === null"
            @click="handleAddProduct">
            添加菜品
        </el-button>
        <el-button type="warning" style="width: auto; margin-left: 20px;" :disabled="shopId === null"
            @click="handleEditCategory">
            编辑菜品分类
        </el-button>
    </el-row>
    <el-table :data="productTable" style="width: 100%" max-height="470">
        <el-table-column prop="productId" label="菜品ID" width="80" />
        <el-table-column property="image" label="图片" width="150">
            <template #default="{ row }">
                <img :src="row.image" style="width: 75px; height: 75px" />
            </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="name" label="菜品名" />
        <el-table-column label="菜品价格" width="120">
            <template #default="scope">
                ¥{{ formatPrice(scope.row.price) }}
            </template>
        </el-table-column>
        <el-table-column prop="stock" label="菜品库存" width="120" />
        <el-table-column label="操作" fixed="right" width="150">
            <template #default="{ row }">
                <el-button size="small" type="primary" @click.prevent="editProductRow(row)">
                    编辑
                </el-button>
                <el-button size="small" type="danger" @click.prevent="removeProductRow(row)">
                    删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination layout="prev, pager, next" :total="productQuantity" style="margin-top: 20px;justify-content: center;"
        @change="changePage" />
    <el-dialog v-model="createProductDialogVisible" :title="dialogTitle" width="800">
        <el-form ref="productFormRef" style="max-width: 600px" :model="productForm" :rules="productFormRules"
            label-width="auto" status-icon>
            <el-form-item label="菜品名" prop="name">
                <el-input v-model="productForm.name" placeholder="请输入菜品名" />
            </el-form-item>
            <el-form-item label="图片" prop="image" required>
                <input type="file" accept="image/*" @change="uploadImage" />
            </el-form-item>
            <el-form-item label="分类" prop="categoryId" required>
                <el-select v-model="productForm.categoryId" placeholder="请选择分类">
                    <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="价格" prop="price">
                <el-input-number v-model="productForm.price" />
            </el-form-item>
            <el-form-item label="库存" prop="stock">
                <el-input-number v-model="productForm.stock" />
            </el-form-item>
            <el-form-item label="描述" prop="desc">
                <el-input v-model="productForm.description" placeholder="请输入菜品描述" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitProductForm(productFormRef)">
                    提交
                </el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
    <el-dialog v-model="categoryDialogVisible" title="菜品分类" width="500">
        <el-table :data="categoryTable">
            <el-table-column property="categoryId" label="分类ID" width="100" />
            <el-table-column property="name" label="分类名" />
            <el-table-column label="操作" fixed="right" width="150">
                <template #default="scope">
                    <el-button size="small" type="warning" @click.prevent="editCategoryRow(scope.row)">
                        编辑
                    </el-button>
                    <el-button size="small" type="danger" @click.prevent="removeCategoryRow(scope.row)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-button type="primary" style="width: 100%; margin-top: 20px;" v-if="!addCategoryDialogVisible"
            @click="addCategoryDialogVisible = true; categoryForm.categoryId = -1">添加分类</el-button>
        <el-form ref="categoryFormRef" style="margin-top: 20px" :model="categoryForm" label-width="auto"
            v-if="addCategoryDialogVisible" :rules="categoryFormRules">
            <el-form-item label="分类名" prop="name">
                <el-input v-model="categoryForm.name" placeholder="请输入分类名" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" style="width: 100%;" @click="submitCategoryForm(categoryFormRef)">
                    提交
                </el-button>
            </el-form-item>
        </el-form>
    </el-dialog>

</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watchEffect } from 'vue'
import { useShopStore } from '@/stores/shop'
import { useProductStore } from '@/stores/products'
import { ElMessage } from 'element-plus'
import { formatPrice } from '@/utils/FormatPrice'
import type { FormInstance } from 'element-plus'
import type { FormRules } from 'element-plus'
import type { Product } from '@/stores/products'
import type { Category } from '@/stores/products'
import type { SelectOption } from '@/utils/enum'
import request from '@/utils/request'


const shopStore = useShopStore()
const productStore = useProductStore()
const shopId = ref<number | null>(null)
const createProductDialogVisible = ref(false)
const dialogTitle = ref('添加菜品')
const categoryDialogVisible = ref(false)
const addCategoryDialogVisible = ref(false)

interface ProductForm {
    productId: number,
    shopId: number | null,
    categoryId: number | null,
    name: string,
    price: number,
    description: string,
    image: string,
    stock: number
}

interface CategoryForm {
    categoryId: number,
    name: string
}

const currentPage = ref(1)
const productQuantity = ref(0)
const shopOptions: SelectOption[] = reactive([])
const productFormRef = ref<FormInstance>()
const productForm = reactive<ProductForm>({
    productId: -1,
    shopId: null,
    categoryId: null,
    name: '',
    price: 0,
    description: '',
    image: '',
    stock: 0
})
const categoryFormRef = ref<FormInstance>()
const categoryForm = reactive<CategoryForm>({
    categoryId: -1,
    name: ''
})
const productFormRules = reactive<FormRules<ProductForm>>({
    name: [
        { required: true, message: '请输入菜品名', trigger: 'blur' },
    ],
    categoryId: [
        { required: true, message: '请选择分类', trigger: 'change' },
    ],
    image: [
        { required: true, message: '请上传图片', trigger: 'change' },
    ],
    price: [
        { required: true, message: '请输入价格', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value <= 0) {
                    callback(new Error('消耗积分不能小于等于0'))
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
const categoryFormRules = reactive<FormRules<CategoryForm>>({
    name: [
        { required: true, message: '请输入分类名', trigger: 'blur' },
    ],
})
const productTable = reactive<Product[]>([
])
const categoryTable = reactive<Category[]>([])
const categoryOptions: SelectOption[] = reactive([])

const handleEditCategory = () => {
    categoryDialogVisible.value = true
}

const handleAddProduct = () => {
    dialogTitle.value = '添加菜品'
    productForm.productId = -1
    productForm.categoryId = null
    productForm.name = ''
    productForm.price = 0
    productForm.description = ''
    productForm.image = ''
    productForm.stock = 0
    createProductDialogVisible.value = true
}

const handleShopChange = (value: number) => {
    productTable.length = 0
    categoryTable.length = 0
    productQuantity.value = productStore.getProductQuantityByShopId(value)
    productStore.getProductListByShopId(value, 0, 10).forEach(product => {
        product.categoryName = productStore.getCategoryNameById(product.categoryId)
        productTable.push(product)
    })
    categoryTable.push(...productStore.getCategoryListByShopId(value))
    categoryForm.categoryId = -1
    categoryForm.name = ''
    addCategoryDialogVisible.value = false
    currentPage.value = 1

}

const changePage = (value: number) => {
    currentPage.value = value
    productTable.length = 0
    if (shopId.value != null)
        productStore.getProductListByShopId(shopId.value, (value - 1) * 10, 10).forEach(product => {
            product.categoryName = productStore.getCategoryNameById(product.categoryId)
            productTable.push(product)
        })
}

const uploadImage = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            productForm.image = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}

const editCategoryRow = (row: Category) => {
    categoryForm.categoryId = row.categoryId
    categoryForm.name = row.name
    addCategoryDialogVisible.value = true
}

const removeCategoryRow = (row: Category) => {
    request
        .post(__API_URL__ + "manage/category/remove", {
            category_id: row.categoryId
        })
        .then((res) => {
            if (!res.data.error) {
                ElMessage.success("删除成功!");
                categoryTable.splice(categoryTable.indexOf(row), 1)
                productStore.initializeProduct()
            } else {
                ElMessage.error(res.data.error);
            }
        })
        .catch((err) => {
            ElMessage.error("数据获取失败");
            console.log(err);
        });
}

const editProductRow = (row: Product) => {
    dialogTitle.value = '编辑菜品'
    productForm.productId = row.productId
    productForm.shopId = row.shopId
    productForm.categoryId = row.categoryId
    productForm.name = row.name
    productForm.price = row.price / 100
    productForm.description = row.description
    productForm.image = row.image
    productForm.stock = row.stock
    createProductDialogVisible.value = true
}

const removeProductRow = (row: Product) => {
    request
        .post(__API_URL__ + "manage/product/remove", {
            product_id: row.productId
        })
        .then((res) => {
            if (!res.data.error) {
                ElMessage.success("删除成功!");
                productStore.initializeProduct()
                productTable.splice(productTable.indexOf(row), 1)
            } else {
                ElMessage.error(res.data.error);
            }
        })
        .catch((err) => {
            ElMessage.error("数据获取失败");
            console.log(err);
        });
}

const submitCategoryForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
            request
                .post(__API_URL__ + "manage/category/update", {
                    category_id: categoryForm.categoryId,
                    shop_id: shopId.value,
                    category_name: categoryForm.name
                })
                .then((res) => {
                    if (!res.data.error) {
                        ElMessage.success("提交成功!");
                        addCategoryDialogVisible.value = false
                        if (categoryForm.categoryId === -1) {
                            categoryTable.push({
                                categoryId: res.data.category_id,
                                name: categoryForm.name,
                                // @ts-ignore
                                shopId: shopId
                            })
                        } else {
                            categoryTable.forEach(category => {
                                if (category.categoryId === categoryForm.categoryId) {
                                    category.name = categoryForm.name
                                }
                            })
                        }
                        productStore.initializeProduct()
                        categoryForm.categoryId = -1
                        categoryForm.name = ''
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

const submitProductForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
            request
                .post(__API_URL__ + "manage/product/update", {
                    product_id: productForm.productId,
                    shop_id: shopId.value,
                    category_id: productForm.categoryId,
                    product_name: productForm.name,
                    product_price: Math.round(productForm.price * 100),
                    product_description: productForm.description || '',
                    product_image: productForm.image,
                    product_stock: productForm.stock
                })
                .then((res) => {
                    if (!res.data.error) {
                        ElMessage.success("提交成功!");
                        createProductDialogVisible.value = false
                        productStore.initializeProduct()
                        if (shopId.value === null || productForm.categoryId === null) return
                        if (productForm.productId === -1) {
                            productTable.push({
                                productId: res.data.product_id,
                                shopId: shopId.value,
                                categoryId: productForm.categoryId,
                                categoryName: productStore.getCategoryNameById(productForm.categoryId),
                                name: productForm.name,
                                price: Math.round(productForm.price * 100),
                                description: productForm.description || '',
                                image: productForm.image,
                                stock: productForm.stock
                            })
                        } else {
                            productTable.forEach(product => {
                                if (product.productId === productForm.productId) {
                                    // @ts-ignore
                                    product.shopId = shopId.value
                                    // @ts-ignore
                                    product.categoryId = productForm.categoryId
                                    // @ts-ignore
                                    product.categoryName = productStore.getCategoryNameById(productForm.categoryId)
                                    product.name = productForm.name
                                    product.price = Math.round(productForm.price * 100)
                                    product.description = productForm.description || ''
                                    product.image = productForm.image
                                    product.stock = productForm.stock
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
    if (shopStore.shopList.length === 0) {
        shopStore.initializeShop()
    }
    if (productStore.productList.length === 0) {
        productStore.initializeProduct()
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
    if (shopId.value === null) return
    categoryOptions.length = 0
    productStore.getCategoryListByShopId(shopId.value).forEach(category => {
        categoryOptions.push({
            value: category.categoryId,
            label: category.name
        })
    })
});

</script>
