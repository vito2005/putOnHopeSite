<script>
export let pages = 6
export let current = 0
export let isMobile = false

import Arrow from './Arrow.svelte'

function inc() {
  pages - 1 > current && current++
}
function dec() {
  current && current--
}
</script>

<div class="slider">
  {#if !isMobile}
    <Arrow type="top" on:click={dec} disabled={!current} />
  {/if}

  <div class="pages">
    {#each [...Array(pages)] as page, index}
      <div
        class="page-point"
        class:current={current === index}
        on:click={() => (current = index)}
      />
    {/each}
  </div>
  {#if !isMobile}
    <Arrow type="bottom" on:click={inc} disabled={current >= pages - 1} />
  {/if}
</div>

<style lang="scss">
.slider {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.pages {
  display: flex;
  flex-direction: column;
  @media (max-width: 800px) {
    height: 60%;
    justify-content: space-between;
  }
}
.page-point {
  cursor: pointer;
  margin: 0.3rem 0;
  width: 0.5rem;
  height: 0.5rem;
  background-color: #fff;
  border-radius: 50%;
  &.current {
    background-color: #ee2424;
  }
}
</style>
