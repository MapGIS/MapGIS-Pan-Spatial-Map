export const setDocumentTitle = function (title) {
  document.title = title
  const ua = navigator.userAgent
  // eslint-disable-next-line
  const regex = /\bMicroMessenger\/([\d\.]+)/
  if (regex.test(ua) && /ip(hone|od|ad)/i.test(ua)) {
    const i = document.createElement('iframe')
    i.src = '/favicon.ico'
    i.style.display = 'none'
    i.onload = function () {
      setTimeout(function () {
        i.remove()
      }, 9)
    }
    document.body.appendChild(i)
  }
}

export const setFavicon = function (icon) {
  let favicon = document.querySelector('link[rel="icon"]')
  // console.log('app', favicon)
  if (favicon !== null) {
    favicon.href = icon
  } else {
    favicon = document.createElement('link')
    favicon.rel = 'icon'
    favicon.href = icon
    document.head.appendChild(favicon)
  }
}
