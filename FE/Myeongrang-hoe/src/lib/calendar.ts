/** Google Calendar 등 외부 캘린더 추가 링크 생성 */

export type CalendarEvent = {
  title: string
  description?: string
  location?: string
  /** ISO 또는 Date */
  start: string | Date
  /** 없으면 start + 2시간 */
  end?: string | Date
}

function toGcalStamp(d: Date): string {
  // YYYYMMDDTHHmmssZ
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

export function buildGoogleCalendarUrl(event: CalendarEvent): string | null {
  const start = typeof event.start === 'string' ? new Date(event.start) : event.start
  if (Number.isNaN(start.getTime())) return null
  const end =
    event.end != null
      ? typeof event.end === 'string'
        ? new Date(event.end)
        : event.end
      : new Date(start.getTime() + 2 * 60 * 60 * 1000)
  if (Number.isNaN(end.getTime())) return null

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toGcalStamp(start)}/${toGcalStamp(end)}`,
  })
  if (event.description) params.set('details', event.description)
  if (event.location) params.set('location', event.location)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** .ics 다운로드 (로컬 캘린더) */
export function downloadIcs(event: CalendarEvent, filename = 'myeongrang.ics') {
  const start = typeof event.start === 'string' ? new Date(event.start) : event.start
  if (Number.isNaN(start.getTime())) return
  const end =
    event.end != null
      ? typeof event.end === 'string'
        ? new Date(event.end)
        : event.end
      : new Date(start.getTime() + 2 * 60 * 60 * 1000)

  const escape = (s: string) => s.replace(/[,;\\]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Myeongrang//KO',
    'BEGIN:VEVENT',
    `DTSTART:${toGcalStamp(start)}`,
    `DTEND:${toGcalStamp(end)}`,
    `SUMMARY:${escape(event.title)}`,
    event.description ? `DESCRIPTION:${escape(event.description)}` : '',
    event.location ? `LOCATION:${escape(event.location)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
