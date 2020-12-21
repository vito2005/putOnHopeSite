<a href="/" class="social__item vk">
  <svg
    width="21"
    height="13"
    viewBox="0 0 22 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M20.0299 1.74817C20.1707 1.27848 20.0299 0.93335 19.3595 0.93335H17.1429C16.5792 0.93335 16.3194 1.23149 16.1785 1.56025C16.1785 1.56025 15.0512 4.3079 13.4543 6.09267C12.9377 6.60931 12.7028 6.77369 12.421 6.77369C12.2801 6.77369 12.0687 6.60931 12.0687 6.13966V1.74817C12.0687 1.18454 11.9126 0.93335 11.4429 0.93335H7.95952C7.60731 0.93335 7.39548 1.19494 7.39548 1.44286C7.39548 1.97717 8.19389 2.10038 8.27619 3.60339V6.86767C8.27619 7.58335 8.14694 7.7131 7.86513 7.7131C7.11367 7.7131 5.28574 4.95319 4.2016 1.79512C3.98914 1.1813 3.77604 0.93335 3.20952 0.93335H0.992857C0.359524 0.93335 0.232849 1.23149 0.232849 1.56025C0.232849 2.14737 0.98435 5.0594 3.73195 8.91076C5.56368 11.5409 8.14446 12.9667 10.4929 12.9667C11.9019 12.9667 12.0762 12.65 12.0762 12.1046V10.1167C12.0762 9.48335 12.2097 9.35695 12.6559 9.35695C12.9846 9.35695 13.5483 9.52133 14.8634 10.7895C16.3663 12.2924 16.6141 12.9667 17.4595 12.9667H19.6762C20.3095 12.9667 20.6262 12.65 20.4435 12.0251C20.2436 11.4023 19.526 10.4986 18.5739 9.4274C18.0572 8.81682 17.2822 8.1593 17.0474 7.83046C16.7186 7.4078 16.8125 7.21988 17.0474 6.84417C17.0474 6.84417 19.7481 3.03976 20.0299 1.74817Z"
      fill="#2D3031"
    />
  </svg>
</a>
<a href="/" class="social__item fb">
  <svg
    class="fb"
    width="11"
    height="22"
    viewBox="0 0 9 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6.98014 21.1716V10.8346H9.8336L10.2118 7.27239H6.98014L6.98499 5.48948C6.98499 4.56041 7.07326 4.06259 8.40768 4.06259H10.1915V0.5H7.33768C3.90972 0.5 2.70317 2.22804 2.70317 5.13407V7.2728H0.566406V10.835H2.70317V21.1716H6.98014Z"
      fill="#2D3031"
    />
  </svg>
</a>
<a href="/" class="social__item">
  <svg
    class="tg"
    width="21"
    height="18"
    viewBox="0 0 21 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8.10876 15.9793C7.50942 15.9793 7.61126 15.753 7.40455 15.1824L5.64209 9.38191L19.2088 1.3335"
      fill="white"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8.10791 15.9791C8.57041 15.9791 8.77476 15.7676 9.03291 15.5166L11.4996 13.1181L8.42272 11.2627"
      fill="#2D3031"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8.42269 11.2631L15.8782 16.7713C16.729 17.2407 17.343 16.9977 17.5549 15.9815L20.5897 1.68049C20.9004 0.434793 20.1148 -0.130198 19.3009 0.239309L1.48082 7.11067C0.264425 7.59856 0.271517 8.27719 1.25909 8.57957L5.83214 10.0069L16.4192 3.32762C16.919 3.02455 17.3777 3.18749 17.0012 3.52163"
      fill="#2D3031"
    />
  </svg>
</a>

<style lang="scss">
@use 'src/styles.scss' as *;

.social__item {
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 50%;
  background-color: $white;
  margin: 0.3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  @media (max-width: 800px) {
    background-color: $black;
  }

  &:first-child {
    margin-left: 0;
  }

  &:hover {
    background-color: $red;

    svg.tg {
      path {
        &:first-child {
          fill: $red;
        }
      }
    }
  }

  svg {
    width: 1rem;
    @media (max-width: 800px) {
      width: 1.5rem;
      height: 1.5rem;
    }

    path {
      @media (max-width: 800px) {
        fill: $white;
      }
    }

    &.fb {
      height: 0.9rem;
      @media (max-width: 800px) {
        width: 1.2rem;
        height: 1.4rem;
      }
    }
    &.tg {
      height: 0.9rem;
      @media (max-width: 800px) {
        width: 1.5rem;
        height: 1.7rem;
      }

      path:first-child {
        @media (max-width: 800px) {
          fill: $black;
        }
      }
    }
  }
}
</style>
