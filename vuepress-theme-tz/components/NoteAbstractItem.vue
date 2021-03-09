<template>
  <div
       class="abstract-item"
       @click="$router.push(item.path)">
    <i v-if="item.frontmatter.sticky" class="iconfont reco-sticky"></i>
    <div class="cover">
      <img class="cover-img" :src="cover" :alt="item.title" />
    </div>
    <div class="info">
      <div class="title">
        <i v-if="item.frontmatter.keys" class="iconfont reco-lock"></i>
        <router-link :to="item.path">{{item.title}}</router-link>
      </div>
      <div class="abstract" v-html="item.excerpt"></div>
      <PageInfo
                :pageInfo="item"
                :currentTag="currentTag">
      </PageInfo>
    </div>
  </div>
</template>

<script>
import PageInfo from './PageInfo'
import {randomNumOfLength} from '@theme/helpers/utils'
export default {
  components: { PageInfo },
  props: ['item', 'currentPage', 'currentTag'],
  computed: {
      cover () {
        return this.item.frontmatter.cover
        || (this.$themeConfig.covers && this.$themeConfig.covers[randomNumOfLength(this.$themeConfig.covers.length)])
        || '/picture/325105.jpg';
      }
    }
}
</script>

<style lang="stylus" scoped>
@require '../styles/mode.styl';

.abstract-item {
  position: relative;
  display: inline-flex;
  margin: 0 auto 20px;
  padding: 16px 20px;
  width: 100%;
  overflow: hidden;
  // border-radius: $borderRadius;
  box-shadow: var(--box-shadow);
  box-sizing: border-box;
  transition: all 0.3s;
  background-color: var(--background-color);
  cursor: pointer;

  &:hover {
    box-shadow: var(--box-shadow-hover);

    .cover .cover-img {
      transform: scale(1);
    }
  }

  > * {
    pointer-events: auto;
  }

  .reco-sticky {
    position: absolute;
    top: 0;
    left: 0;
    display: inline-block;
    color: $accentColor;
    font-size: 2.4rem;
  }

  // 边框样式 - 公共
  & {
    transition: color 0.25s;
  }

  &:hover {
    &::before, &::after {
      width: 100%;
      height: 100%;
    }
  }

  &::before, &::after {
    box-sizing: inherit;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid transparent;
    width: 0;
    height: 0;
  }

  // 边框样式 1
  &:nth-child(3n + 1) {
    &::before {
      top: 0;
      left: 0;
    }

    &::after {
      bottom: 0;
      right: 0;
    }

    &:hover {
      &::before {
        width: 100%;
        height: 100%;
        border-top-color: #ff2900;
        border-right-color: #ff2900;
        transition: width 0.25s ease-out, height 0.25s ease-out 0.25s;
      }

      &::after {
        width: 100%;
        height: 100%;
        border-bottom-color: #ff2900;
        border-left-color: #ff2900;
        transition: border-color 0s ease-out 0.5s, width 0.25s ease-out 0.5s, height 0.25s ease-out 0.75s;
      }
    }
  }

  // 边框样式 2
  &:nth-child(3n + 2) {
    &::after {
      top: 0;
      left: 0;
    }

    &::before {
      bottom: 0;
      right: 0;
    }

    &:hover {
      &::before {
        border-top-color: #ffe51c;
        border-right-color: #ffe51c;
        transition: width 0.25s ease-out 0.25s, height 0.25s ease-out;
      }

      &::after {
        border-bottom-color: #ffe51c;
        border-left-color: #ffe51c;
        transition: height 0.25s ease-out, width 0.25s ease-out 0.25s;
      }
    }
  }

  // 边框样式 3
  &:nth-child(3n + 3) {
    &:hover {
      &::before, &::after {
        transform: scale3d(1, 1, 1);
        transition: transform 0.5s, -webkit-transform 0.5s;
      }
    }

    &::before, &::after {
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      transform-origin: center;
    }

    &::before {
      border-top: 2px solid #ff0041;
      border-bottom: 2px solid #ff0041;
      transform: scale3d(0, 1, 1);
    }

    &::after {
      border-left: 2px solid #ff0041;
      border-right: 2px solid #ff0041;
      transform: scale3d(1, 0, 1);
    }
  }

  &:nth-child(2n) {
    flex-direction: row-reverse;
  }

  .cover {
    max-width: 320px;
    flex: 1;
    overflow: hidden;
    border-radius: 0.5rem;

    .cover-img {
      border-radius: 0.5rem;
      max-width: 320px;
      transform: scale(1.5);
      transition: transform 1s;
      height: 12.5rem;
    }
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 12.5rem;

    .title {
      position: relative;
      font-size: 1.28rem;
      line-height: 46px;
      display: inline-block;
      margin: 0 2rem;

      a {
        color: var(--text-color);
      }

      .reco-lock {
        font-size: 1.28rem;
        color: $accentColor;
      }

      &:after {
        content: '';
        position: absolute;
        width: 100%;
        height: 2px;
        bottom: 0;
        left: 0;
        background-color: $accentColor;
        visibility: hidden;
        -webkit-transform: scaleX(0);
        transform: scaleX(0);
        transition: 0.3s ease-in-out;
      }
    }

    .abstract {
      margin: 0 1rem;
    }
  }

  .tags {
    .tag-item {
      &.active {
        color: $accentColor;
      }

      &:hover {
        color: $accentColor;
      }
    }
  }
}

@media (max-width: 1080px) {
  .cover {
    display: none;
  }
}

@media (max-width: $MQMobile) {
  .tags {
    display: block;
    margin-top: 1rem;
    margin-left: 0 !important;
  }

  .abstract-item {
    display: block;
    text-align: center;

    .cover {
      width: 100%;
      display: inline-flex;
      max-width: 320px;

      .cover-img {
        max-width: 320px;
        width: inherit;
      }
    }

    .info {
      .title {
        margin: 0;
      }
    }
  }
}
</style>
