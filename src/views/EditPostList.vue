<template>
  <div class="editpostlist">
    <div class="editpostlist__loading" v-if="isNowLoading"><!-- Loading --></div>
    <div class="editpostlist__body" v-else>
      <div class="editpostlist__body__signined" v-if="isSignIn">
        <div>
          <div>
            <!-- -->
            <p>リストのタイトルを入力</p>
            <input type="text" v-model="PostListName">
            <!-- -->
            <p>タグを選択</p>
            <div class="editpostlist__body__signined__tags">
              <div><span v-for="tag in tagsList" @mouseover="onTagHovered" @mouseleave="onTagHoverLeaved" v-on:click="onTagClicked">#{{tag}} </span> #<input type="text" class="taginput" ref="taginput" @keyup.enter="onEnterTagInput"></div>
              <div>
                <div><button class="tagSuggestButton" v-for="(tag, index) in tagSuggestList" v-on:click="onAddTagButton(tag)" :ref="'tagSuggest_'+index">#{{tag}}</button></div>
              </div>
            </div>
            <!-- -->
            <p>このリストに含まれる投稿</p>
            <div class="editpostlist__body__signined__posts">
              <p>{{dispPostList.length}}</p>
            </div>
            <!-- -->
            <p>公開範囲設定</p>
            <div class="editpostlist__body__signined__publicconf">
              <label><input type="radio" v-model="listPublicStatus" value="public">公開</label>
              <label><input type="radio" v-model="listPublicStatus" value="private">非公開</label>
            </div>
            <!-- -->
            <button v-on:click="onSubmit">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import firebase from 'firebase'
var database = firebase.database()
import PlacesManager from '../assets/PlacesManager.js'
import FriendsManager from '../assets/FriendsManager.js'
import PostsManager from '../assets/PostsManager.js'
import MyUtil from '../assets/MyUtil.js'
import TLItem from '@/components/TLItem.vue'

export default {
  name: "editpostlist",
  components: {
    TLItem
  },
  data () {
    return {
      isSignIn: null,
      userInfo: null,
      isNowLoading: true,
      PM: null,
      FM: null,
      PSM: null,
      PostListName: null,
      postsList: [],
      tagsList: [],
      dispPostList: [],
      tagSuggestList: [],
      listPublicStatus: "public"
    }
  },
  watch: {
    tagsList() {
      this.onTagsListChange()
    }
  },
  methods: {
    onTagHovered(e) {
      e.target.innerHTML = "<s>"+e.target.innerHTML+"</s>"
    },
    onTagHoverLeaved(e) {
      e.target.innerHTML = e.target.innerHTML.replace(/<s>|<\/s>/g, "")
    },
    onTagClicked(e) {
      var text = e.target.innerText.slice(1).replace(" ", "")
      var index = this.tagsList.indexOf(text)
      if (index > -1) {
        this.tagsList.splice(index, 1)
      }
    },
    onAddTagButton(tagval) {
      this.tagsList.push(tagval)
    },
    onTagsListChange() {
      for (var i=0;i<this.tagSuggestList.length;i++) {
        var button = this.$refs['tagSuggest_'+i][0]
        var value = button.innerText.slice(1)
        if (this.tagsList.includes(value)) {
          button.disabled = true
        } else {
          button.disabled = false
        }
      }

      this.dispPostList = []
      Object.keys(this.postsList).forEach(k => {
        var tags = this.postsList[k].tags
        if (tags != undefined) {
          var doubleCount = this.tagsList.filter(t=>tags.includes(t)).length   
          if (doubleCount == this.tagsList.length) {
            this.dispPostList.push(this.postsList[k])
          }
        }
      })
      console.log(this.dispPostList)
    },
    onSubmit() {
      if (this.dispPostList.length > 0) {
        if (new MyUtil().isAllValueNotEmpty([this.PostListName, this.listPublicStatus])) {
          database.ref("postlist/"+this.userInfo.uid).push({
            "tags": this.tagsList,
            "name": this.PostListName,
            "status": this.listPublicStatus
          }).then(() => {
            alert("保存しました")
          })
        } else {
          alert("未入力の項目があります")
        }
      }
    }
  },
  mounted() {
    //ログイン状況を確認
    const _this = this
    firebase.auth().onAuthStateChanged(user => {
      _this.isSignIn = (user != null)
      _this.userInfo = user
      _this.isNowLoading = false

      this.PM = new PlacesManager(axios, database, this.userInfo)
      this.FM = new FriendsManager(axios, database, this.userInfo)
      this.PSM = new PostsManager(axios, database, this.userInfo, this.PM, this.FM)

      this.PSM.fetchalltags().then((res)=>{
        this.tagSuggestList = res.map(e=>e.name)
        //描画が終わったら
        this.$nextTick(function() {
          this.PSM.fetchallposts().then((tlitems)=>{
            this.postsList = tlitems
            this.onTagsListChange()
          })
        })
      })

    })
  }
}
</script>

<style scoped lang="scss">
.editpostlist {
  width: 100%;
  height: 100%;
  &__loading {
    width: 100%;
    height: 100%;
  }
  &__body {
    width: 100%;
    height: 100%;
    &__signined {
      width: 100%;
      height: 100%;
    }
  }
}
</style>