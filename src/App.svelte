<script>
import Slider from './components/Slider.svelte'
export let pages
let containerWidth
let current = 0
let inVisibleBlocks = []

function hover(index) {
  inVisibleBlocks = []
  inVisibleBlocks.push(index)
  inVisibleBlocks.push(randomInteger(index, index + 5))
  inVisibleBlocks.push(randomInteger(index, index - 5))
  inVisibleBlocks = [...inVisibleBlocks]
}

function randomInteger(min, max) {
  let rand = min + Math.random() * (max + 1 - min)
  return Math.floor(rand)
}
</script>

<main>
  <div class="container" bind:offsetWidth={containerWidth}>
    <div class="logo"><span class="logo_red">ОДЕТЬ</span> НАДЕЖДУ</div>
    {#each [...Array(26)] as emptySquare, index}
      <div
        class="empty-square"
        class:invisible={inVisibleBlocks.includes(index)}
        on:mouseenter={() => hover(index)}
      />
    {/each}
    <div class="text">{pages[current].header}</div>
    <div class="slider-wrapper">
      <Slider pages={pages.length} bind:current />
    </div>
    <div class="social" />
    <div class="video-box">
      <video autoplay loop muted controls="" style="width: {containerWidth}px;">
        <source src="./preview.mp4" type="video/mp4" />
      </video>
    </div>
  </div>
</main>

<style type="text/scss">
@import url('./../styles/fonts/gilroy/stylesheet.css');

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
  font-size: 1.7rem;
  line-height: 1.8rem;
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
  transition: opacity 1.5s;
  &.invisible {
    opacity: 0;
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
  font-size: 2rem;
  line-height: 2rem;
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

.slider-wrapper {
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
