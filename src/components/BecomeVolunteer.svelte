<script>
import { tick, afterUpdate } from 'svelte'

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
</script>

<div class="become-volunteer" bind:this={becomeVolunteer}>
  <div class="become-volunteer__text">
    <div class="become-volunteer__text_header">
      Стань диджитал добровольцем!
    </div>
    И помогай находить пропавших без вести людей
  </div>
  <Button color="red" text="Стать добровольцем" />
  <div class="become-volunteer__line" />
</div>

<style lang="scss">
@use 'src/styles.scss' as *;

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
</style>
