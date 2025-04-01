<template lang="pug">
.error-page
  .error-content
    h1 存在しないページ、またはエラーが発生したページです。
    p トップページへ戻ります!
    button(@click="goHome") 紙マップ
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { navigateTo } from 'nuxt/app'

  // Methods
  const goHome = () => {
    navigateTo('/')
  }

  // Redirect after delay in production
  onMounted(() => {
    console.log('Error page mounted')

    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        navigateTo('/')
      }, 5000)
    }
  })
</script>

<style scoped>
  .error-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
    padding: 1rem;
  }

  .error-content {
    max-width: 500px;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #0078d7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
</style>
