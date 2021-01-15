<div id="box" />
<div id="box2" />

<style lang="scss">
#box,
#box2 {
  z-index: 4;
  position: absolute;
  top: 90%;
  left: 50%;
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  animation: boxAnimation 2.95s cubic-bezier(0.02, 0.01, 0.31, 1) infinite;
}
#box2 {
  animation: boxAnimation 3.2s cubic-bezier(0.02, 0.01, 0.31, 1) infinite;
  transform: matrix(-1, 0, 0, 1, 0, 0);
}
#box::after,
#box2::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 100%;
  animation: spanAnimation 3s cubic-bezier(0.3, 0.27, 0.07, 1.64) infinite;
  box-shadow: rgba(255, 255, 255, 1) 0 0 20px 2px;
}
@keyframes boxAnimation {
  50% {
    transform: translateY(-30rem);
  }
}
@keyframes spanAnimation {
  50% {
    transform: translateX(-150px);
  }
}
</style>
