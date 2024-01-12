import axios from "axios";
import {ElMessage} from "element-plus";
import router from "@/router";

const baseURL = "/api";
const instance = axios.create({baseURL});

import {useTokenStore} from "@/stores/token.js";

const tokenStore = useTokenStore();


//响应拦截器，状态码为2xx时执行成功回调，否则执行失败回调
instance.interceptors.response.use(
    //成功回调
    (result) => {
        if(result.data.code===0){
            ElMessage.error(result.data.msg);
            return Promise.reject(result);
        }
        return result.data;
    },
    //失败回调
    (error) => {
        // 状态码为401,419都跳转到登录界面
        if (error.response) {
            const code = error.response.status;
            if (code === 401) {
                ElMessage({message: '请先登录！', type: "error",});
                router.push('/login');
            } else if (code === 419) {
                ElMessage.error("身份已过期,请重新登录！");
                router.push('/login');
            } else {
                ElMessage.error("未知错误:" + error.response.message);
            }
        }
        // 将异步的状态设置为失败状态
        return Promise.reject(error);
    }
);

// 请求拦截器
instance.interceptors.request.use(
    (config) => {
        //登录请求不需要token
        if (config.url.endsWith('/login')) {
            return config;
        }
        //如果有token，将token放入请求头中
        const token = tokenStore.token;
        if (token != null) {
            config.headers['token'] = token;
        } else {
            router.push('/login');
            ElMessage({message: '请先登录！', type: "error",});
            return Promise.reject('token不存在！');
        }
        return config;
    },
    (err) => {
        //请求错误的回调
        return Promise.reject(err);
    }
);

export default instance;
