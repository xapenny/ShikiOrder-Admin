<template>
    <div class="login-container">
        <el-form ref="ruleFormRef" :rules="rules" :model="ruleForm" class="login-page">
            <!-- <h2 class="title" style="margin-bottom: 20px">管理后台登录</h2> -->
            <el-form-item prop="phone">
                <el-input :prefix-icon="User" v-model="ruleForm.phone" clearable>
                </el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="ruleForm.password" :prefix-icon="Lock" clearable show-password
                    @keydown.enter="login(ruleFormRef)">
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" style="width: 100%" @click="login(ruleFormRef)">登 录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { useRouter } from "vue-router";
import { ref, reactive, onMounted } from 'vue';
import { Lock, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from 'element-plus'

interface RuleForm {
    phone: string,
    password: string
}

const router = useRouter();

onMounted(() => {
    if (localStorage.getItem("bearer")) {
        ElMessage.warning("您已登录");
        router.push('/home')
    }
})

const ruleForm = reactive<RuleForm>({
    phone: '',
    password: ''
})
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleForm>>({
    phone: [
        {
            required: true,
            message: "请输入手机号",
            trigger: "blur"
        },
        {
            pattern: /^\d+$/,
            message: "手机号必须为纯数字",
            trigger: "blur"
        },
        {
            min: 11,
            max: 11,
            message: "手机号长度必须为11位",
            trigger: "blur"
        }
    ],
    password: [
        {
            required: true,
            message: "请输入密码",
            trigger: "blur"
        }
    ]
})

const login = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
            const formData = new FormData();
            formData.append("username", ruleForm.phone);
            formData.append("password", ruleForm.password);
            axios.post(
                __API_URL__ + "login",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            )
                .then((res) => {
                    if (!res.data.error) {
                        ElMessage.success("登录成功!");
                        localStorage.setItem("bearer", res.data.access_token);
                        router.push('/home')
                    } else {
                        ElMessage.error("登录失败! " + res.data.error);
                        localStorage.removeItem("bearer");
                    }
                })
                .catch((err) => {
                    ElMessage.error("数据获取失败");
                    console.log(err);
                })
        } else {
            ElMessage.error("请填写正确的手机号和密码")
        }
    })

}

</script>

<style scoped>
.login-container {
    position: fixed;
    width: 100%;
    height: 100vh;
    background: url("https://www.pixelstalk.net/wp-content/uploads/2016/10/Bing-Daily-Backgrounds.jpg");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    margin: -8px
}

.login-page {
    border-radius: 5px;
    margin: 100px auto;
    width: 350px;
    padding: 35px 35px 15px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
}
</style>