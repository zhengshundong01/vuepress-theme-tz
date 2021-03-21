<template>
  <div class="loading-page-5 panel">
    <h1>0%</h1>
    <div class="square square--1"></div>
    <div class="square square--2"></div>
    <div class="square square--3"></div>
    <div class="square square--4"></div>
    <div class="square square--5"></div>
    <div class="square square--6"></div>
  </div>
</template>
<script>

</script>
<style lang="stylus" scoped>
$rotations = 8;
$boxsize = 30px;
$slidewidth = 30px * 8;
$boxbackground = black;
$baseduration = 3s;
$bodybackground = #222;
$loadingcolor = lighten($bodybackground, 50);

.loading-page-5 {
  width: $slidewidth;
  height: $boxsize;
  // position: absolute
  left: 50%;
  top: 50%;
  margin-left: -$slidewidth / 2;
  margin-top: -$boxsize / 2;
  background-attachment: fixed;
  background: linear-gradient(#039079, #06c4a4);

  h1 {
    text-align: center;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #fff;
  }

  .square {
    height: $boxsize;
    width: $boxsize;
    border-radius: 5px;
    position: absolute;

    &--1 {
      background: url('https://gdurl.com/1N9n') center center / contain no-repeat;
      animation: slide 4s linear infinite, roll 4s linear infinite;
      box-shadow: inset 1px 1px 3px -1px lighten($boxbackground, 20%), 1px 1px 5px -2px darken($boxbackground, 10%);
    }

    &--2 {
      background: url('https://gdurl.com/oX2Z') center center / contain no-repeat;
      animation: slide 5s linear infinite, roll 5s linear infinite;
      box-shadow: inset 1px 1px 3px -1px lighten($boxbackground, 30%), 1px 1px 5px -2px darken($boxbackground, 20%);
    }

    &--3 {
      background: url('https://gdurl.com/iFbT') center center / contain no-repeat;
      animation: slide 6s linear infinite, roll 6s linear infinite;
      box-shadow: inset 1px 1px 3px -1px lighten($boxbackground, 40%), 1px 1px 5px -2px darken($boxbackground, 30%);
    }

    &--4 {
      background: url('https://gdurl.com/KHWd') center center / contain no-repeat;
      animation: slide 7s linear infinite, roll 7s linear infinite;
      box-shadow: inset 1px 1px 3px -1px lighten($boxbackground, 50%), 1px 1px 5px -2px darken($boxbackground, 40%);
    }

    &--5 {
      background: url('https://gdurl.com/69vy') center center / contain no-repeat;
      animation: slide 8s linear infinite, roll 8s linear infinite;
      box-shadow: inset 1px 1px 3px -1px lighten($boxbackground, 60%), 1px 1px 5px -2px darken($boxbackground, 50%);
    }

    &--6 {
      background: url('https://gdurl.com/v7WS') center center / contain no-repeat;
      animation: slide 9s linear infinite, roll 9s linear infinite;
      box-shadow: inset 1px 1px 3px -1px lighten($boxbackground, 70%), 1px 1px 5px -2px darken($boxbackground, 60%);
    }
  }
}

@keyframes pulse {
  0% {
    color: transparentize($loadingcolor, 0.9);
  }

  50% {
    color: transparentize($loadingcolor, 0.3);
  }

  100% {
    color: transparentize($loadingcolor, 0.9);
  }
}

@keyframes roll {
  0% {
    transform: rotate(0deg);
  }

  10% {
    transform: rotate(0deg);
  }

  35% {
    transform: rotate(675deg);
  }

  40% {
    transform: rotate(720deg);
  }

  60% {
    transform: rotate(720deg);
  }

  95% {
    transform: rotate(45deg);
  }

  100% {
    transform: rotate(0deg);
  }
}

@keyframes slide {
  0% {
    left: 0;
  }

  10% {
    left: 0;
  }

  35% {
    left: $slidewidth - $boxsize - $boxsize / 2;
  }

  40% {
    left: $slidewidth - $boxsize;
  }

  60% {
    left: $slidewidth - $boxsize;
  }

  95% {
    left: $boxsize / 2;
  }

  100% {
    left: 0;
  }
}
</style>