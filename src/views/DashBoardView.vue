<template>
    <div class="common-layout">
        <el-container>
            <el-header>
                <h1>统计数据</h1>
            </el-header>
            <el-main>
                <el-row :gutter="16">
                    <el-col :span="8" @click="router.push('/admin/order')">
                        <div class="statistic-card">
                            <el-statistic :value="pendingOrders" value-style="color: orange">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center; color: orange">
                                        待处理订单
                                        <el-tooltip effect="dark" content="订单状态为已付款的订单数" placement="top">
                                            <el-icon style="margin-left: 4px" :size="12">
                                                <Warning />
                                            </el-icon>
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                    <el-col :span="8">
                        <div class="statistic-card">
                            <el-statistic :value="finishedOrders" value-style="color: green">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center; color: green ">
                                        今日已完成订单
                                    </div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                    <el-col :span="8">
                        <div class="statistic-card">
                            <el-statistic :value="canceledOrders" value-style="color: red" title="反应今日已被取消的订单">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center; color: red">
                                        今日已取消订单
                                    </div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                </el-row>
                <el-row :gutter="16">
                    <el-col :span="8">
                        <div class="statistic-card">
                            <el-statistic :value="todayIncome / 100" prefix="¥">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center">
                                        今日总销售额
                                        <el-tooltip effect="dark" content="反应当日总成交额" placement="top">
                                            <el-icon style="margin-left: 4px" :size="12">
                                                <Warning />
                                            </el-icon>
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                    <el-col :span="8">
                        <div class="statistic-card">
                            <el-statistic :value="todayActiveUser">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center">
                                        今日活跃用户
                                        <el-tooltip effect="dark" content="反应今日下单的用户" placement="top">
                                            <el-icon style="margin-left: 4px" :size="12">
                                                <Warning />
                                            </el-icon>
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                    <el-col :span="8">
                        <div class="statistic-card">
                            <el-statistic :value="todayDealedOrders" title="反应今日处理的订单总数">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center">
                                        今日处理订单
                                    </div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                </el-row>
                <el-row :gutter="16">
                    <el-col :span="8">
                        <div class="statistic-card">
                            <el-statistic :value="monthIncome / 100" prefix="¥">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center">
                                        本月总销售额
                                        <el-tooltip effect="dark" content="反应本月总成交额" placement="top">
                                            <el-icon style="margin-left: 4px" :size="12">
                                                <Warning />
                                            </el-icon>
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                    <el-col :span="8">
                        <div class="statistic-card">
                            <el-statistic :value="monthActiveUsers">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center">
                                        本月活跃用户
                                        <el-tooltip effect="dark" content="反应本月下单的用户" placement="top">
                                            <el-icon style="margin-left: 4px" :size="12">
                                                <Warning />
                                            </el-icon>
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                    <el-col :span="8">
                        <div class="statistic-card">
                            <el-statistic :value="monthDealedOrders" title="反应今日处理的订单总数">
                                <template #title>
                                    <div style="display: inline-flex; align-items: center">
                                        本月处理订单
                                    </div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                </el-row>
            </el-main>
        </el-container>
    </div>

</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import {
    Warning,
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';

const router = useRouter();

const pendingOrders = ref(0)
const finishedOrders = ref(0)
const canceledOrders = ref(0)
const todayIncome = ref(0)
const todayActiveUser = ref(0)
const todayDealedOrders = ref(0)
const monthIncome = ref(0)
const monthActiveUsers = ref(0)
const monthDealedOrders = ref(0)


onMounted(() => {
    request
        .get(__API_URL__ + "dashboard")
        .then((res) => {
            if (!res.data.error) {
                var statisticData = res.data;
                pendingOrders.value = statisticData.pendingOrders;
                finishedOrders.value = statisticData.finishedOrders;
                canceledOrders.value = statisticData.canceledOrders;
                todayIncome.value = statisticData.todayIncome;
                todayActiveUser.value = statisticData.todayActiveUsers;
                todayDealedOrders.value = statisticData.todayDealedOrders;
                monthIncome.value = statisticData.monthIncome;
                monthActiveUsers.value = statisticData.monthActiveUsers;
                monthDealedOrders.value = statisticData.monthDealedOrders;
            } else {
                ElMessage.error(res.data.error);
            }
        })
        .catch((err) => {
            ElMessage.error("数据获取失败");
            console.log(err);
        });
})
</script>

<style scoped>
:global(h2#card-usage ~ .example .example-showcase) {
    background-color: var(--el-fill-color) !important;
}

.el-statistic {
    --el-statistic-content-font-size: 28px;
}

.statistic-card {
    height: 100%;
    padding: 20px;
    border-radius: 4px;
    background-color: var(--el-bg-color-overlay);
}

.green {
    color: var(--el-color-success);
}

.red {
    color: var(--el-color-error);
}

h1 {
    font-size: 36px;
    font-weight: 500;
    margin: 20px 20px 50px 20px;

}
</style>
