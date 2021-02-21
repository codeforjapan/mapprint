window.dataLayer = window.dataLayer || []
function gtag () { dataLayer.push(arguments) }
gtag('js', new Date())
gtag('config', 'UA-45275834-9')
window.addEventListener('afterprint', function () {
  gtag('event', 'print')
})
