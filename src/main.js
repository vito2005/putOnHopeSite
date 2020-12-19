import App from './App.svelte'

const app = new App({
  target: document.body,
  props: {
    pages: [
      { header: 'Стань диджитал добровольцем' },
      { header: 'есть проблема' },
      { header: 'Одежда - важный элемент образа' },
      { header: 'что в итоге ?' },
      { header: 'Мы решили исправить ситуацию' },
      { header: 'Присоединяйся! ' },
    ],
  },
})

export default app
