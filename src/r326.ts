import { getUrl } from './util'

export interface CalendarEvent {
  start: Date
  end: Date
  text: string
  author: string
}

export function getEventsByYM(
  id: string,
  yyyy: number,
  mm: number
): Array<CalendarEvent> {
  const content = getUrl(
    `https://www.r326.com/b/main.aspx` +
      `?id=${id}&mode=2&all=all&date=${yyyy}/${mm + 1}/1`
  )
  if (content.match(/cvdata=new Array\((".*[^\\]",?)*\);/g)) {
    const events: CalendarEvent[] = []

    const sources = RegExp.$1.split(',').map(t => t.replace(/(^"|"$)/g, ''))

    for (const source of sources) {
      if (!source.match(/^[0-9]+\t.+?\t[0-9]{4}\t[0-9]{4}\t.+/)) {
        console.warn(`Invalid source: "${source}". Skipping`)
        continue
      }

      const [dateStr, text, startStr, endStr, author] = source.split('\t')

      const evt: CalendarEvent = {
        text,
        author,
        start: new Date(
          `${yyyy}/${mm + 1}/${dateStr}` +
            ' ' +
            `${startStr.substr(0, 2)}:${startStr.substr(2, 2)}`
        ),
        end: new Date(
          `${yyyy}/${mm + 1}/${dateStr}` +
            ' ' +
            `${endStr.substr(0, 2)}:${endStr.substr(2, 2)}`
        )
      }

      // 00:00までの予定はインクリメントする
      if (endStr === '0000') {
        evt.end.setTime(evt.end.getTime() + 24 * 60 * 60 * 1000)
      }

      events.push(evt)
    }

    return events
  } else {
    console.error('Cannot fetch target page.', id, yyyy, mm)
    return []
  }
}

export function getEvents(
  id: string,
  from: Date,
  to: Date
): Array<CalendarEvent> {
  if (from > to) [from, to] = [to, from]

  const fromY = from.getFullYear()
  const fromM = from.getMonth()
  const toY = to.getFullYear()
  const toM = to.getMonth()

  const result: Array<CalendarEvent> = []

  let y = fromY
  let m = fromM
  for (; y < toY || m <= toM; ) {
    result.push(...getEventsByYM(id, y, m))
    m++
    if (m >= 13) {
      m = 1
      y++
    }
  }

  return result.filter(event => from <= event.start && event.end <= to)
}
