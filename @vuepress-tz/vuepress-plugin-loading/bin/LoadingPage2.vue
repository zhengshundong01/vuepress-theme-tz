<template>
  <div class="loading-page-2">
    <div class="rings">
      <div class="ring ring1">
        <div class="ring ring2">
          <div class="ring ring3">
            <div class="ring ring4"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="choose-theme">
      <div class="theme theme1" @click="chooseTheme('#ffad00')"></div>
      <div class="theme theme2" @click="chooseTheme('#01c5c4')"></div>
      <div class="theme theme3" @click="chooseTheme('#ffa5a5')"></div>
      <div class="theme theme4" @click="chooseTheme('#d789d7')"></div>
      <div class="theme theme5" @click="chooseTheme('#f09ae9')"></div>
      <div class="theme theme6" @click="chooseTheme('#e7305b')"></div>
      <div class="theme theme7" @click="chooseTheme('#303960')"></div>
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    // page2
    chooseTheme (color) {
      const root = document.documentElement
      root.style.setProperty('--golden-glow', color)
    }
  }
}
</script>
<style lang="stylus" scoped>
:root {
  --golden-glow: #ffad00;
}

.loading-page-2 {
  height: 100vh;
  width: 100vw;
  background: #fff;
  background: var(--background-color);

  .rings {
    position: relative;

    .ring {
      box-shadow: -10px -10px 15px rgba(255, 255, 255, 0.3), 10px 10px 15px rgba(70, 70, 70, 0.15), inset -10px -10px 15px rgba(255, 255, 255, 0.3), inset 10px 10px 15px rgba(70, 70, 70, 0.15);
      border: 13px solid #ececec;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .ring1 {
      height: 28rem;
      width: 28rem;
      animation: glow1 2.5s infinite;
    }

    .ring2 {
      height: 20rem;
      width: 20rem;
      animation: glow2 2.5s infinite;
    }

    .ring3 {
      height: 12rem;
      width: 12rem;
      animation: glow3 2.5s infinite;
    }

    .ring4 {
      height: 5rem;
      width: 5rem;
      animation: glow4 2.5s infinite;
    }
  }

  .choose-theme {
    margin-top: 5rem;
    display: flex;
    column-gap: 10px;

    .theme {
      width: 3rem;
      height: 3rem;
      cursor: pointer;
      border: 5px solid #ececec;
      box-shadow: -10px -10px 15px rgba(255, 255, 255, 0.3), 10px 10px 15px rgba(70, 70, 70, 0.15), inset -10px -10px 15px rgba(255, 255, 255, 0.3), inset 10px 10px 15px rgba(70, 70, 70, 0.15);
      border-radius: 50%;
    }

    .theme1 {
      background-color: #ffad00;
    }

    .theme2 {
      background-color: #01c5c4;
    }

    .theme3 {
      background-color: #ffa5a5;
    }

    .theme4 {
      background-color: #d789d7;
    }

    .theme5 {
      background-color: #f09ae9;
    }

    .theme6 {
      background-color: #e7305b;
    }

    .theme7 {
      background-color: #303960;
    }
  }
}

@keyframes glow1 {
  60% {
    background-color: #ececec;
  }

  80% {
    background-color: var(--golden-glow);
  }

  100% {
    background-color: var(--golden-glow);
  }
}

@keyframes glow2 {
  40% {
    background-color: #ececec;
  }

  60% {
    background-color: var(--golden-glow);
  }

  100% {
    background-color: var(--golden-glow);
  }
}

@keyframes glow3 {
  20% {
    background-color: #ececec;
  }

  40% {
    background-color: var(--golden-glow);
  }

  100% {
    background-color: var(--golden-glow);
  }
}

@keyframes glow4 {
  0% {
    background-color: #ececec;
  }

  20% {
    background-color: var(--golden-glow);
  }

  100% {
    background-color: var(--golden-glow);
  }
}
</style>