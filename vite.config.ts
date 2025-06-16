import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/vasa-bolt.new-version/", // Set this to your GitHub repo name
  plugins: [vue()],
});
