<template>
  <div class="regist">
    <EditEvent />
  </div>
</template>

<script>
import EditEvent from '@/components/EditEvent.vue'

export default {
  name: "regist",
  components: {
    EditEvent
  }
}
</script>

<style scoped lang="scss">
.regist {
  width: 100%;
  height: 100%;
}
.imgPreview > img {
  width: 100px;
}
</style>