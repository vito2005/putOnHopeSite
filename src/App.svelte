<script>
import { afterUpdate, onMount } from 'svelte'

export let name
let containerWidth
</script>

<main>
  <div class="container" bind:offsetWidth={containerWidth}>
    <div class="logo"><span class="logo_red">ОДЕТЬ</span> НАДЕЖДУ</div>
    {#each [...Array(26)] as emptySquare}
      <div class="empty-square" />
    {/each}
    <div class="text">Стань диджитал добровольцем</div>
    <div class="slider" />
    <div class="social" />
    <div class="video-box">
      <video autoplay loop muted controls="" style="width: {containerWidth}px;">
        <source src="/preview.mp4" type="video/mp4" />
      </video>
    </div>
  </div>
</main>

<style type="text/scss">
@import url('/../styles/fonts/gilroy/stylesheet.css');

main {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #2d3031;
}

.container {
  margin: 7% 8%;
  height: 76%;
  position: relative;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(4, 1fr);
  overflow: hidden;
}

.logo {
  background-color: #2d3031;
  z-index: 2;

  grid-column-start: 1;
  grid-column-end: 3;

  color: #ffffff;
  font-family: Gilroy;
  font-style: normal;
  font-weight: 800;
  font-size: 26px;
  line-height: 30px;
  text-transform: uppercase;
  &_red {
    color: #ee2424;
  }
}
.empty-square {
  background-color: #2d3031;
  z-index: 2;
  border-top: 2px solid #3f3f3f;
  border-left: 2px solid #3f3f3f;
  &:hover {
    background: transparent;
  }
}

.text {
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 3;

  background-color: #2d3031;
  z-index: 2;

  cursor: default;
  white-space: nowrap;
  color: #ffffff;
  font-weight: 800;
  font-size: 36px;
  line-height: 36px;
  overflow: hidden;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(0, -50%);
  text-transform: uppercase;

  &:hover {
    background: transparent;
  }
}

.slider {
  background-color: #2d3031;
  z-index: 2;

  grid-column-start: 8;
  grid-column-end: 9;
  grid-row-start: 2;
  grid-row-end: 4;
}

.social {
  background-color: #2d3031;
  z-index: 2;

  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 4;
  grid-row-end: 4;
}

.video-box {
  position: absolute;
  z-index: 1;
  overflow: hidden;
}

.video-box video {
}

@media (min-width: 640px) {
  main {
    max-width: none;
  }
}
</style>
