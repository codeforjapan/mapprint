<template lang="pug">
  span 存在しないページ、またはエラーが発生したページです。トップページへ戻ります。
</template>

<script>
export default {
  mounted () {
    setTimeout(() => {
      location.href = '/'
    }, 5000)

  }
}
</script>
