<script>
import { createEventDispatcher } from 'svelte'

export let type = 'bottom'
export let disabled = false

const dispatch = createEventDispatcher()

function click() {
  dispatch('click')
}
</script>

<svg
  on:click={click}
  class="arrow arrow_{type}"
  class:disabled
  width="12"
  height="36"
  viewBox="0 0 12 36"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M6 36L11.7735 26L0.226498 26L6 36ZM7 27L7 4.37114e-08L5 -4.37114e-08L5 27L7 27Z"
    fill={disabled ? '#3f3f3f' : 'white'}
  />
</svg>

<style lang="scss">
.arrow {
  cursor: pointer;
  margin-top: 1rem;

  &_top {
    margin-top: 0;
    transform: rotate(180deg);
    margin-bottom: 1rem;
  }
  &.disabled {
    cursor: default;
  }
}
</style>
