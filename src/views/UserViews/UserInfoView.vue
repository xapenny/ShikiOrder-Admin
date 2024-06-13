<template>
    <div>
        <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto"
            :size="formSize" status-icon label-position="left">
            <el-form-item label="昵称" prop="nickname">
                <el-input v-model="ruleForm.nickname" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
                <el-input v-model="ruleForm.phone" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm(ruleFormRef)">
                    提交
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watchEffect } from 'vue'
import { ElMessage, type ComponentSize, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import request from '@/utils/request';

interface RuleForm {
    nickname: string
    phone: string
}

const router = useRouter();
const userStore = useUserStore();
const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
    nickname: '',
    phone: '',
})
onMounted(() => {
    if (userStore.id < 0) {
        userStore.initializeUser()
    }
}
)

watchEffect(() => {
    ruleForm.nickname = userStore.username
    ruleForm.phone = userStore.phone
})

const rules = reactive<FormRules<RuleForm>>({
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 2, max: 8, message: '昵称长度应在2-8之间', trigger: 'blur' },
    ],
    phone: [
        { required: true, message: '请输入电话号码', trigger: 'blur' },
        { pattern: /^\d{11}$/, message: '电话号码应为11位数字', trigger: 'blur' },
    ]
})

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
            if (ruleForm.nickname === userStore.username && ruleForm.phone === userStore.phone) {
                ElMessage.warning('未修改任何信息')
            } else {
                request
                    .post(__API_URL__ + "update", {
                        nickname: ruleForm.nickname,
                        phone: ruleForm.phone
                    })
                    .then((res) => {
                        if (!res.data.error) {
                            if (userStore.phone != ruleForm.phone) {
                                userStore.logoutUser()
                                ElMessage.success("请使用新手机号重新登录");
                                router.push('/login')
                            } else {
                                userStore.updateUserBasicInfo(ruleForm.nickname, ruleForm.phone)
                                ElMessage.success("修改成功!");
                            }

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
        }
    })
}

</script>

<style scoped></style>