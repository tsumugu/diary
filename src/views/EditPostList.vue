<template>
  <div class="editpostlist">
    <div class="editpostlist__loading" v-if="isNowLoading"><!-- Loading --></div>
    <div class="editpostlist__body" v-else>
      <div class="editpostlist__body__signined" v-if="isSignIn">
        <modal class="editpostlist__modal" name="modal-editpostlist" :clickToClose="true" height="95%">
          <div class="editpostlist__modal__contents">
            <div style="height:40px;text-align:left;"><img src="/img/close-black-48dp/2x/outline_close_black_48dp.png" v-on:click='()=>{this.$modal.hide("modal-editpostlist")}' class="icon_clickable" style="width:40px;height:40px;"></div>
            <div class="editpostlist__modal__contents__div">
              <button v-on:click="onClickedDeleteButton">このまとめを削除する</button>
            </div>
            <hr>
            <h1 class="editpostlist__modal__contents__title">投稿まとめ編集</h1>
            <div class="editpostlist__modal__contents__div">
              <h2 class="editpostlist__modal__contents__title">タイトル</h2>
              <input type="text" v-model="postListName">
            </div>
            <div class="editpostlist__modal__contents__div">
              <h2 class="editpostlist__modal__contents__title">公開範囲設定</h2>
              <div>
                <label><input type="radio" v-model="listPublicStatus" value="public">公開</label>
                <label><input type="radio" v-model="listPublicStatus" value="private">非公開</label>
              </div>
            </div>
            <div class="editpostlist__modal__contents__div">
              <button v-on:click="onSubmit">保存</button>
            </div>
          </div>
        </modal>
        <div>
          <h1>投稿まとめ一覧</h1>
          <UAPostListItem :propsItem="postsListsListDisp" @onClickPostList="onClickPostList" :isDispIcon="true" />
        </div>
        <!--
        <div>
          <div>
            <p>リストのタイトルを入力</p>
            <input type="text" v-model="PostListName">
            <p>タグを選択</p>
            <div class="editpostlist__body__signined__tags">
              <div><span v-for="tag in tagsList" @mouseover="onTagHovered" @mouseleave="onTagHoverLeaved" v-on:click="onTagClicked" :key="tag">#{{tag}} </span></div>
              <div>
                <div><button class="tagSuggestButton" v-for="(tag, index) in tagSuggestList" v-on:click="onAddTagButton(tag)" :ref="'tagSuggest_'+index">#{{tag}}</button></div>
              </div>
            </div>
            <p>このリストに含まれる投稿</p>
            <div class="editpostlist__body__signined__posts">
              <p>{{dispPostList.length}}</p>
            </div>
            <p>公開範囲設定</p>
            <div class="editpostlist__body__signined__publicconf">
              <label><input type="radio" v-model="listPublicStatus" value="public">公開</label>
              <label><input type="radio" v-model="listPublicStatus" value="private">非公開</label>
            </div>
            <button v-on:click="onSubmit">保存</button>
          </div>
        </div>
        -->
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import firebase from 'firebase'
var database = firebase.database()
import UAPostListItem from '@/components/UAPostListItem.vue'
import MyUtil from '../assets/MyUtil.js'
/*
import PlacesManager from '../assets/PlacesManager.js'
import FriendsManager from '../assets/FriendsManager.js'
import PostsManager from '../assets/PostsManager.js'
import MyUtil from '../assets/MyUtil.js'
import TLItem from '@/components/TLItem.vue'
*/

export default {
  name: "editpostlist",
  components: {
    UAPostListItem
  },
  data () {
    return {
      isSignIn: null,
      userInfo: null,
      isNowLoading: true,
      postsListsList: [],
      postsListsListDisp: [],
      postListName: null,
      postListId: null,
      listPublicStatus: "public"
      /*
      PM: null,
      FM: null,
      PSM: null,
      PostListName: null,
      postsList: [],
      tagsList: [],
      dispPostList: [],
      tagSuggestList: [],
      listPublicStatus: "public"
      */
    }
  },
  /*
  watch: {
    tagsList() {
      this.onTagsListChange()
    }
  },
  */
  methods: {
    loadPostLists() {
      database.ref("postlist/"+this.userInfo.uid).on('value', (snapshot) =>{
        var lists = snapshot.val()
        if (lists != null || lists != undefined) {
          this.postsListsList = lists
          this.postsListsListDisp = Object.keys(lists).map(k=>{
            var tmpList = lists[k]
            tmpList["listid"] = k
            return tmpList
          }).filter(Boolean)
        }
      })
    },
    onClickPostList(list) {
      var listid = list.listid
      this.postListId = listid
      this.postListName = this.postsListsList[listid].name
      this.listPublicStatus = this.postsListsList[listid].status
      this.$modal.show("modal-editpostlist")
    },
    onClickedDeleteButton() {
      // delete
      new MyUtil().confirmExPromise("このまとめを本当に削除しますか?").then(() => {
        database.ref("postlist/"+this.userInfo.uid+"/"+this.postListId).remove().then(()=>{
          this.loadPostLists()
          this.$modal.hide("modal-editpostlist")
          alert("削除しました")
        })
      })
    },
    onSubmit() {
      //update
      database.ref("postlist/"+this.userInfo.uid+"/"+this.postListId).update({
        "name": this.postListName,
        "status": this.listPublicStatus
      }).then(() => {
        this.loadPostLists()
        this.$modal.hide("modal-editpostlist")
        alert("保存しました")
      })
    }
  },
  mounted() {
    //ログイン状況を確認
    const _this = this
    firebase.auth().onAuthStateChanged(user => {
      _this.isSignIn = (user != null)
      _this.userInfo = user
      _this.isNowLoading = false
      this.loadPostLists()
    })
  }
}
</script>

<style scoped lang="scss">
.editpostlist {
  width: 100%;
  height: 100%;
  &__modal {
    &__contents {
      padding: 20px;
      &__title {
        margin: 0 !important;
      }
      &__div {
        margin: 10px !important;
      }
    }
  }
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