import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                login: resolve(__dirname, 'login.html'),
                register: resolve(__dirname, 'register.html')
            }
        }
    },

    server: {
        proxy: {
            "/api": "http://localhost:3000",
            "/auth": "http://localhost:3000",
            "/login": "http://localhost:3000",
            "/register": "http://localhost:3000"
        }
    },
})