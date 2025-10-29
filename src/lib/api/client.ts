
import axios from 'axios'


export const api = axios.create({
baseURL: import.meta.env.VITE_API_BASE_URL,
withCredentials: true,
timeout: 20000,
})


// Interceptors – inject token
api.interceptors.request.use((config)=>{
const raw = localStorage.getItem('t99.jwt')
if(raw){
const { token } = JSON.parse(raw)
if(token) config.headers.Authorization = `Bearer ${token}`
}
return config
})


api.interceptors.response.use(r=>r, async (error)=>{
// TODO: handle 401 refresh if backend menyediakan /auth/refresh
return Promise.reject(error)
})

