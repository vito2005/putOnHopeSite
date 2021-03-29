<script>
import { onMount } from 'svelte'
import { fly } from 'svelte/transition'

import Join from './assets/join.svg'

import Button from './components/Button.svelte'
import Slider from './components/Slider.svelte'
import Socials from './components/Socials/Socials.svelte'
import BecomeVolunteer from './components/BecomeVolunteer.svelte'
import VideoBackground from './components/VideoBackground.svelte'
import FireFlies from './components/FireFlies.svelte'
import CompanyData from './components/CompanyData.svelte'
import LangSwitcher from './components/LangSwitcher.svelte'

export let eng, rus

let lang
let pages
let buttons
let logo
let becomeVolunteer

let containerWidth
let containerHeight
let container
let touchstart = 0
let touchend = 0
let current = 0
let lastAnimation = 0
let inVisibleBlocks = []
let showBecomeVolunterBlock = false
let glitchAnimation = false
let disableGlitch = false
const animationTime = 1000
let disabledBlocks = []
let flyPos
let topFireFly
let leftFireFly
let isMobile
let innerWidth

const userAgent = window.navigator.userAgent

$: {
  setData(lang === 'rus' ? eng : rus)
}

$: pagesLength = pages.length

$: {
  isMobile =
    innerWidth < 800 || userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)
}

$: {
  if (current || current == 0) {
    glitchAnimation = false
  }
  setTimeout(() => (glitchAnimation = true))
  inVisibleBlocks = []
}

$: {
  disabledBlocks = [15, 23, 24, 25]

  if (current > 0 && current < 5) {
    disabledBlocks = disabledBlocks.concat([6, 7])
  }
}

$: {
  if (container && flyPos) {
    let pagesElms = container.children[current].getElementsByClassName(
      'empty-square'
    )
    Array.from(pagesElms).forEach((p, i) => {
      const { left, right, top, bottom } = p.getBoundingClientRect()
      flyPos.forEach((f) => {
        if (f && left < f.x && right > f.x && top < f.y && bottom > f.y) {
          hover(i)
        }
      })
    })
  }
}

onMount(() => {
  window.addEventListener('touchstart', (e) => {
    touchstart =
      typeof e.pageY !== 'undefined' && (e.pageY || e.pageX)
        ? e.pageY
        : e.touches[0].pageY
  })

  window.addEventListener('touchmove', scroll)

  const windowLang =
    window.navigator &&
    (
      window.navigator.language ||
      window.navigator.systemLanguage ||
      window.navigator.userLanguage ||
      ''
    )
      .substr(0, 2)
      .toLowerCase()

  lang = windowLang === 'en' ? 'rus' : 'eng'

  if (/.xn--p1ai/.test(location.host)) {
    lang = 'eng'
  }

  document.documentElement.setAttribute('lang', lang === 'rus' ? 'en' : 'ru')
})

function setData(data) {
  pages = data.pages
  buttons = data.buttons
  logo = data.logo
  becomeVolunteer = data.becomeVolunteer
  document.title = data.title
}

function hover(index) {
  if (inVisibleBlocks.length > 30) {
    inVisibleBlocks = []
    return
  }
  inVisibleBlocks.push(index)

  if (!isMobile) {
    inVisibleBlocks = []
    inVisibleBlocks.push(index)
    inVisibleBlocks.push(randomInteger(index, index + 2))
    inVisibleBlocks.push(randomInteger(index, index - 2))
    inVisibleBlocks.push(index + 8)
    inVisibleBlocks.push(index + 9)
  } else {
    inVisibleBlocks.push(index + 1)
  }

  inVisibleBlocks = [...inVisibleBlocks]
}

function randomInteger(min, max) {
  let rand = min + Math.random() * (max + 1 - min)
  return Math.floor(rand)
}

function scroll(e) {
  let delta

  delta = e.wheelDelta || -e.detail

  if (isMobile) {
    touchend =
      typeof e.pageY !== 'undefined' && (e.pageY || e.pageX)
        ? e.pageY
        : e.touches[0].pageY
    delta = touchend - touchstart
  }

  var deltaOfInterest = delta,
    timeNow = new Date().getTime(),
    quietPeriod = isMobile ? 200 : 500

  // Cancel scroll if currently animating or within quiet period
  if (timeNow - lastAnimation < quietPeriod + animationTime) {
    e.preventDefault()
    return
  }

  if (deltaOfInterest < 0) {
    current < pagesLength - 1 && current++
  } else {
    current > 0 && current--
  }
  lastAnimation = timeNow
}

function emptySquareBorder(i, p) {
  const br = 'border-right: 2px solid #3f3f3f;'
  const bb = 'border-bottom: 2px solid #3f3f3f;'
  const blblack = 'border-left: 2px solid #2d3031;'
  const btblack = 'border-top: 2px solid #2d3031;'

  let borderMap = {
    6:
      p > 0 && p < 5
        ? 'border-top-color: #2d3031'
        : 'border-top-color: #3f3f3f',
    7:
      p > 0 && p < 5
        ? 'border-right-color: #2d3031; border-left-color: #2d3031;'
        : br,
    15: p > 0 && p < 5 ? 'border-top-color: #2d3031' : '',
    25: bb,
    31: 'border-right: 2px solid #3f3f3f; border-bottom: 2px solid #3f3f3f;',
  }

  if (isMobile) {
    borderMap = {
      0: blblack + btblack,
      1: blblack + btblack,
      2: blblack + btblack,
      5: br + (p > 0 && p < 5 ? btblack : ''),
      11: br,
      17: br,
      29: btblack,
      35: btblack,
      41: btblack,
      47: btblack,
      53: br,
      59: br,
      62: bb,
      63: bb,
    }
    return borderMap[i]
  }
  return i > 25 && i < 31 ? borderMap[25] : borderMap[i]
}
function clickJoin(e) {
  showBecomeVolunterBlock = true
}

function glitch(node) {
  setTimeout(() => (disableGlitch = true), 2000)
}

function setFireFliesCoords(i) {
  topFireFly = Math.floor(i / 6)
  leftFireFly = i % 6
}

function resize() {
  isMobile =
    innerWidth < 800 || userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)
}
</script>

<svelte:window on:mousewheel={scroll} on:resize={resize} bind:innerWidth />

<main>
  {#if !isMobile}
    <div
      class="container"
      bind:offsetWidth={containerWidth}
      bind:offsetHeight={containerHeight}
      bind:this={container}
      style="transform: translate3d(0px, -{current * 100}%, 0px); transition: transform 1000ms ease 0s;"
    >
      {#each pages as page, index}
        <section class:active={current === index}>
          {#each [...Array(32)] as emptySquare, i}
            <div
              class="empty-square"
              class:disabled={disabledBlocks.includes(i)}
              class:invisible={inVisibleBlocks.includes(i)}
              on:mouseenter={() => hover(i)}
              style={emptySquareBorder(i, index)}
            />
          {/each}
          <div class="text" style="top: {(current === 0 && 15) || 22}%">
            {#if glitchAnimation}
              <div class="glitch" class:disable={disableGlitch} use:glitch>
                <span aria-hidden="true">{page.title}</span>
                {page.title}
                {#if page.title_add}
                  <div class="text__title_add">
                    {page.title_add}
                    {#if page.title_red}
                      <div class="text__title_red">{page.title_red}</div>
                    {/if}
                  </div>
                {:else if page.title_red}
                  <div class="text__title_red">{page.title_red}</div>
                {/if}
                <span aria-hidden="true">{page.title}</span>
              </div>
            {/if}
            {#if page.subtitle}
              <div class="text__subtitle">{page.subtitle}</div>
            {/if}
          </div>
          {#if page.info}
            <div class="info">
              {#each page.info as infoItem}
                <p>
                  {@html infoItem}
                </p>
              {/each}
            </div>
          {/if}
        </section>
      {/each}
    </div>
    <VideoBackground width={containerWidth + 200} />

    <div class="logo">
      <span class="logo_red">{logo.red}</span>
      {logo.white}
    </div>
    <LangSwitcher bind:lang />

    <div
      class="slider-wrapper"
      style="margin-top: {(current > 0 && current < 5 && '0px') || '2px'};"
    >
      <Slider pages={pagesLength} bind:current />
    </div>
    <div class="company">
      <Socials />
      <CompanyData />
    </div>
    <div
      class="buttons"
      style="
      margin-left: {current > 0 && current < 5 && '3px'};
      top: {current === 0 || current === 5 ? 50 : 0}%;
      left: {current === 0 ? 18.75 : current === 5 ? 62.5 : 75}%;
      align-items: {(current > 0 && current < 5 && 'flex-start') || 'center'};
      justify-content: {current === 0 ? 'flex-start' : current === 5 ? 'center' : 'flex-end'};"
    >
      <Button
        color="red"
        text={buttons.becomeVolunteer}
        href="https://t.me/odetnadezhdu_bot"
      />
      {#if current === 0}
        <Button
          text={buttons.howItWorks}
          arrow={true}
          on:click={() => (current = 1)}
        />
      {/if}
    </div>
  {:else}
    <div
      class="container"
      bind:offsetHeight={containerHeight}
      bind:this={container}
      style="transform: translate3d(0px, -{current * 100}%, 0px); transition: transform 500ms ease 0s;"
    >
      {#each pages as page, index}
        <section class:active={current === index}>
          {#each [...Array(66)] as emptySquare, i}
            <div
              class="empty-square"
              class:disabled={[0, 1, 2, 23, 29, 35, 41, 47, 60, 61, 65, 64, current > 0 && current < 5 ? 5 : 100].includes(i)}
              class:invisible={inVisibleBlocks.includes(i)}
              style={emptySquareBorder(i, index)}
              on:click={() => setFireFliesCoords(i)}
            />
          {/each}
          <div class="content">
            <div class="text">
              {#if glitchAnimation}
                <div class="glitch" class:disable={disableGlitch} use:glitch>
                  <span aria-hidden="true">{page.title}</span>

                  {page.title}
                  {#if page.title_add}
                    <div class="text__title_add">
                      {page.title_add}
                      {#if page.title_red}
                        <div class="text__title_red">{page.title_red}</div>
                      {/if}
                    </div>
                  {:else if page.title_red}
                    <div class="text__title_red">{page.title_red}</div>
                  {/if}
                  <span aria-hidden="true">{page.title}</span>
                </div>
              {/if}
            </div>
            {#if page.subtitle}
              <div class="text__subtitle">{page.subtitle}</div>
            {/if}
            {#if page.info}
              <div class="info">
                {#each page.info as infoItem}
                  <span>
                    {@html infoItem}
                  </span>
                {/each}
              </div>
            {/if}
            <div
              class="buttons"
              style="
            margin-left: {current > 0 && current < 5 && '3px'};
            background: {(current > 0 && current < 5 && '#2d3031') || ''};
            justify-content: {current === 0 ? 'space-between' : current === 5 ? 'center' : 'flex-end'};
            display: {(current > 0 && current < 5 && 'none') || 'flex'}"
            >
              <Button
                color="red"
                text={buttons.becomeVolunteer}
                href="https://t.me/odetnadezhdu_bot"
              />
              {#if current === 0}
                <Button
                  text={buttons.howItWorks}
                  arrow={true}
                  on:click={() => (current = 1)}
                />
              {/if}
            </div>
          </div>
        </section>
      {/each}
    </div>

    <VideoBackground height={containerHeight} />

    <div class="logo">
      <span class="logo_red">{logo.red}</span>
      {logo.white}
    </div>
    <div
      class="slider-wrapper"
      style="margin-top: {(current > 0 && current < 5 && '0px') || '2px'};"
    >
      <Slider pages={pagesLength} bind:current isMobile={isMobile} />
    </div>
    <div class="company">
      <CompanyData />
    </div>
    <div class="socials">
      <Socials />
    </div>
    <FireFlies bind:flyPos bind:topFireFly bind:leftFireFly />
    <LangSwitcher bind:lang />

    {#if current > 0 && current < 5}
      <div class="join" on:mousedown={clickJoin} transition:fly={{ y: -200 }}>
        {@html Join}
      </div>
    {/if}

    <BecomeVolunteer
      bind:show={showBecomeVolunterBlock}
      data={{ becomeVolunteerButton: buttons.becomeVolunteer, header: becomeVolunteer.header, text: becomeVolunteer.text }}
    />
  {/if}
</main>

<style lang="scss">
@use 'src/styles.scss' as *;
@import url('./../styles/fonts/gilroy/stylesheet.css');

main {
  width: 84%;
  height: 75%;
  overflow: hidden;
  background-color: $black;
  font-family: Gilroy;
  margin-top: 7%;
  margin-left: 8%;
  position: relative;

  @media (max-width: 800px) {
    height: 90%;
  }
}

.container {
  width: 100%;
  height: 100%;
  z-index: 2;
  section {
    position: relative;
    display: grid;
    grid-template-columns: repeat(8, 12.5%);
    grid-template-rows: repeat(4, 25%);
    overflow: hidden;
    width: 100%;
    height: 100%;

    box-sizing: border-box;

    .empty-square {
      background-color: $black;
      z-index: 2;
      border-top: 2px solid #3f3f3f;
      border-left: 2px solid #3f3f3f;
      transition: opacity 3s;
      color: $white;
      &.invisible {
        opacity: 0;
      }
      &.disabled {
        opacity: 1;
      }
    }

    @media (max-width: 800px) {
      grid-template-columns: repeat(6, 16.65%);
      grid-template-rows: repeat(11, 9.1%);
    }
  }
}

.logo {
  background-color: $black;
  z-index: 2;
  position: absolute;
  top: 0;
  height: 25%;
  width: 25%;

  color: #fff;
  font-style: normal;
  font-weight: 800;
  font-size: 1.3rem;
  line-height: 1.8rem;
  text-transform: uppercase;
  &_red {
    color: $red;
  }

  @media (max-width: 800px) {
    height: 9%;
    width: 49%;
    font-size: 1rem;
  }
}

.buttons {
  z-index: 2;
  position: absolute;
  width: 25%;
  height: 25%;
  white-space: nowrap;
  display: flex;
  transition: top 1000ms ease 0s, left 1000ms ease 0s;
  @media (max-width: 800px) {
    flex-direction: column;
    width: auto;
    height: 16%;
  }
}

.text {
  grid-column-start: 2;
  grid-column-end: 7;
  grid-row-start: 2;
  grid-row-end: 4;

  z-index: 2;

  cursor: default;
  white-space: nowrap;
  color: $white;
  font-weight: 800;
  font-size: 2rem;
  line-height: 2rem;
  overflow: hidden;

  position: absolute;
  left: 9.75%;
  top: 25%;
  text-transform: uppercase;

  &__title_add {
    display: inline;
  }
  &__title_red {
    display: inline;
    color: $red;
  }

  .glitch {
    position: relative;

    text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
      -0.025em -0.05em 0 rgba(0, 255, 0, 0.75),
      0.025em 0.05em 0 rgba(0, 0, 255, 0.75);

    animation: glitch 500ms 4;

    span {
      position: absolute;
      top: 0;
      left: 0;
      &:first-child {
        animation: glitch 650ms 4;
        clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
        transform: translate(-0.025em, -0.0125em);
        /* color: green; */
        opacity: 0.8;
      }

      &:last-child {
        animation: glitch 375ms 4;
        clip-path: polygon(0 80%, 100% 20%, 100% 100%, 0 100%);
        transform: translate(0.0125em, 0.025em);
        /* color: red; */
        opacity: 0.8;
      }
    }

    &.disable {
      text-shadow: none;
      span {
        display: none;
      }
    }
  }

  &__subtitle {
    margin-top: 0.5rem;
    font-weight: normal;
    font-size: 1.5rem;
    text-transform: none;
    white-space: normal;
    &_red {
      font-weight: normal;
      color: $red;
    }

    @media (max-height: 800px) {
      font-size: 1rem;
      line-height: 1.5rem;
    }
  }

  &:hover {
    background: transparent;
  }

  @media (max-height: 800px) {
    font-size: 1.7rem;
  }
}

@media (max-width: 800px) {
  section.active .text__subtitle {
    left: 12%;
  }

  .join {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    width: 16%;
    height: 9.1%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $black;
    &:active:after {
      position: absolute;
      top: 10%;
      left: 10%;
      width: 3rem;
      height: 3rem;
      background: #868383;
      border-radius: 50%;
      content: '';
      opacity: 0.5;
      transform: scale(0);
      animation: pulse 0.2s ease-in-out;
    }
  }

  .content {
    position: absolute;
    left: 8%;
    display: flex;
    flex-direction: column;
    z-index: 2;
    justify-content: center;
    height: 100%;
    .text {
      position: static;
      white-space: normal;
      font-size: 1.1rem;
      transform: none;
      &__title_add {
        display: block;
      }
      &__title_red {
        color: $red;
        position: absolute;
        display: inline;
        margin-left: 0.4rem;
      }
      &__subtitle {
        position: static;
        background-color: transparent;
        z-index: 2;
        width: 75%;

        color: $white;
        text-transform: none;
        font-weight: normal;
        font-size: 1rem;
        line-height: 1.7rem;
        white-space: normal;

        left: -1000%;
        transition: left 400ms ease 0.5s;
        &_red {
          font-weight: normal;
          color: $red;
        }

        &:hover {
          background: transparent;
        }
      }
    }

    .info {
      position: static;
      transform: none;
      width: 75%;
      line-height: 1.7;
      margin-top: 1rem;
    }
    .buttons {
      position: static;
      align-items: flex-start;
      margin-top: 2rem;
      height: auto;
    }
  }
}

.info {
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-end: 4;
  z-index: 2;
  white-space: nowrap;

  color: #fff;
  font-weight: normal;
  font-size: 1.1rem;
  line-height: 0.9rem;
  overflow: hidden;

  position: absolute;
  top: 50%;
  left: -1000%;
  transform: translate(0%, -50%);
  transition: left 400ms ease 0.5s;

  &_red {
    color: $red;
  }

  @media (max-width: 800px) {
    font-size: 1rem;
    line-height: 1.2rem;
    grid-column-start: 1;
    grid-column-end: 5;
    grid-row-start: 5;
    grid-row-end: 9;
    white-space: normal;
    top: 20%;
    transform: translate(0, -20%);
  }
}
:global(.info_red) {
  color: $red;
}
section.active .info {
  left: 50%;
  @media (max-width: 800px) {
    left: 12%;
  }
}

.slider-wrapper {
  background-color: $black;
  z-index: 2;
  position: absolute;
  right: 0;
  top: 25%;
  width: 12.5%;
  height: 49%;
  margin-top: 2px;
  margin-right: -2px;

  @media (max-width: 800px) {
    top: 28.3%;
    width: 18%;
    height: 44.2%;
    margin-right: -8px;
  }
}

.company {
  background-color: $black;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: left;
  position: absolute;
  top: 75%;
  height: 25%;
  width: 25%;
  margin-top: 2px;
  margin-right: 2px;
  @media (max-width: 800px) {
    top: 90.9%;
    height: 9.1%;
    width: 32.6%;
  }
}

.socials {
  @media (max-width: 800px) {
    background-color: $black;
    z-index: 2;
    display: flex;
    align-items: flex-end;
    justify-content: left;
    position: absolute;
    top: 91.4%;
    left: 69.4%;
    height: 9.1%;
    width: 32.6%;
  }
}
</style>
