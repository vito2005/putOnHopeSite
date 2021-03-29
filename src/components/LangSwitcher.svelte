<script>
export let lang

function onClick() {
  lang = (lang === 'rus' && 'eng') || 'rus'
  document.documentElement.setAttribute('lang', lang === 'rus' ? 'en' : 'ru')
}
</script>

<div class="lang-switcher" on:click={onClick}>{lang}</div>

<style lang="scss">
@use 'src/styles.scss' as *;

.lang-switcher {
  display: flex;
  justify-content: center;
  align-items: center;
  background: $black;
  color: $red;
  cursor: pointer;
  position: absolute;
  top: 0;
  z-index: 2;
  left: 18%;
  font-size: 1.1rem;
  font-weight: 800;
  @media (max-width: 800px) {
    top: 0;
    right: 0;
    z-index: 2;
    width: 16%;
    height: 9.1%;
    left: auto;
  }
}
</style>
