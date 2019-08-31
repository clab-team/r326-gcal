import { getEvents } from './r326'

const r326Id: string = PropertiesService.getScriptProperties().getProperty('r326Id')
const calendarId: string = PropertiesService.getScriptProperties().getProperty('calendarId')

if (!r326Id) {
  throw new Error('[r326-gcal] r326Id is not specified. Please set it to ScriptProperties.')
}

if (!calendarId) {
  throw new Error('[r326-gcal] calendarId is not specified. Please set it to ScriptProperties.')
}

export function sync(): void {
  // 1時間前から60日後までを対象
  const from = new Date(Date.now() - 60 * 60 * 1000)
  const to = new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000)

  const srcEvents = getEvents(r326Id, from, to)
  
  const calendar = CalendarApp.getCalendarById(calendarId)
  let calendarEvents = calendar.getEvents(from, to)

  const matchCalEvents: GoogleAppsScript.Calendar.CalendarEvent[][][] = []
  
  for (let i = 0; i < calendarEvents.length; i++) {
    const cal = calendarEvents[i]
    const cTitle = cal.getTitle()
    const cAuthor = cal.getTag('author')
    const cStart = cal.getStartTime()
    const cEnd = cal.getEndTime()

    for (let j = 0; j < srcEvents.length; j++) {
      const src = srcEvents[j]
      const sTitle = src.text
      const sAuthor = src.author
      const sStart = src.start
      const sEnd = src.end

      const isTitleMatched = sTitle == cTitle
      const isAuthorMatched = sAuthor == cAuthor
      const isStartMatched = sStart.getTime() == cStart.getTime()
      const isEndMatched = sEnd.getTime() == cEnd.getTime()
      
      const matchCount = [isTitleMatched, isAuthorMatched, isStartMatched, isEndMatched].filter(x => x).length
      if(matchCount > 0) {
        matchCalEvents[j] = matchCalEvents[j] || []
        matchCalEvents[j][matchCount] = matchCalEvents[j][matchCount] || []
        matchCalEvents[j][matchCount].push(cal)
      }
    }
  }

  console.info(`Checking for ${srcEvents.length} events...`)
  for (let i = 0; i < srcEvents.length; i++) {
    const src = srcEvents[i]
    let matchedEvent: GoogleAppsScript.Calendar.CalendarEvent = null, needsToUpdate = true
    if(matchCalEvents[i]) {
      // 3項目一致までは同じとみなす
      for (let j = 4; j >= 3; j--) {
        if (matchCalEvents[i][j] && matchCalEvents[i][j].length > 0) {
          matchedEvent = matchCalEvents[i][j][0]
          if (j === 4) needsToUpdate = false
          break
        }
      }
    }

    if (matchedEvent) {
      calendarEvents = calendarEvents.filter(c => c !== matchedEvent)
      if(needsToUpdate) {
        console.log('* Update: ' + src.text)
        matchedEvent.setTitle(src.text)
        matchedEvent.setTime(src.start, src.end)
      } else {
        console.log('* No changes: ' + src.text)
      }
    } else {
      console.log('* Create: ' + src.text)
      matchedEvent = calendar.createEvent(src.text, src.start, src.end)
    }
    
    if(needsToUpdate) {
      matchedEvent.setTag('author', src.author)
      matchedEvent.setDescription(
        `${src.text || '（詳細情報なし）'} | 利用者: ${src.author}

  ---
  🛠 このイベントは、りざぶ郎に登録されたデータから自動的に生成・管理されています。
  メンテナンスや不具合のため停止することがあります。最新の情報は以下から確認してください。
  https://www.r326.com/b/main.aspx?id=${r326Id}`
      )
      matchedEvent.setAnyoneCanAddSelf(true)
    }
  }

  console.info(`Deleting ${calendarEvents.length} events...`)
  for (let i = 0; i < calendarEvents.length; i++) {
    calendarEvents[i].deleteEvent()
  }
}
