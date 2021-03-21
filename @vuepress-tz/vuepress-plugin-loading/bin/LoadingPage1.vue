<template>
  <div class='loading-page-1'>
    <div class="loading-wrap">
      <div class="loading-card">
        <div class='ball'></div>
        <div class='loading-board board1'>
        </div>
        <div class='loading-board board2'>
        </div>
        <div class='loading-board board3'>
        </div>
      </div>

      <h3 class="loading-text" v-if="$frontmatter.home">6666{{$site.title || $localeConfig.title}}</h3>
      <p class="loading-text" v-if="$frontmatter.home">{{$site.description || $localeConfig.description}}</p>
    </div>
  </div>
</template>

<script scoped>
export default {
  
}
</script>

<style lang="stylus">
.loading-page-1 {
  display: table;
  background-color: rgb(255, 90, 95);
  height: 100vh;
  width: 100vw;

  // background: #fff;
  // background: var(--background-color);
  .loading-wrap {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
  }

  .loading-card {
    width: 200px;
    height: 240px;
    border-radius: 10px;
    margin: auto;
    background-color: white;
    position: relative;
    box-shadow: 4px 4px 8px 2px rgba(0, 0, 0, 0.15);

    .loading-board {
      width: 52px;
      height: 4px;
      position: absolute;
      background-color: rgb(255, 90, 95);
      border-radius: 4px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      animation: loadingBoard 3s linear both infinite;

      &.board2 {
        opacity: 0;
        transform: translate(-50%, -50%);
        animation-delay: 1s;
      }

      &.board3 {
        opacity: 0;
        transform: translate(-50%, -50%);
        animation-delay: 2s;
      }
    }

    .ball {
      width: 14px;
      height: 14px;
      position: absolute;
      left: 50%;
      top: 50%;
      margin-left: -10px;
      margin-top: -10px;
      border-radius: 50%;
      background-color: rgb(255, 90, 95);
      opacity: 0;
      animation: jumpingBall 1s 1s forwards cubic-bezier(0.87, 0.04, 0.26, 0.95) infinite;
    }
  }

  .loading-text {
    color: white;
    // padding-top: 20px;
    // padding-bottom: 40px;
    width: 100%;
    text-align: center;
  }
}

@keyframes loadingBoard {
  0% {
    transform: translate(100%, -1500%);
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    transform: translate(-200%, 1500%);
    opacity: 0;
  }
}

@keyframes loadingBoard {
  0%;
  transform: translate(100%, -900%);
  100%;
  transform: translate(-100%, 900%);
}

@keyframes jumpingBall {
  0% {
    transform: translate(0, -50px) scaleX(1);
    opacity: 1;
  }

  49% {
    transform: translate(0, -2px) scaleX(1.05);
  }

  100% {
    transform: translate(0, -50px);
    opacity: 1;
  }
}
</style>