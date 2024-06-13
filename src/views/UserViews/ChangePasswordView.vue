<template>
    <div>
        <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" status-icon :rules="rules"
            label-width="auto" label-position="left">
            <el-form-item label="新密码" prop="pass">
                <el-input v-model="ruleForm.pass" type="password" autocomplete="off" />
            </el-form-item>
            <el-form-item label="确认密码" prop="checkPass">
                <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" />
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
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import CryptoJS from 'crypto-js/md5';
import request from '@/utils/request';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const ruleFormRef = ref<FormInstance>()

const validatePass = (rule: any, value: any, callback: any) => {
    if (value === '' || value.length < 6) {
        callback(new Error('密码不能小于6位'))
    } else {
        if (ruleForm.checkPass !== '') {
            if (!ruleFormRef.value) return
            ruleFormRef.value.validateField('checkPass')
        }
        callback()
    }
}
const validatePass2 = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== ruleForm.pass) {
        callback(new Error("两次输入密码不一致"))
    } else {
        callback()
    }
}

const ruleForm = reactive({
    pass: '',
    checkPass: '',
})

const rules = reactive<FormRules<typeof ruleForm>>({
    pass: [{ validator: validatePass, trigger: 'blur', required: true }],
    checkPass: [{ validator: validatePass2, trigger: 'blur', required: true }],
})

const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            let md5Result = CryptoJS(ruleForm.pass).toString();
            request
                .post(__API_URL__ + "password", {
                    new_password: md5Result,
                })
                .then((res) => {
                    if (!res.data.error) {
                        ElMessage.success("修改成功! 请重新登录");
                        userStore.logoutUser();
                        router.push('/login');
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
</script>

<style scoped></style>