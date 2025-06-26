import { ref, computed, onMounted, onUnmounted, ComputedRef } from 'vue'


interface Breakpoints {
  sm: boolean
  md: boolean
  lg: boolean
  xl: boolean
  smDown: boolean
  mdDown: boolean
  lgDown: boolean
  smUp: boolean
  mdUp: boolean
  lgUp: boolean
}

export function useBreakpoints() {
  const width = ref(window.innerWidth)

  const onResize = () => {
    width.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })

  const is = computed<Breakpoints>(() => ({
    sm: width.value < 640,
    md: width.value >= 640 && width.value < 768,
    lg: width.value >= 768 && width.value < 1024,
    xl: width.value >= 1024,
    smDown: width.value < 640,
    mdDown: width.value < 768,
    lgDown: width.value < 1024,
    smUp: width.value >= 640,
    mdUp: width.value >= 768,
    lgUp: width.value >= 1024,
  }))

  return { width, is: is as ComputedRef<Breakpoints> }
} 

export type { Breakpoints }