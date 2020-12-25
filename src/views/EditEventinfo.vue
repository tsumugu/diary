<template>
  <div class="editpost">
    <EditEvent :propsPostId=postid />
  </div>
</template>

<script>
import EditEvent from '@/components/EditEvent.vue'

export default {
  name: "editpost",
  components: {
    EditEvent
  },
  data() {
    return {
      postid: null
    }
  },
  mounted() {
    this.postid = this.$route.params.postid
  }
}
</script>

<style scoped lang="scss">
.editpost {
  width: 100%;
  height: 100%;
}
.imgPreview > img {
  width: 100px;
}
</style>