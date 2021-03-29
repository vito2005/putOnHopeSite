import App from './App.svelte'
import { rus, eng } from './lib/locales'

const app = new App({
  target: document.body,
  props: {
    eng,
    rus,
  },
})

export default app
