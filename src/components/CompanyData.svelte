<script>
import Logo from './../assets/logo.svg'
</script>

<div class="company-data">
  <div class="text_logo">
    <a href="https://lizaalert.org/" class="text_logo">Liza Alert</a>
  </div>
  <a href="https://articulmedia.ru/" class="articul-media">
    {@html Logo}
  </a>
</div>

<style lang="scss">
@use 'src/styles.scss' as *;

.company-data {
  position: absolute;
  bottom: 0;
  display: flex;
  align-items: flex-end;

  @media (max-width: 800px) {
    align-items: flex-start;
    flex-direction: column;

    a.articul-media {
      height: 1.5rem;
    }
  }

  .text_logo {
    color: $white;
    line-height: 26px;
    font-size: 18px;
    font-weight: 600;
    margin-right: 1rem;
    text-decoration: none;
    white-space: nowrap;

    @media (max-width: 800px) {
      margin-bottom: 0.3rem;
      font-size: 12px;
      line-height: 12px;
    }
  }
  :global(svg.articul-media) {
    @media (max-width: 1124px) {
      width: 10rem;
    }

    @media (max-width: 800px) {
      width: 6rem;
    }
  }
}
</style>
