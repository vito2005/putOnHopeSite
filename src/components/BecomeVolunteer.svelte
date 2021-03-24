<script>
import { afterUpdate } from 'svelte'

import Button from './Button.svelte'

export let show
let becomeVolunteer

afterUpdate(async () => {
  document.addEventListener('touchstart', hideBecomeVolunteer)

  return () => document.removeEventListener('touchstart', hideBecomeVolunteer)
})

function hideBecomeVolunteer(event) {
  if (becomeVolunteer && becomeVolunteer.contains(event.target)) {
    return
  }
  show && (show = false)
}

function handleTouchStart(e) {
  this.style.transition = 'none'
}

function handleTouch(e) {
  const y = e.changedTouches[0].clientY
  const total = this.clientHeight
  const position = y - total
  if (position < 0) this.style.top = y - total + 'px'
  else if (position >= 0) this.style.top = 0 + 'px'
}

function handleTouchEnd(e) {
  this.style.transition = 'top 200ms'
  const y = e.changedTouches[0].clientY
  const total = this.clientHeight
  const position = y - total
  this.style.top = ''
  if (position <= -total * 0.5) {
    show && (show = false)
  }
}
</script>

<div
  class="become-volunter-wrapper"
  style="top: {show ? 0 : -200}px"
  bind:this={becomeVolunteer}
  on:touchmove|stopPropagation={handleTouch}
  on:touchstart|stopPropagation={handleTouchStart}
  on:touchend|stopPropagation={handleTouchEnd}
>
  <div class="become-volunteer">
    <div class="become-volunteer__text">
      <div class="become-volunteer__text_header">
        Стань диджитал добровольцем!
      </div>
      И помогай находить пропавших без вести людей
    </div>
    <Button
      color="red"
      text="Стать добровольцем"
      href="https://t.me/odetnadezhdu_bot"
    />
    <div class="become-volunteer__line" />
  </div>
</div>

<style lang="scss">
@use 'src/styles.scss' as *;

.become-volunter-wrapper {
  position: fixed;
  margin-left: -8%;
  width: 100%;
  z-index: 4;
  top: 0;
  height: 26%;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  background: $gray;
  transition: top 200ms;

  .become-volunteer {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: $white;
    padding-top: 1rem;
    &__text {
      text-align: center;
      margin: 1.2rem 0;
      &_header {
        font-weight: 700;
        letter-spacing: 1px;
      }
    }
    &__line {
      margin: 7% 0;
      width: 20%;
      height: 3%;
      border-radius: 2px;
      background: #c4c4c4;
    }
  }
}
</style>
