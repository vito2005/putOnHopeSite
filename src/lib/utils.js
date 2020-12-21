// eslint-disable-next-line import/prefer-default-export
export function throttle(func, ms) {
  let isThrottled = false
  let savedArgs
  let savedThis

  function wrapper() {
    if (isThrottled) {
      // (2)
      savedArgs = arguments
      savedThis = this
      return
    }

    func.apply(this, arguments)

    isThrottled = true

    setTimeout(function () {
      isThrottled = false
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs)
        savedArgs = savedThis = null
      }
    }, ms)
  }

  return wrapper
}
