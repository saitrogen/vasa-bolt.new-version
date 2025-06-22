import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vasa-bolt.new-version/',
  plugins: [VueDevTools({
    launchEditor: 'cursor',
  }), vue()],
});