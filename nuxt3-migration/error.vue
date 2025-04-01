<template lang="pug">
div
  span 存在しないページ、またはエラーが発生したページです。トップページへ戻ります。
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => {
      router.push('/')
    }, 5000)
  }
})
</script>

<style scoped>
/* Add error page specific styles here */
</style>