import { ref } from 'vue'

export const useSliderGestures = ({ next, previous, enabled = () => true }) => {
  const isDragging = ref(false)
  const dragOffsetX = ref(0)
  let startX = 0
  let startY = 0
  let pointerId = null
  let wheelDistance = 0
  let wheelTimer
  let suppressClick = false

  const pointerDown = (event) => {
    if (!enabled() || event.button > 0 || event.target.closest('button, video, input, select, textarea')) return
    isDragging.value = true
    startX = event.clientX
    startY = event.clientY
    dragOffsetX.value = 0
    pointerId = event.pointerId
    event.currentTarget.setPointerCapture?.(pointerId)
  }

  const pointerMove = (event) => {
    if (!isDragging.value || event.pointerId !== pointerId) return
    const offsetX = event.clientX - startX
    const offsetY = event.clientY - startY
    if (Math.abs(offsetY) > Math.abs(offsetX) && Math.abs(offsetY) > 10) {
      pointerCancel()
      return
    }
    dragOffsetX.value = offsetX
    if (Math.abs(offsetX) > 8) suppressClick = true
  }

  const pointerUp = (event) => {
    if (!isDragging.value || event.pointerId !== pointerId) return
    if (dragOffsetX.value <= -48) next()
    else if (dragOffsetX.value >= 48) previous()
    pointerCancel()
  }

  const pointerCancel = () => {
    isDragging.value = false
    dragOffsetX.value = 0
    pointerId = null
  }

  const wheel = (event) => {
    if (!enabled() || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
    event.preventDefault()
    wheelDistance += event.deltaX
    clearTimeout(wheelTimer)
    wheelTimer = setTimeout(() => { wheelDistance = 0 }, 180)
    if (Math.abs(wheelDistance) < 42) return
    wheelDistance > 0 ? next() : previous()
    wheelDistance = 0
  }

  const clickCapture = (event) => {
    if (!suppressClick) return
    event.preventDefault()
    event.stopPropagation()
    suppressClick = false
  }

  return { isDragging, dragOffsetX, pointerDown, pointerMove, pointerUp, pointerCancel, wheel, clickCapture }
}
