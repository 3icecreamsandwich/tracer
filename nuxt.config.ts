export default defineNuxtConfig({
  ssr: false,

  ignore: ['src-tauri/**'],

  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/tailwind.css'],

  devServer: {
    host: '127.0.0.1',
    port: 3000
  },

  vite: {
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    server: {
      strictPort: true,
      watch: {
        ignored: ['**/src-tauri/**']
      }
    }
  },

  watch: {
    ignore: ['**/src-tauri/**']
  }
})
