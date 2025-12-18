import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlertStore = defineStore('alert', () => {
  const visible = ref(false)
  const message = ref('')
  const type = ref('info') // success, error, warning, info
  let timer = null

  function show(msg, alertType = 'info', duration = 3000) {
    if (timer) {
      clearTimeout(timer)
    }

    message.value = msg
    type.value = alertType
    visible.value = true

    if (duration > 0) {
      timer = setTimeout(() => {
        hide()
      }, duration)
    }
  }

  function hide() {
    visible.value = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function success(msg, duration = 3000) {
    show(msg, 'success', duration)
  }

  function error(msg, duration = 3000) {
    show(msg, 'error', duration)
  }

  function warning(msg, duration = 3000) {
    show(msg, 'warning', duration)
  }

  function info(msg, duration = 3000) {
    show(msg, 'info', duration)
  }

  return {
    visible,
    message,
    type,
    show,
    hide,
    success,
    error,
    warning,
    info
  }
})