<template>
    <el-table ref="tableRef" row-key="id" :data="orderTable" style="width: 100%" max-height="500"
        :default-sort="{ prop: 'orderTime', order: 'descending' }">
        <el-table-column prop="orderTime" label="下单时间" sortable width="150" column-key="time" />
        <el-table-column prop="phone" label="手机号" width="110" />
        <el-table-column prop="address" label="地址" :formatter="addrFormatter" />
        <el-table-column label="餐品" width="100">
            <template #default="scope">
                <el-button @click="toggleItemDialog(scope.row)">查看</el-button>
            </template>
        </el-table-column>
        <el-table-column label="总价格" width="100">
            <template #default="scope">
                ¥{{ formatPrice(scope.row.paidPrice) }}
            </template>
        </el-table-column>
        <el-table-column prop="tag" label="状态" width="100" :filters="[
            { text: '待付款', value: '待付款' },
            { text: '已取消', value: '已取消' },
            { text: '备餐中', value: '备餐中' },
            { text: '请取餐', value: '请取餐' },
            { text: '已完成', value: '已完成' },
        ]" :filter-method="filterTag" filter-placement="bottom-end">
            <template #default="scope">
                <el-tag :type="getTagType(scope.row.tag)" disable-transitions>{{ scope.row.tag
                    }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="备注">
            <template #default="scope">
                {{ scope.row.comments }}
            </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
            <template #default="scope">
                <el-button size="small" type="danger" @click="setOrderState(scope.row.orderId, 1)"
                    v-if="scope.row.tag != '已取消' && scope.row.tag != '已完成'">
                    取消
                </el-button>
                <el-button size="small" type="primary" @click="setOrderState(scope.row.orderId, 3)"
                    v-if="scope.row.tag === '备餐中'">
                    出餐
                </el-button>
                <el-button size="small" type="success" @click="setOrderState(scope.row.orderId, 4)"
                    v-if="scope.row.tag === '请取餐'">
                    完成
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination layout="prev, pager, next" :total="totalOrderCount" style="margin-top: 20px;justify-content: center;"
        @change="changePage" />
    <el-dialog v-model="itemDialogVisible" title="餐品列表" width="800" style="margin-top: 30px;">
        <el-table :data="orderProducts" height=400>
            <el-table-column property="image" label="图片" width="150">
                <template #default="{ row }">
                    <img :src="row.image" style="width: 75px; height: 75px" />
                </template>
            </el-table-column>
            <el-table-column property="name" label="商品名" />
            <el-table-column property="quantity" label="数量" width="150" />
            <el-table-column property="price" label="价格" width="200" />
        </el-table>
        <div style="display: flex; justify-content: space-between;">
            <p>备注</p>
            <p>{{ currentComment }}</p>
        </div>
        <div style="display: flex; justify-content: space-between;">
            <p>总价格</p>
            <p style="font-size: large; font-weight: bold;">¥ {{ formatPrice(currentPaidPrice) }}</p>
        </div>
        <el-button type="primary" style="width: 100%; margin-top: 20px;" v-if="currentOrderState === 2"
            @click="setOrderState(currentOrderId, 3)">出餐</el-button>
    </el-dialog>

</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import { useShopStore } from '@/stores/shop';
import { useProductStore } from '@/stores/products';
import type { TableInstance } from 'element-plus'
import { formatPrice } from '@/utils/FormatPrice';
import { ElMessage } from 'element-plus';
import request from '@/utils/request';

interface OrderProducts {
    id: number
    quantity: number
}

interface Order {
    orderId: number
    shopId: number
    shopName: string
    tableId: number
    userId: number
    phone: number
    orderTime: string
    orderState: number
    isTakeout: boolean
    verifyCode: string
    comments: string
    paidPrice: number
    tag: string
    products: OrderProducts[]
}

interface OrderProductDetails {
    id: number
    image: string
    name: string
    quantity: number
    price: string
}
const productStore = useProductStore()
const shopStore = useShopStore()
const orderProducts = ref<OrderProductDetails[]>([])
const currentComment = ref("")
const currentPaidPrice = ref(0)
const currentOrderId = ref(0)
const currentOrderState = ref(0)
const itemDialogVisible = ref(false)
const totalOrderCount = ref(0)
const orderTable = reactive<Order[]>([])
const tableRef = ref<TableInstance>()

const getOrder = async (page: number) => {
    const res = await request.get(__API_URL__ + `manage/order/get?page=${page}`)
    if (!res.data.error) {
        orderTable.length = 0
        totalOrderCount.value = res.data.total_count
        res.data.orders.forEach((order: Order) => {
            orderTable.push(order)
        })
    } else {
        ElMessage.error(res.data.error)
    }
}

const getTagType = (tag: string) => {
    switch (tag) {
        case '待付款':
            return 'warning'
        case '已取消':
            return 'danger'
        case '备餐中':
            return 'warning'
        case '请取餐':
            return 'primary'
        case '已完成':
            return 'success'
    }
}


const toggleItemDialog = (row: Order) => {
    orderProducts.value.length = 0
    currentComment.value = row.comments
    currentPaidPrice.value = row.paidPrice
    console.log(row)
    currentOrderId.value = row.orderId
    currentOrderState.value = row.orderState
    itemDialogVisible.value = !itemDialogVisible.value
    row.products.forEach(product => {
        let productDetail = productStore.getProductById(product.id)
        if (productDetail) {
            orderProducts.value.push({
                id: productDetail.productId,
                image: productDetail.image,
                name: productDetail.name,
                quantity: product.quantity,
                price: `¥${formatPrice(productDetail.price)}x${product.quantity}`
            })
        }
    });
}

const addrFormatter = (row: Order) => {
    let shop = shopStore.getShopById(row.shopId)
    if (!row.tableId) {
        return `${shop?.name || '未知店铺'}`
    } else {
        return `${shop?.name || '未知店铺'} ${row.tableId}号桌`
    }
}
const filterTag = (value: string, row: Order) => {
    return row.tag === value
}

const setOrderState = (orderId: number, state: number) => {
    if (state === 1 || state === 3 || state === 4) {
        request
            .post(__API_URL__ + "manage/order/state/update", { order_id: orderId, state: state })
            .then((res) => {
                if (!res.data.error) {
                    ElMessage.success("订单状态更新成功!")
                    currentOrderState.value = state
                    if (itemDialogVisible.value) {
                        itemDialogVisible.value = false
                    }
                    orderTable.forEach((order, index) => {
                        if (order.orderId === orderId) {
                            orderTable[index].tag = state === 1 ? '已取消' : state === 3 ? '请取餐' : '已完成'
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
    } else {
        ElMessage({
            message: '非法操作',
            type: 'error'
        })
    }
}

const changePage = (page: number) => {
    orderTable.length = 0
    getOrder(page)
}

onMounted(() => {
    if (shopStore.shopList.length === 0) {
        shopStore.initializeShop()
    }
    if (productStore.productList.length === 0) {
        productStore.initializeProduct()
    }
    if (orderTable.length === 0) {
        getOrder(1)
    }
})

</script>
