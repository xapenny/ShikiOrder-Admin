<template>
    <el-button type="primary" style="width: 100%; margin-bottom: 20px;" @click="addRow">
        添加用户
    </el-button>
    <el-table :data="userTable" style="width: 100%" max-height="470">
        <el-table-column prop="nickname" label="用户名" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column label="管理权限">
            <template #default="scope">
                {{ getPermission(scope.row) }}
            </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
            <template #default="{ row, $index }">
                <div v-if="row.role > userStore.role">
                    <el-button size="small" type="warning" @click.prevent="editRow(row)">
                        编辑
                    </el-button>
                    <el-button size="small" type="danger" @click.prevent="deleteRow($index)">
                        删除
                    </el-button>
                </div>
            </template>
        </el-table-column>
    </el-table>
    <el-dialog v-model="dialogTableVisible" title="添加用户" width="800">
        <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto"
            :size="formSize" status-icon>
            <el-form-item label="用户名" prop="username" required>
                <el-input v-model="ruleForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone" required>
                <el-input v-model="ruleForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="密码" prop="password" required v-if="selectedUserId == -1">
                <el-input v-model="ruleForm.password" type="password" placeholder="请输入密码" autocomplete="off" />
            </el-form-item>
            <el-form-item label="用户角色" prop="role" required>
                <el-radio-group v-model="ruleForm.role" class="ml-4">
                    <el-radio :value="0" size="large" v-if="userStore.role === 0">超级管理员</el-radio>
                    <el-radio :value="1" size="large" v-if="userStore.role === 0">商家</el-radio>
                    <el-radio :value="2" size="large" v-if="userStore.role < 2">员工</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="权限范围" prop="permission" required v-if="ruleForm.role === 1 || ruleForm.role === 2">
                <el-select-v2 v-model="ruleForm.permission" placeholder="请选择商家" :options="shopOptions" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm(ruleFormRef)">
                    提交
                </el-button>
            </el-form-item>
        </el-form>
    </el-dialog>

</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useShopStore } from '@/stores/shop';
import { useUserStore } from '@/stores/user';
import type { ComponentSize, FormInstance, FormRules } from 'element-plus';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';
import CryptoJS from 'crypto-js/md5';
import type { SelectOption } from '@/utils/enum';

interface RuleForm {
    id: number | null,
    username: string | null,
    phone: number | null,
    password: string | null,
    role: number | null,
    permission: number | null,
}

interface AdminUser {
    userId: number
    nickname: string
    phone: number
    role: number
    permission: number
}

const router = useRouter()
const userStore = useUserStore()
const shopStore = useShopStore()
const dialogTableVisible = ref(false)
const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
    id: null,
    username: null,
    phone: null,
    password: null,
    role: null,
    permission: null
})
const shopOptions: SelectOption[] = reactive([])
const userTable: AdminUser[] = reactive([])
const selectedUserId = ref(-1)
const rules = reactive<FormRules<RuleForm>>({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('请输入手机号'));
                }
                if (!/^1[3456789]\d{9}$/.test(value)) {
                    return callback(new Error('手机号格式错误'));
                }
                callback();
            },
            trigger: 'blur'
        }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
    ],
    role: [
        { required: true, message: '请选择用户角色', trigger: 'change' },
    ],
    permission: [
        { required: true, message: '请选择权限范围', trigger: 'change' },
    ],

})

const getPermission = (row: any) => {
    if (row.role === 0) {
        return '超级管理员';
    }
    let shop = shopStore.getShopById(row.permission);
    if (row.role === 1) {
        return `商家: ${shop?.name || '未知商家'}`;
    } else if (row.role === 2) {
        return `员工: ${shop?.name || '未知店铺'}`;
    }
}

const addRow = () => {
    selectedUserId.value = -1
    ruleForm.username = null
    ruleForm.phone = null
    ruleForm.role = null
    ruleForm.permission = null
    ruleForm.password = null
    dialogTableVisible.value = true
}

const editRow = (row: AdminUser) => {
    selectedUserId.value = row.userId
    ruleForm.username = row.nickname
    ruleForm.phone = row.phone
    ruleForm.role = row.role
    ruleForm.permission = row.permission
    dialogTableVisible.value = true
}


const deleteRow = (index: number) => {
    let userId = userTable[index].userId
    request
        .post(__API_URL__ + "manage/user/remove", { user_id: userId })
        .then((res) => {
            if (!res.data.error) {
                ElMessage.success("用户删除成功!");
                userTable.splice(index, 1)
            } else {
                ElMessage.error(res.data.error);
            }
        })
        .catch((err) => {
            ElMessage.error("用户获取失败");
            console.log(err);
        });

}

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
            let data = {
                user_id: -1,
                username: ruleForm.username,
                phone: ruleForm.phone,
                password: '',
                role: ruleForm.role,
                permission: ruleForm.permission
            }
            if (selectedUserId.value) {
                data.user_id = selectedUserId.value
            }
            if (ruleForm.password) {
                data.password = CryptoJS(ruleForm.password || '').toString()
            }
            request
                .post(__API_URL__ + "manage/user/update", data)
                .then((res) => {
                    if (!res.data.error) {
                        ElMessage.success("提交成功!");
                        if (data.user_id === -1)
                            userTable.push({
                                userId: res.data.userId,
                                nickname: ruleForm.username || '',
                                phone: ruleForm.phone || -1,
                                role: ruleForm.role || -1,
                                permission: ruleForm.permission || -1
                            })
                        else
                            userTable.forEach((user, index) => {
                                if (user.userId === data.user_id) {
                                    userTable[index] = {
                                        userId: data.user_id,
                                        nickname: ruleForm.username || '',
                                        phone: ruleForm.phone || -1,
                                        role: ruleForm.role || -1,
                                        permission: ruleForm.permission || -1
                                    }
                                }
                            })
                        dialogTableVisible.value = false
                    } else {
                        ElMessage.error(res.data.error);
                    }
                })
                .catch((err) => {
                    ElMessage.error("用户获取失败");
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
    if (userTable.length === 0) {
        request
            .get(__API_URL__ + "manage/user/get")
            .then((res) => {
                if (!res.data.error) {
                    userTable.push(...res.data.users)
                } else {
                    ElMessage.error(res.data.error);
                }
            })
            .catch((err) => {
                ElMessage.error("用户获取失败");
                console.log(err);
            });
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
