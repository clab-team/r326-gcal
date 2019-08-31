import { getUrl } from './util'

export interface CalendarEvent {
  start: Date
  end: Date
  text: string
  author: string
}

export function getStatusId(source: string): string {
  if (source.match(/statusId="([0-9_]+)"/)) {
    return RegExp.$1
  } else {
    null
  }
}

export function getEventsByYM(
  id: string,
  statusId: string,
  yyyy: number,
  mm: number
): Array<CalendarEvent> {
  const content = getUrl(
    `https://www.r326.com/b/main.aspx` +
      `?id=${id}&mode=2&status=${statusId}&date=${yyyy}/${mm + 1}/1`
  )
  if (content.match(/cvdata=new Array\((".*[^\\]",?)*\);/g)) {
    return RegExp.$1
      .split(',')
      .map(t => t.replace(/(^"|"$)/g, ''))
      .map(source => {
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

        return evt
      })
  } else {
    console.error('Cannot fetch target page.', id, statusId, yyyy, mm)
    return []
  }
}

export function getEvents(
  id: string,
  from: Date,
  to: Date
): Array<CalendarEvent> {
  const firstPage = getUrl(`https://www.r326.com/b/main.aspx?id=${id}`)
  const statusId = getStatusId(firstPage)

  if (from > to) [from, to] = [to, from]

  const fromY = from.getFullYear()
  const fromM = from.getMonth()
  const toY = to.getFullYear()
  const toM = to.getMonth()

  const result: Array<CalendarEvent> = []

  let y = fromY
  let m = fromM
  for (; y < toY || m <= toM; ) {
    result.push(...getEventsByYM(id, statusId, y, m))
    m++
    if (m >= 13) {
      m = 1
      y++
    }
  }

  return result.filter(event => from <= event.start && event.end <= to)
}
