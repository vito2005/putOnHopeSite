<script>
import { onMount } from 'svelte'
export let flyPos
export let topFireFly
export let leftFireFly

let fireFly
let fireFlyBox
let fireFly2

$: if (topFireFly || topFireFly === 0) {
  fireFlyBox.style.animationName = 'none'
  fireFly.style.animationName = 'none'

  fireFlyBox.style.top = topFireFly * 10 + 5 + '%'
  fireFly.style.left = leftFireFly * 20 + '%'

  setTimeout(() => {
    fireFlyBox.style.animationName = 'boxAnimation'
    fireFly.style.animationName = 'spanAnimation'
  }, 100)
  topFireFly = null
  leftFireFly = null
}

onMount(() => {
  setInterval(updateFlyPos, 300)
})

function updateFlyPos() {
  flyPos = [
    fireFly && fireFly.getBoundingClientRect(),
    //fireFly2 && fireFly2.getBoundingClientRect(),
  ]
  const { left, top } = fireFly.getBoundingClientRect()
  if (left < 60) {
    fireFly.style.animationName = 'none'

    fireFly.style.left = 0 + '%'
    setTimeout(() => {
      fireFly.style.animationName = 'spanAnimation'
    })
  }
  if (top < 40) {
    fireFlyBox.style.top = 0 + '%'
  }
}

function linear(timeFraction) {
  return timeFraction
}
</script>

<div id="box" bind:this={fireFlyBox}>
  <div bind:this={fireFly} />
</div>

<!-- <div id="box2">
  <div bind:this={fireFly2} />
</div> -->
<style lang="scss">
#box,
#box2 {
  z-index: 4;
  position: absolute;
  top: 0%;
  left: 0%;
  width: 100%;
  height: 40px;
  margin: -20px 0 0 -20px;
  animation: boxAnimation 30s ease-out infinite;
  transition: top;
}
#box2 {
  animation: boxAnimation 30s ease-in infinite;
  transform: matrix(-1, 0, 0, 1, 0, 0);
}
#box div,
#box2 div {
  content: '';
  position: absolute;
  top: 10;
  left: 0;
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 100%;
  animation: spanAnimation 3s ease-out infinite;
  -webkit-animation: spanAnimation 3s ease-out infinite;
  box-shadow: rgba(255, 255, 255, 1) 0 0 20px 2px;
  transition: left 400ms ease 0.5s;
}
</style>
