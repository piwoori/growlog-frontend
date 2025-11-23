import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:4000", // 백엔드 주소
});

// 요청 시 토큰 자동 추가
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});