import { vScrollAnimate } from '~/composables/useScrollAnimation'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('scroll-animate', vScrollAnimate)
})
