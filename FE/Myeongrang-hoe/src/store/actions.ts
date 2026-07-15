import { getDB, mutate } from './db'
import { CHECKLIST_ITEMS, type FundingRecord, type UserRecord } from './schema'

export { CHECKLIST_ITEMS }

// ---------- selectors ----------

export function currentCountOf(f: FundingRecord): number {
  return f.fillerParticipants + f.participants.length
}

export function isMatched(f: FundingRecord): boolean {
  return currentCountOf(f) >= f.targetCount
}

export function isExpired(f: FundingRecord): boolean {
  const now = Date.now()
  if (f.deadlineAt && new Date(f.deadlineAt).getTime() < now) return true
  if (f.meetAt && new Date(f.meetAt).getTime() < now) return true
  return false
}

export function getUser(email: string | null | undefined): UserRecord | null {
  if (!email) return null
  return getDB().users[email] ?? null
}

export function getCurrentUser(): UserRecord | null {
  return getUser(getDB().currentUserEmail)
}

export function getFunding(id: number | string | undefined): FundingRecord {
  const db = getDB()
  const numId = Number(id)
  return db.fundings.find((f) => f.id === numId) ?? db.fundings[0]
}

export function isParticipant(f: FundingRecord, email: string | null): boolean {
  return !!email && f.participants.includes(email)
}

export function isHost(f: FundingRecord, email: string | null): boolean {
  return !!email && f.hostEmail === email
}

export function fundingsOf(email: string): FundingRecord[] {
  return getDB().fundings.filter((f) => f.participants.includes(email))
}

export function hostedBy(email: string): FundingRecord[] {
  return getDB().fundings.filter((f) => f.hostEmail === email)
}

export function commentsOf(fundingId: number) {
  return getDB()
    .comments.filter((c) => c.fundingId === fundingId)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export function chatMessagesOf(fundingId: number) {
  return getDB()
    .chatMessages.filter((m) => m.fundingId === fundingId)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export function reviewsReceivedBy(email: string) {
  return getDB()
    .reviews.filter((r) => r.targetEmail === email)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function otherParticipants(f: FundingRecord, email: string): UserRecord[] {
  return f.participants
    .filter((e) => e !== email)
    .map((e) => getUser(e))
    .filter((u): u is UserRecord => !!u)
}

export function participantNamesOf(f: FundingRecord): string[] {
  return f.participants.map((e) => getUser(e)?.name ?? '알 수 없음')
}

export function isWishlisted(email: string, fundingId: number): boolean {
  return (getDB().wishlist[email] ?? []).includes(fundingId)
}

export function wishlistOf(email: string): FundingRecord[] {
  const ids = getDB().wishlist[email] ?? []
  return getDB().fundings.filter((f) => ids.includes(f.id))
}

// ---------- auth ----------

export function loginWithPassword(email: string, password: string): boolean {
  const user = getDB().users[email]
  if (!user || !user.loginable || user.password !== password) return false
  mutate((d) => {
    d.currentUserEmail = email
  })
  return true
}

export function loginAsTestAccount(email: string) {
  mutate((d) => {
    d.currentUserEmail = email
  })
}

export function logout() {
  mutate((d) => {
    d.currentUserEmail = null
  })
}

export function isEmailTaken(email: string): boolean {
  return !!getDB().users[email]
}

export function signUp(input: {
  email: string
  password: string
  name: string
  campus: '인문캠퍼스' | '자연캠퍼스'
  major: string
  age: string
  bio: string
  interests: string[]
}) {
  mutate((d) => {
    d.users[input.email] = {
      email: input.email,
      password: input.password,
      name: input.name,
      campus: input.campus,
      major: input.major,
      age: input.age,
      bio: input.bio,
      interests: input.interests,
      sunlightScore: 50,
      noShowCount: 0,
      participationCount: 0,
      loginable: true,
      notificationsSeenAt: 0,
    }
    d.currentUserEmail = input.email
  })
}

export function updateProfile(
  email: string,
  patch: Partial<Pick<UserRecord, 'name' | 'campus' | 'major' | 'age' | 'bio' | 'interests'>>,
) {
  mutate((d) => {
    const user = d.users[email]
    if (!user) return
    Object.assign(user, patch)
  })
}

export function updateLastLocation(email: string, lat: number, lng: number) {
  mutate((d) => {
    const user = d.users[email]
    if (!user) return
    user.lastLat = lat
    user.lastLng = lng
  })
}

export function markNotificationsSeen(email: string) {
  mutate((d) => {
    const user = d.users[email]
    if (!user) return
    user.notificationsSeenAt = Date.now()
  })
}

// ---------- fundings ----------

export function joinFunding(fundingId: number, email: string) {
  mutate((d) => {
    const f = d.fundings.find((x) => x.id === fundingId)
    if (!f || f.participants.includes(email)) return
    f.participants.push(email)
    d.chatMessages.push({
      id: d.nextChatId++,
      fundingId,
      authorEmail: 'system',
      content: `${d.users[email]?.name ?? '누군가'}님이 참여하셨습니다`,
      createdAt: Date.now(),
    })
    const user = d.users[email]
    if (user) user.participationCount += 1
  })
}

export function leaveFunding(fundingId: number, email: string) {
  mutate((d) => {
    const f = d.fundings.find((x) => x.id === fundingId)
    if (!f || f.hostEmail === email) return
    f.participants = f.participants.filter((e) => e !== email)
  })
}

interface FundingInput {
  category: string
  title: string
  description: string
  address: string
  locationName: string
  lat: number
  lng: number
  meetAt: string
  meetTimeText: string
  deadlineAt: string
  deadlineText: string
  targetCount: number
  fee: number
}

export function createFunding(input: FundingInput & { hostEmail: string }): number {
  let newId = 0
  mutate((d) => {
    newId = d.nextFundingId++
    d.fundings.unshift({
      id: newId,
      category: input.category,
      title: input.title,
      locationName: input.locationName,
      address: input.address,
      lat: input.lat,
      lng: input.lng,
      meetAt: input.meetAt,
      meetTimeText: input.meetTimeText,
      deadlineAt: input.deadlineAt,
      deadlineText: input.deadlineText,
      targetCount: input.targetCount,
      fee: input.fee,
      fillerParticipants: 0,
      participants: [input.hostEmail],
      description: input.description,
      hostEmail: input.hostEmail,
      aiRisk: '낮음',
      createdAt: Date.now(),
    })
    d.chatMessages.push({
      id: d.nextChatId++,
      fundingId: newId,
      authorEmail: 'system',
      content: `${d.users[input.hostEmail]?.name ?? '호스트'}님이 채팅방을 개설했습니다`,
      createdAt: Date.now(),
    })
  })
  return newId
}

export function updateFunding(fundingId: number, input: FundingInput) {
  mutate((d) => {
    const f = d.fundings.find((x) => x.id === fundingId)
    if (!f) return
    const minTarget = f.fillerParticipants + f.participants.length
    f.category = input.category
    f.title = input.title
    f.description = input.description
    f.address = input.address
    f.locationName = input.locationName
    f.lat = input.lat
    f.lng = input.lng
    f.meetAt = input.meetAt
    f.meetTimeText = input.meetTimeText
    f.deadlineAt = input.deadlineAt
    f.deadlineText = input.deadlineText
    f.targetCount = Math.max(input.targetCount, minTarget)
    f.fee = input.fee
  })
}

/** 목표 인원이 다 안 찼어도 호스트가 현재 인원으로 모집을 확정한다 (혼자일 때는 불가) */
export function confirmFunding(fundingId: number) {
  mutate((d) => {
    const f = d.fundings.find((x) => x.id === fundingId)
    if (!f) return
    const current = f.fillerParticipants + f.participants.length
    if (current < 2) return
    f.targetCount = current
  })
}

export function addComment(fundingId: number, email: string, content: string, parentId?: number) {
  mutate((d) => {
    d.comments.push({
      id: d.nextCommentId++,
      fundingId,
      authorEmail: email,
      content,
      parentId,
      createdAt: Date.now(),
    })
  })
}

export function sendChatMessage(fundingId: number, email: string, content: string) {
  mutate((d) => {
    d.chatMessages.push({
      id: d.nextChatId++,
      fundingId,
      authorEmail: email,
      content,
      createdAt: Date.now(),
    })
  })
}

export function submitReview(
  fundingId: number,
  writerEmail: string,
  targetEmail: string,
  checklist: string[],
  content: string,
  noShow = false,
) {
  mutate((d) => {
    d.reviews.push({
      id: d.nextReviewId++,
      fundingId,
      writerEmail,
      targetEmail,
      noShow,
      checklist: noShow ? [] : checklist,
      content: noShow ? '' : content,
      createdAt: Date.now(),
    })
    const target = d.users[targetEmail]
    if (!target) return
    if (noShow) {
      target.noShowCount += 1
      target.sunlightScore = Math.max(0, target.sunlightScore - 20)
    } else {
      const positive = checklist.length > 0
      target.sunlightScore = Math.max(0, Math.min(100, target.sunlightScore + (positive ? 4 : 0)))
    }
  })
}

export function toggleWishlist(email: string, fundingId: number) {
  mutate((d) => {
    const list = d.wishlist[email] ?? []
    d.wishlist[email] = list.includes(fundingId)
      ? list.filter((id) => id !== fundingId)
      : [...list, fundingId]
  })
}
