<template>
  <component :is="component"></component>
</template>

<script>
export default {
  name: 'LoadingPage',
  components: {
    LoadingPage1: () => import('./LoadingPage1'),
    LoadingPage2: () => import('./LoadingPage2'),
    LoadingPage3: () => import('./LoadingPage3'),
    LoadingPage4: () => import('./LoadingPage4')
  },
  computed: {
    component () {
      const type = this.$themeConfig.loadingType || '1'
      return `LoadingPage${type}`
    }
  }
}
</script>
<style lang="stylus" scoped></style>