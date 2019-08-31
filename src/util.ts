// Wrapper of UrlFetchApp with retry
export function getUrl(url: string): string {
  let counter = 0
  function doTry(): string {
    try {
      return UrlFetchApp.fetch(url).getContentText()
    } catch (e) {
      counter++
      if (counter < 3) {
        console.warn(`Retrying request... : ${url}`)
        return doTry()
      } else throw e
    }
  }
  return doTry()
}
