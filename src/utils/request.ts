import axios from "axios";
import router from "@/router";
import { ElMessage } from "element-plus";

// const router = useRouter();
const request = axios.create({
    baseURL: "/",
    timeout: 5000,
});

request.interceptors.request.use(
    (config) => {
        config.headers["Content-Type"] = "application/json;charset=utf-8";
        const userBearer = localStorage.getItem("bearer");
        if (
            userBearer === "null" ||
            userBearer === "" ||
            userBearer === undefined
        ) {
            router.push("/login");
        } else {
            config.headers["Authorization"] = "Bearer " + userBearer;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

request.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    ElMessage.error("登录已过期");
                    localStorage.removeItem("bearer");
                    router.replace({
                        path: "/login",
                        query: {
                            redirect: router.currentRoute.value.fullPath, //登录成功后跳入浏览的当前页
                        },
                    });
            }
        }
    }
);

export default request;