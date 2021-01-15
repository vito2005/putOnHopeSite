<script>
export let height
export let width
</script>

<div class="video-box">
  <video
    autoplay
    loop
    muted
    controls=""
    style="height: {height}px; width: {width}px"
  >
    <source src="./previewcity.mp4" type="video/mp4" />
  </video>
</div>

<style lang="scss">
.video-box {
  position: absolute;
  z-index: 1;
  overflow: hidden;
  top: 0;
  &::before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: rgba(54, 54, 47, 0.637);
  }
}
</style>
