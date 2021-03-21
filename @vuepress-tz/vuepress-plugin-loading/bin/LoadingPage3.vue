<template>
  <div class="loading-page-3 hunter panel">
    <div class="circle c1"></div>
    <div class="circle c2"></div>
    <div class="circle c3"></div>
    <div class="circle c4"></div>
    <div class="shape_group">
      <div class="shape s1"></div>
      <div class="shape s2"></div>
      <div class="shape s3"></div>
      <div class="shape s4"></div>
      <div class="shape s5"></div>
      <div class="shape s6"></div>
    </div>
    <div class="line_group g1">
      <div class="line l1"></div>
      <div class="line l2"></div>
      <div class="line l3"></div>
      <div class="line l4"></div>
    </div>
    <div class="line_group g2">
      <div class="line l1"></div>
      <div class="line l2"></div>
      <div class="line l3"></div>
      <div class="line l4"></div>
    </div>
    <div class="line_group g3">
      <div class="line l1"></div>
      <div class="line l2"></div>
      <div class="line l3"></div>
      <div class="line l4"></div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      classNames: ['warlock', 'titan', 'hunter', 'default'], // page3
      index: 0 // page3
    }
  },
  methods: {
    // page3
    changeClass () {
      const container = document.querySelector('.loading-page-3')
      if (!container) {
        return
      }
      container.classList.remove(this.classNames[this.index])
      this.index = this.index < this.classNames.length - 1 ? this.index + 1 : 0
      container.classList.add(this.classNames[this.index])
    }
  },
  mounted () {
    this.$nextTick(() => {
      // page3
      setInterval(this.changeClass, 3000)
    })
  }
}
</script>
<style lang="stylus" scoped>
$color-background: #fff, $color-triangle: #363636, .loading-page-3 {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 14rem;
  width: 14rem;
}

.circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid $color-triangle;
  z-index: 1;
}

.shape_group {
  position: absolute;
  display: grid;
  place-items: center;
  height: 8rem;
  width: 8rem;
  overflow: hidden;

  .shape {
    position: absolute;
    border-left: 2.85rem solid transparent;
    border-right: 2.85rem solid transparent;
    border-bottom: 4.9rem solid $color-triangle;
  }
}

.line_group {
  position: absolute;

  .line {
    position: absolute;
    height: 100%;
    width: 1px;
    background: linear-gradient(to bottom, transparent 0%, $color-triangle 20%, $color-triangle 80%, transparent 100%);

    &.l1 {
      left: 0;
    }

    &.l2 {
      left: 33%;
    }

    &.l3 {
      left: 67%;
    }

    &.l4 {
      left: 100%;
    }
  }
}

// ============================
// DEFAULT
// ============================
.default {
  .c1 {
    height: 10rem;
    width: 10rem;
    transition: all 2s ease-in-out;
  }

  .c2 {
    height: 9rem;
    width: 9rem;
    transition: all 2s ease-in-out;
  }

  .c3 {
    height: 9rem;
    width: 9rem;
    transition: all 2s ease-in-out;
  }

  .c4 {
    height: 8rem;
    width: 8rem;
    transition: all 2s ease-in-out;
  }

  .shape_group {
    transition: height 2s ease-in-out;

    .shape {
      transition: transform 2s ease-in-out, border-bottom-color 0.75s ease-in 1.25s;
      border-bottom-color: $color-background;
      transform: rotate(180deg);
    }
  }

  .line_group {
    transition: all 2s ease-in-out;

    .line {
      transition: all 2s ease-in-out;
    }

    &.g1 {
      height: 15rem;
      width: 6rem;
    }

    &.g2 {
      height: 15rem;
      width: 7.75rem;
      transform: rotate(-60deg);
    }

    &.g3 {
      height: 15rem;
      width: 7.75rem;
      transform: rotate(60deg);
    }
  }
}

// ============================
// WARLOCK
// ============================
.warlock {
  .c1 {
    height: 6.25rem;
    width: 6.25rem;
    transition: all 2s ease-in-out;
  }

  .c2 {
    height: 4rem;
    width: 4rem;
    transition: all 2s ease-in-out;
  }

  .c3 {
    height: 12.5rem;
    width: 12.5rem;
    transition: all 1s ease-in-out 1s;
  }

  .c4 {
    height: 11.5rem;
    width: 11.5rem;
    transition: all 1s ease-in-out 1s;
  }

  .shape_group {
    .shape {
      transition: transform 2s ease-in-out, border-bottom-color 0.75s ease-in 1.25s;

      &.s1, &.s4 {
        transform: rotate(0) translate(-1.15rem, 0.5rem);
      }

      &.s2, &.s5 {
        transform: rotate(360deg) translate(0, 0.5rem);
      }

      &.s3, &.s6 {
        transform: rotate(360deg) translate(1.15rem, 0.5rem);
      }
    }
  }

  .line_group {
    transition: all 2s ease-in-out;

    .line {
      transition: all 2s ease-in-out;
      box-shadow: 0 0 0 2px $color-background;
    }

    &.g1 {
      height: 15rem;
      width: 6rem;
      transform: rotate(-90deg);

      .l2, .l3 {
        opacity: 0;
      }
    }

    &.g2 {
      height: 15rem;
      width: 4rem;
      transform: rotate(-150deg);

      .l1 {
        left: 50%;
      }

      .l2 {
        left: 74%;
      }

      .l3 {
        left: 77%;
      }

      .l4 {
        left: 100%;
      }
    }

    &.g3 {
      height: 15rem;
      width: 4rem;
      transform: rotate(150deg);

      .l1 {
        left: 0%;
      }

      .l2 {
        left: 24%;
      }

      .l3 {
        left: 27%;
      }

      .l4 {
        left: 50%;
      }
    }
  }
}

// ============================
// TITAN
// ============================
.titan {
  .c1 {
    height: 10.5rem;
    width: 10.5rem;
    transition: all 2s ease-in-out;
  }

  .c2 {
    height: 10rem;
    width: 10rem;
    transition: all 2s ease-in-out;
  }

  .c3 {
    height: 12rem;
    width: 12rem;
    transition: all 1s ease-in-out 1s;
  }

  .c4 {
    height: 11rem;
    width: 11rem;
    transition: all 1s ease-in-out 1s;
  }

  .shape_group {
    .shape {
      transition: transform 2s ease-in-out;

      &.s1 {
        transform: rotate(-90deg) scale(0.535) translate(-3.1rem, -2.5rem);
      }

      &.s2 {
        transform: rotate(270deg) scale(0.535) translate(3.1rem, -2.5rem);
      }

      &.s3 {
        transform: rotate(270deg) scale(0.485) translate(0, 3rem);
      }

      &.s4 {
        transform: rotate(90deg) scale(0.485) translate(0, 3rem);
      }

      &.s5 {
        transform: rotate(450deg) scale(0.535) translate(-3.1rem, -2.4rem);
      }

      &.s6 {
        transform: rotate(450deg) scale(0.535) translate(3.1rem, -2.4rem);
      }
    }
  }

  .line_group {
    transition: all 2s ease-in-out;

    .line {
      transition: all 2s ease-in-out;
    }

    &.g1 {
      height: 15rem;
      width: 5.25rem;
      transform: rotate(-180deg);

      .l2, .l3 {
        opacity: 0;
      }
    }

    &.g2 {
      height: 15rem;
      width: 5.5rem;
      transform: rotate(-240deg);

      .l1 {
        left: 0%;
      }

      .l2 {
        left: 48%;
      }

      .l3 {
        left: 52%;
      }

      .l4 {
        left: 100%;
      }
    }

    &.g3 {
      height: 15rem;
      width: 5.5rem;
      transform: rotate(240deg);

      .l1 {
        left: 0%;
      }

      .l2 {
        left: 48%;
      }

      .l3 {
        left: 52%;
      }

      .l4 {
        left: 100%;
      }
    }
  }
}

// ============================
// HUNTER
// ============================
.hunter {
  .c1 {
    height: 5.5rem;
    width: 5.5rem;
    transition: all 2s ease-in-out;
  }

  .c2 {
    height: 4rem;
    width: 4rem;
    transition: all 2s ease-in-out;
  }

  .c3 {
    height: 9rem;
    width: 9rem;
    transition: all 2s ease-in-out;
  }

  .c4 {
    height: 8rem;
    width: 8rem;
    transition: all 2s ease-in-out;
  }

  .shape_group {
    transition: height 2s ease-in-out;
    height: 6rem;

    .shape {
      transition: all 2s ease-in-out, border-bottom-color 0.75s ease-in 1.25s;

      &.s1 {
        transform: rotate(0deg) scale(0.83) translate(0, 1.2rem);
      }

      &.s2 {
        transform: rotate(360deg) scale(0.83) translate(0, -3.6rem);
      }

      &.s3 {
        transform: rotate(360deg) scale(0.83) translate(0, -1.2rem);
      }

      &.s4 {
        border-bottom-color: $color-background;
        transform: rotate(0deg) scale(0.4) translate(0, 0);
      }

      &.s5 {
        border-bottom-color: $color-background;
        transform: rotate(360deg) scale(0.4) translate(0, -5rem);
      }

      &.s6 {
        border-bottom-color: $color-background;
        transform: rotate(360deg) scale(0.4) translate(0, 5rem);
      }
    }
  }

  .line_group {
    transition: all 2s ease-in-out;

    .line {
      transition: all 2s ease-in-out;
    }

    &.g1 {
      height: 15rem;
      width: 6rem;
      transform: rotate(-270deg);
    }

    &.g2 {
      height: 15rem;
      width: 5rem;
      transform: rotate(-330deg);

      .l1 {
        left: 0%;
      }

      .l2 {
        left: 20%;
      }

      .l3 {
        left: 40%;
        z-index: -1;
      }

      .l4 {
        left: 60%;
        z-index: -1;
      }
    }

    &.g3 {
      height: 15rem;
      width: 5rem;
      transform: rotate(330deg);

      .l1 {
        left: 40%;
      }

      .l2 {
        left: 60%;
      }

      .l3 {
        left: 80%;
      }

      .l4 {
        left: 100%;
      }
    }
  }
}

@media only screen and (max-width: 600px) {
  html {
    font-size: 16px;
  }
}
</style>