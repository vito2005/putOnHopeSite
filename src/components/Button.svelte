<script>
import arrowRight from './../assets/arrow-right.svg'
import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

export let text = ''
export let color = 'white'
export let href = ''
export let arrow

function click(e) {
  if (!href) {
    e.preventDefault()
    dispatch('click')
  }
}
</script>

<a href={href} class={color} on:click={click}>{text}
  {#if arrow}
    <span class="arrow-right">{@html arrowRight}</span>
  {/if}
</a>

<style lang="scss">
@use 'src/styles.scss' as *;

a {
  height: 1rem;
  min-width: 12rem;
  border: 2px solid;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1rem;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  @media (max-width: 800px) {
    min-width: 10.5rem;
    padding: 0.7rem;
  }

  .arrow-right {
    margin-left: 0.7rem;
    position: relative;
    :global(svg) {
      position: absolute;
      top: 50%;
      transform: translate(0%, -50%);
      :global(path) {
        fill: $black;
      }
    }
  }

  &.red {
    border-color: $red;
    color: $red;
    margin-right: 3px;
    @media (max-width: 800px) {
      color: $white;
      background-color: $red;
      font-weight: 600;
      margin-right: 0;
    }
    &:hover {
      color: $white;
      background-color: $red;
    }
  }

  &.white {
    color: $white;
    border-color: $white;
    margin-left: 2rem;
    .arrow-right {
      :global(path) {
        fill: $white;
      }
    }
    @media (max-width: 800px) {
      color: $black;
      background-color: $white;
      font-weight: 600;
      margin-left: 0rem;
      .arrow-right {
        :global(path) {
          fill: $black;
        }
      }
    }

    &:hover {
      color: $black;
      background-color: $white;
      .arrow-right {
        :global(path) {
          fill: $black;
        }
      }
    }
  }
}
</style>
