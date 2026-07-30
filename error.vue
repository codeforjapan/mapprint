<template lang="pug">
span 存在しないページ、またはエラーが発生したページです。トップページへ戻ります。
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  mounted () {
    if (import.meta.env.PROD) {
      setTimeout(() => {
        location.href = '/'
      }, 5000)
    }
  }
}
</script>
