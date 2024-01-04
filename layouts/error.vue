<template lang="pug">
span 存在しないページ、またはエラーが発生したページです。トップページへ戻ります。
</template>

<script>
export default {
  mounted () {
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        location.href = '/'
      }, 5000)
    }
  }
}
</script>
