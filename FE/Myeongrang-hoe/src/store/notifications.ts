import nudgeIcon from '../assets/home/nudge-icon.svg'
import aiIcon from '../assets/fundingtab/ai-icon.svg'
import chatNoteIcon from '../assets/fundingtab/chat-note-icon.svg'
import { getDB } from './db'
import { CAMPUS_CENTER, NUDGE_RADIUS_KM } from './schema'
import { distanceKm } from '../lib/geo'
import { commentsOf, currentCountOf, getUser, isMatched, reviewsReceivedBy } from './actions'

export interface NotificationItem {
  id: string
  icon: string
  title: string
  body: string
  createdAt: number
  to: string
  /** 정렬 가중치 (높을수록 상단). 찜 성사임박 등이 우선 */
  priority?: number
  /** 알림 종류 (토스트 구분용) */
  kind?:
    | 'wishlist-almost'
    | 'almost'
    | 'chat'
    | 'comment'
    | 'review'
    | 'meet-today'
    | 'review-remind'
    | 'schedule'
}

function startOfDay(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function computeNotifications(email: string): NotificationItem[] {
  const db = getDB()
  const me = db.users[email]
  if (!me) return []

  const items: NotificationItem[] = []
  const myLocation = { lat: me.lastLat ?? CAMPUS_CENTER.lat, lng: me.lastLng ?? CAMPUS_CENTER.lng }
  const myWishlist = db.wishlist[email] ?? []
  const now = Date.now()
  const today0 = startOfDay(now)

  for (const f of db.fundings) {
    const current = currentCountOf(f)
    const almostThere = !isMatched(f) && !f.closed && f.targetCount - current === 1
    const participant = f.participants.includes(email)
    const wished = myWishlist.includes(f.id)
    const meetMs = f.meetAt ? new Date(f.meetAt).getTime() : NaN

    if (participant) {
      if (almostThere) {
        items.push({
          id: `nudge-mine-${f.id}`,
          icon: nudgeIcon,
          title: wished ? '찜·참여 중인 펀딩이 성사 임박!' : '딱 한 명만 더 모이면 출발해요!',
          body: f.nudgeMessage || `"${f.title}"가 목표 인원 1명만 남았어요. (${current}/${f.targetCount})`,
          createdAt: f.createdAt,
          to: `/funding/${f.id}`,
          priority: wished ? 100 : 80,
          kind: wished ? 'wishlist-almost' : 'almost',
        })
      }
      if (isMatched(f)) {
        items.push({
          id: `chat-${f.id}`,
          icon: chatNoteIcon,
          title: '채팅방이 개설됐어요',
          body: `"${f.title}" 모집이 완료되어 채팅방이 열렸어요.`,
          createdAt: f.createdAt,
          to: `/chat/${f.id}`,
          priority: 40,
          kind: 'chat',
        })

        if (f.scheduleConfirmed) {
          items.push({
            id: `schedule-${f.id}`,
            icon: chatNoteIcon,
            title: '만남 일정이 확정됐어요',
            body: `"${f.title}" · ${f.meetTimeText || '시간 확인'} · ${f.locationName || '장소 확인'}`,
            createdAt: f.createdAt + 1,
            to: `/funding/${f.id}`,
            priority: 75,
            kind: 'schedule',
          })
        }

        // 만남 당일 리마인드
        if (!Number.isNaN(meetMs) && startOfDay(meetMs) === today0 && meetMs >= now - 2 * 60 * 60 * 1000) {
          items.push({
            id: `meet-today-${f.id}`,
            icon: nudgeIcon,
            title: '오늘 만남이 있어요!',
            body: `"${f.title}" · ${f.meetTimeText || ''} · ${f.locationName || ''}`.trim(),
            createdAt: now,
            to: `/funding/${f.id}`,
            priority: 95,
            kind: 'meet-today',
          })
        }

        // 만남 이후 후기 리마인드 (아직 내가 쓴 후기 없음)
        if (!Number.isNaN(meetMs) && meetMs < now) {
          const wrote = db.reviews.some((r) => r.fundingId === f.id && r.writerEmail === email)
          if (!wrote) {
            items.push({
              id: `review-remind-${f.id}`,
              icon: aiIcon,
              title: '후기를 남겨 햇살지수를 쌓아보세요',
              body: `"${f.title}" 모임은 어떠셨나요? 참여자에게 후기를 남겨주세요.`,
              createdAt: meetMs + 1,
              to: `/review/new/${f.id}`,
              priority: 85,
              kind: 'review-remind',
            })
          }
        }
      }
      if (f.hostEmail === email) {
        for (const c of commentsOf(f.id).filter((c) => c.authorEmail !== email).slice(-3)) {
          const author = getUser(c.authorEmail)
          items.push({
            id: `comment-${c.id}`,
            icon: chatNoteIcon,
            title: `${author?.name ?? '누군가'}님이 댓글을 남겼어요`,
            body: `"${f.title}"에 새 댓글: ${c.content}`,
            createdAt: c.createdAt,
            to: `/funding/${f.id}`,
            priority: 30,
            kind: 'comment',
          })
        }
      }
    } else if (almostThere) {
      const nearby = distanceKm(myLocation, { lat: f.lat, lng: f.lng }) <= NUDGE_RADIUS_KM
      const interested = me.interests.includes(f.category)
      if (wished || nearby || interested) {
        const reason = wished
          ? '찜한 펀딩'
          : interested
            ? `관심 태그 "${f.category}"`
            : '주변 펀딩'
        items.push({
          id: `nudge-broadcast-${f.id}`,
          icon: nudgeIcon,
          title: wished ? '찜한 펀딩이 성사 임박!' : '딱 한 명만 더 모이면 출발해요!',
          body: f.nudgeMessage
            ? `${reason} · ${f.nudgeMessage}`
            : `${reason} "${f.title}"가 목표 인원 1명만 남았어요. (${current}/${f.targetCount})`,
          createdAt: f.createdAt,
          to: `/funding/${f.id}`,
          priority: wished ? 100 : interested ? 70 : 50,
          kind: wished ? 'wishlist-almost' : 'almost',
        })
      }
    }
  }

  for (const r of reviewsReceivedBy(email)) {
    const writer = getUser(r.writerEmail)
    items.push({
      id: `review-${r.id}`,
      icon: aiIcon,
      title: '새로운 후기를 받았어요',
      body: `${writer?.name ?? '누군가'}님이 후기를 남겼어요.`,
      createdAt: r.createdAt,
      to: '/mypage',
      priority: 20,
      kind: 'review',
    })
  }

  return items.sort((a, b) => {
    const pa = a.priority ?? 0
    const pb = b.priority ?? 0
    if (pb !== pa) return pb - pa
    return b.createdAt - a.createdAt
  })
}

/** 찜 펀딩 중 성사 임박(1명 남음) 목록 — 홈 토스트용 */
export function wishlistAlmostFullItems(email: string): NotificationItem[] {
  return computeNotifications(email).filter((n) => n.kind === 'wishlist-almost')
}

/** 브라우저 푸시 대상 알림 */
export function pushableNotifications(email: string): NotificationItem[] {
  return computeNotifications(email).filter(
    (n) =>
      n.kind === 'wishlist-almost' ||
      n.kind === 'meet-today' ||
      n.kind === 'review-remind' ||
      n.kind === 'schedule',
  )
}

export function hasUnreadNotifications(email: string): boolean {
  const db = getDB()
  const me = db.users[email]
  if (!me) return false
  return computeNotifications(email).some((n) => n.createdAt > me.notificationsSeenAt)
}
