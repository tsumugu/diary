<template>
  <div id="LoadingDialog">
    <div id="LoadingDialog__container"></div>
  </div>
</template>

<script>
import ProgressBar from 'progressbar.js'

export default {
  name: 'LoadingDialog',
  props: {
    propsMessage: null,
    propsLoadingProgress: null
  },
  data() {
    return {
      message: null,
      bar: null,
      timer: null,
      timerct: 0,
      isDidReset: false
    }
  },
  watch: {
    propsLoadingProgress() {
       if (this.propsLoadingProgress == null) {
        this.loadingOnNull()
      } else {
        if (this.bar != null && !this.isDidReset) {
          this.bar.destroy();
          this.bar = new ProgressBar.Circle(LoadingDialog__container, {
            color: '#aaa',
            // This has to be the same size as the maximum width to
            // prevent clipping
            strokeWidth: 4,
            trailWidth: 1,
            easing: 'easeInOut',
            duration: 1400,
            text: {
              autoStyleContainer: false
            },
            from: { color: '#aaa', width: 1 },
            to: { color: '#333', width: 4 },
            // Set default step function for all animate calls
            step: function(state, circle) {
              circle.path.setAttribute('stroke', state.color);
              circle.path.setAttribute('stroke-width', state.width);
              var value = Math.round(circle.value() * 100);
                if (value === 0) {
                  circle.setText('');
                } else {
                  circle.setText(value);
                }
              }
            });
          this.bar.text.style.fontSize = '2rem';
          clearInterval(this.timer);
          this.isDidReset = true
        }
        this.bar.animate(this.propsLoadingProgress);  // Number from 0.0 to 1.0
        //
      }
    }
  },
  methods: {
    loadingOnNull() {
      if (this.bar != null) {
        this.bar.destroy();
      }
      this.bar = new ProgressBar.Circle(LoadingDialog__container, {
        color: '#aaa',
        strokeWidth: 4,
        trailWidth: 1,
        easing: 'easeInOut',
        duration: 1400,
        text: {
          autoStyleContainer: false
        },
        from: { color: '#aaa', width: 1 },
        to: { color: '#333', width: 4 },
        step: function(state, circle) {
          circle.path.setAttribute('stroke', state.color);
          circle.path.setAttribute('stroke-width', state.width);
        }
      });
      if (this.propsLoadingProgress == null) {
        this.timer = setInterval(()=>{
          var n = 0
          if (this.timerct%2==0) {
            n = 1
          }
          this.bar.animate(n);
          this.timerct += 1
        }, 1500);
      }
    }
  },
  mounted() {
    this.message = this.propsMessage

    this.loadingOnNull()
  }
}
</script>

<style scoped lang="scss">
#LoadingDialog {
  position: relative;
  width: 250px;
  height: 250px;
  &__container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform : translate(-50%,-50%);
    width: 200px;
    height: 200px;
  }
}
</style>
