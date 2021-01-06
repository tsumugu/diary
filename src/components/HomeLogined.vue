<template>
  <div class="HomeLogined">
    <div class="HomeLogined__ColumnLeftArea">
      <div class="HomeLogined__ColumnLeftArea__HeaderArea"><div class="HomeLogined__ColumnLeftArea__HeaderArea__title">Diary</div><div class="HomeLogined__ColumnLeftArea__HeaderArea__menubutton"><img src="/img/more_horiz-white-48dp/2x/outline_more_horiz_white_48dp.png" class="HomeLogined__ColumnLeftArea__HeaderArea__menubutton__img"></div></div>
      <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea">
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__title">キーワードで検索して振り返る</div>
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromKeywordArea"><input type="text"><button>検索</button></div>
        <hr class="HomeLogined__ColumnLeftArea__ReviewthedayArea__hr">
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__title">ジャンルから振り返る</div>
        <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea">
          <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs tabs">
            <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs__date tabs__wrapper"><div class="tabs__wrapper__items"><img src="/img/watch_later-black-48dp/2x/outline_watch_later_black_48dp.png" class="tabs__wrapper__items__img"><p class="tabs__wrapper__items__text">日時</p></div></div>
            <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs__place tabs__wrapper tabs__wrapper--border"><div class="tabs__wrapper__items"><img src="/img/explore-black-48dp/2x/outline_explore_black_48dp.png" class="tabs__wrapper__items__img"><p class="tabs__wrapper__items__text">場所</p></div></div>
            <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__tabs__friends tabs__wrapper"><div class="tabs__wrapper__items"><img src="/img/group-black-48dp/2x/outline_group_black_48dp.png" class="tabs__wrapper__items__img"><p class="tabs__wrapper__items__text">人物</p></div></div>
          </div>
          <div class="HomeLogined__ColumnLeftArea__ReviewthedayArea__ReviewFromGenleArea__contents"><Calendar /></div>
        </div>
      </div>
    </div>
    <div class="HomeLogined__MainArea"><TimeLine :propsUserInfo=userInfo /></div>
  </div>
</template>

<script>
// https://vcalendar.netlify.app/attributes.html
import TimeLine from '@/components/TimeLine.vue'
import Calendar from 'v-calendar/lib/components/calendar.umd'

export default {
  name: 'HomeLogined',
  components: {
    Calendar,
    TimeLine
  },
  props: {
    propsUserInfo: null
  },
  data() {
    return {
      userInfo: null
    }
  },
  mounted() {
    this.userInfo = this.propsUserInfo
  }
}
</script>

<style scoped lang="scss">
.HomeLogined {
  display:grid;
  grid-template-columns: 450px 1fr;
  width: 100%;
  height: 100%;
  text-align: left;
  &__ColumnLeftArea {
    border: solid 1px #707070;
    &__HeaderArea {
      display:grid;
      grid-template-columns: 1fr 30px;
      padding: 20px;
      color: #ffffff;
      background-color: #BAB8B8;
      &__title {
        font-size: 2rem;
      }
      &__menubutton {
        position: relative;
        &__img {
          width: 30px;
          height: 30px;

          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          margin: auto;
        }
      }
    }
    &__ReviewthedayArea {
      padding: 20px 20px 20px 20px;
      &__title {
        font-size: 1.7rem;
      }
      &__hr {
        margin: 20px 0 20px 0;
        border: solid 1px red;
      }
      &__ReviewFromGenleArea {
        &__contents {
          padding-top: 10px
        }
      }
    }
  }
  &__MainArea {
    background-color: #F7F5F5;
  }
}
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: solid 5px red;
  &__wrapper {
    margin: auto;
    padding: 0 27px 0 29px;
    &--border {
      border: solid red;
      border-width: 0 1px 0 1px;
    }
    &__items {
      display: grid;
      grid-template-columns: 40px 40px;
      &__img {
        width: 40px;
        height: 40px;
      }
      &__text {
        font-size: 1.2rem;
        width: 40px;
        line-height: 0;
      }
    }
  }
}
.tabs__wrapper:hover {
  background-color: pink;
}
</style>
