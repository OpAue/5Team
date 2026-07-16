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
  kind?: 'wishlist-almost' | 'almost' | 'chat' | 'comment' | 'review'
}

export function computeNotifications(email: string): NotificationItem[] {
  const db = getDB()
  const me = db.users[email]
  if (!me) return []

  const items: NotificationItem[] = []
  const myLocation = { lat: me.lastLat ?? CAMPUS_CENTER.lat, lng: me.lastLng ?? CAMPUS_CENTER.lng }
  const myWishlist = db.wishlist[email] ?? []

  for (const f of db.fundings) {
    const current = currentCountOf(f)
    const almostThere = !isMatched(f) && f.targetCount - current === 1
    const participant = f.participants.includes(email)
    const wished = myWishlist.includes(f.id)

    if (participant) {
      if (almostThere) {
        items.push({
          id: `nudge-mine-${f.id}`,
          icon: nudgeIcon,
          title: wished ? '찜·참여 중인 펀딩이 성사 임박!' : '딱 한 명만 더 모이면 출발해요!',
          body: `"${f.title}"가 목표 인원 1명만 남았어요. (${current}/${f.targetCount})`,
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
      // 참여하지 않은 사용자: 찜 > 관심사 > 주변 순으로 성사 임박 알림
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
          body: `${reason} "${f.title}"가 목표 인원 1명만 남았어요. (${current}/${f.targetCount})`,
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

export function hasUnreadNotifications(email: string): boolean {
  const db = getDB()
  const me = db.users[email]
  if (!me) return false
  return computeNotifications(email).some((n) => n.createdAt > me.notificationsSeenAt)
}
