import {
  addCommentApi,
  confirmFundingApi,
  createFundingApi,
  fetchChat,
  fetchComments,
  fetchFunding,
  fetchFundings,
  fetchFundingReviews,
  fetchMe,
  fetchUserProfile,
  fetchUserReviews,
  getAccessToken,
  joinFundingApi,
  leaveFundingApi,
  sendChatApi,
  submitReviewApi,
  toggleWishlistApi,
  updateFundingApi,
  updateLocationApi,
  updateProfileApi,
  type ApiFunding,
  type ApiUser,
} from '../lib/api'
import { getDB, mutate } from './db'
import { CHECKLIST_ITEMS, type FundingRecord, type RiskLevel, type UserRecord } from './schema'

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

/** Mirror a backend user into local store so existing screens keep working. */
export function applyServerUser(
  user: ApiUser | {
    email: string
    name: string
    campus: UserRecord['campus'] | string
    major: string
    age: string
    bio: string
    interests: string[]
    sunlightScore?: number
    noShowCount?: number
    participationCount?: number
    loginable?: boolean
    lastLat?: number | null
    lastLng?: number | null
    notificationsSeenAt?: number
  },
  options?: { password?: string; setCurrent?: boolean },
) {
  const campus: UserRecord['campus'] =
    user.campus === '자연캠퍼스' ? '자연캠퍼스' : '인문캠퍼스'

  mutate((d) => {
    const existing = d.users[user.email]
    d.users[user.email] = {
      email: user.email,
      password: options?.password ?? existing?.password ?? '',
      name: user.name,
      campus,
      major: user.major ?? '',
      age: user.age ?? '',
      bio: user.bio ?? '',
      interests: user.interests ?? [],
      sunlightScore: user.sunlightScore ?? existing?.sunlightScore ?? 50,
      noShowCount: user.noShowCount ?? existing?.noShowCount ?? 0,
      participationCount: user.participationCount ?? existing?.participationCount ?? 0,
      loginable: user.loginable ?? existing?.loginable ?? true,
      notificationsSeenAt: user.notificationsSeenAt ?? existing?.notificationsSeenAt ?? 0,
      lastLat: user.lastLat ?? existing?.lastLat,
      lastLng: user.lastLng ?? existing?.lastLng,
    }
    if (options?.setCurrent !== false) {
      d.currentUserEmail = user.email
    }
  })
}

/** 로그인 직후 / 홈 진입 시 내 정보·찜 동기화 */
export async function syncMeFromServer() {
  if (!getAccessToken()) return false
  try {
    const { user, wishlist } = await fetchMe()
    applyServerUser(user, { setCurrent: true })
    mutate((d) => {
      d.wishlist[user.email] = wishlist
    })
    return true
  } catch {
    return false
  }
}

export async function ensureUserCached(email: string) {
  if (!email || getDB().users[email]) return
  try {
    const user = await fetchUserProfile(email)
    applyServerUser(user, { setCurrent: false })
  } catch {
    // ignore
  }
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
  try {
    localStorage.removeItem('mh_access_token')
  } catch {
    // ignore
  }
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
  if (getAccessToken()) {
    void updateProfileApi(patch).then((user) => applyServerUser(user, { setCurrent: false }))
  }
}

export function updateLastLocation(email: string, lat: number, lng: number) {
  mutate((d) => {
    const user = d.users[email]
    if (!user) return
    user.lastLat = lat
    user.lastLng = lng
  })
  if (getAccessToken()) {
    void updateLocationApi(lat, lng).then((user) => applyServerUser(user, { setCurrent: false }))
  }
}

export function markNotificationsSeen(email: string) {
  const seenAt = Date.now()
  mutate((d) => {
    const user = d.users[email]
    if (!user) return
    user.notificationsSeenAt = seenAt
  })
  if (getAccessToken()) {
    void updateProfileApi({ notificationsSeenAt: seenAt }).then((user) =>
      applyServerUser(user, { setCurrent: false }),
    )
  }
}

// ---------- fundings ----------

function mapApiFunding(f: ApiFunding): FundingRecord {
  const risk: RiskLevel = f.aiRisk === '높음' || f.aiRisk === '중간' || f.aiRisk === '낮음' ? f.aiRisk : '낮음'
  return {
    id: f.id,
    category: f.category,
    title: f.title,
    locationName: f.locationName,
    address: f.address,
    lat: f.lat,
    lng: f.lng,
    meetAt: f.meetAt ?? '',
    meetTimeText: f.meetTimeText ?? '',
    deadlineAt: f.deadlineAt ?? '',
    deadlineText: f.deadlineText ?? '',
    targetCount: f.targetCount,
    fee: f.fee,
    fillerParticipants: f.fillerParticipants,
    participants: f.participants ?? [],
    description: f.description,
    hostEmail: f.hostEmail,
    aiRisk: risk,
    best: f.best,
    createdAt: f.createdAt,
  }
}

function upsertLocalFunding(record: FundingRecord) {
  mutate((d) => {
    const idx = d.fundings.findIndex((x) => x.id === record.id)
    if (idx >= 0) d.fundings[idx] = record
    else d.fundings.unshift(record)
    d.nextFundingId = Math.max(d.nextFundingId, record.id + 1)
  })
}

/** 서버 펀딩 목록을 로컬 스토어에 동기화 (실패 시 로컬 유지) */
export async function syncFundingsFromServer(params?: { lat?: number; lng?: number; radiusKm?: number }) {
  try {
    const list = await fetchFundings(params)
    mutate((d) => {
      d.fundings = list.map(mapApiFunding)
      d.nextFundingId = list.reduce((m, f) => Math.max(m, f.id + 1), 1)
    })
    // 참여자 이름 캐시
    const emails = new Set<string>()
    list.forEach((f) => f.participants?.forEach((e) => emails.add(e)))
    await Promise.all([...emails].map((e) => ensureUserCached(e)))
    return true
  } catch {
    return false
  }
}

export async function syncFundingDetail(fundingId: number) {
  try {
    const api = await fetchFunding(fundingId)
    upsertLocalFunding(mapApiFunding(api))
    await Promise.all([
      syncCommentsFromServer(fundingId),
      syncChatFromServer(fundingId),
      syncReviewsFromServer(fundingId),
      ...api.participants.map((e) => ensureUserCached(e)),
    ])
    return true
  } catch {
    return false
  }
}

export async function syncCommentsFromServer(fundingId: number) {
  try {
    const comments = await fetchComments(fundingId)
    mutate((d) => {
      d.comments = d.comments.filter((c) => c.fundingId !== fundingId)
      for (const c of comments) {
        d.comments.push({
          id: c.id,
          fundingId: c.fundingId,
          authorEmail: c.authorEmail,
          content: c.content,
          parentId: c.parentId ?? undefined,
          createdAt: c.createdAt,
        })
        d.nextCommentId = Math.max(d.nextCommentId, c.id + 1)
      }
    })
    return true
  } catch {
    return false
  }
}

export async function syncChatFromServer(fundingId: number) {
  try {
    const messages = await fetchChat(fundingId)
    mutate((d) => {
      d.chatMessages = d.chatMessages.filter((m) => m.fundingId !== fundingId)
      for (const m of messages) {
        d.chatMessages.push({
          id: m.id,
          fundingId: m.fundingId,
          authorEmail: m.authorEmail,
          content: m.content,
          createdAt: m.createdAt,
        })
        d.nextChatId = Math.max(d.nextChatId, m.id + 1)
      }
    })
    return true
  } catch {
    return false
  }
}

export async function syncReviewsFromServer(fundingId: number) {
  try {
    const reviews = await fetchFundingReviews(fundingId)
    mutate((d) => {
      d.reviews = d.reviews.filter((r) => r.fundingId !== fundingId)
      for (const r of reviews) {
        d.reviews.push({
          id: r.id,
          fundingId: r.fundingId,
          writerEmail: r.writerEmail,
          targetEmail: r.targetEmail,
          noShow: r.noShow,
          checklist: r.checklist ?? [],
          content: r.content ?? '',
          createdAt: r.createdAt,
        })
        d.nextReviewId = Math.max(d.nextReviewId, r.id + 1)
      }
    })
    return true
  } catch {
    return false
  }
}

export async function syncUserReviewsFromServer(email: string) {
  try {
    const reviews = await fetchUserReviews(email)
    mutate((d) => {
      // merge by id
      const others = d.reviews.filter((r) => r.targetEmail !== email)
      const mapped = reviews.map((r) => ({
        id: r.id,
        fundingId: r.fundingId,
        writerEmail: r.writerEmail,
        targetEmail: r.targetEmail,
        noShow: r.noShow,
        checklist: r.checklist ?? [],
        content: r.content ?? '',
        createdAt: r.createdAt,
      }))
      d.reviews = [...others, ...mapped]
      d.nextReviewId = d.reviews.reduce((m, r) => Math.max(m, r.id + 1), d.nextReviewId)
    })
    return true
  } catch {
    return false
  }
}

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

  if (getAccessToken()) {
    void joinFundingApi(fundingId)
      .then((api) => upsertLocalFunding(mapApiFunding(api)))
      .catch(() => {
        // keep optimistic local state
      })
  }
}

export function leaveFunding(fundingId: number, email: string) {
  mutate((d) => {
    const f = d.fundings.find((x) => x.id === fundingId)
    if (!f || f.hostEmail === email) return
    f.participants = f.participants.filter((e) => e !== email)
  })
  if (getAccessToken()) {
    void leaveFundingApi(fundingId)
      .then((api) => upsertLocalFunding(mapApiFunding(api)))
      .catch(() => {})
  }
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

  if (getAccessToken()) {
    void createFundingApi({
      category: input.category,
      title: input.title,
      description: input.description,
      address: input.address,
      locationName: input.locationName,
      lat: input.lat,
      lng: input.lng,
      meetAt: input.meetAt,
      meetTimeText: input.meetTimeText,
      deadlineAt: input.deadlineAt,
      deadlineText: input.deadlineText,
      targetCount: input.targetCount,
      fee: input.fee,
    })
      .then((api) => {
        mutate((d) => {
          d.fundings = d.fundings.filter((f) => f.id !== newId)
        })
        upsertLocalFunding(mapApiFunding(api))
        newId = api.id
      })
      .catch(() => {
        // keep local draft funding
      })
  }

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
  if (getAccessToken()) {
    void updateFundingApi(fundingId, input)
      .then((api) => upsertLocalFunding(mapApiFunding(api)))
      .catch(() => {})
  }
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
  if (getAccessToken()) {
    void confirmFundingApi(fundingId)
      .then((api) => upsertLocalFunding(mapApiFunding(api)))
      .catch(() => {})
  }
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
  if (getAccessToken()) {
    void addCommentApi(fundingId, content, parentId)
      .then(() => syncCommentsFromServer(fundingId))
      .catch(() => {})
  }
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
  if (getAccessToken()) {
    void sendChatApi(fundingId, content)
      .then(() => syncChatFromServer(fundingId))
      .catch(() => {})
  }
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
  if (getAccessToken()) {
    void submitReviewApi(fundingId, { targetEmail, checklist, content, noShow })
      .then(() => Promise.all([syncReviewsFromServer(fundingId), ensureUserCached(targetEmail)]))
      .catch(() => {})
  }
}

export function toggleWishlist(email: string, fundingId: number) {
  mutate((d) => {
    const list = d.wishlist[email] ?? []
    d.wishlist[email] = list.includes(fundingId)
      ? list.filter((id) => id !== fundingId)
      : [...list, fundingId]
  })
  if (getAccessToken()) {
    void toggleWishlistApi(fundingId)
      .then((res) => {
        mutate((d) => {
          const list = d.wishlist[email] ?? []
          d.wishlist[email] = res.wishlisted
            ? list.includes(fundingId)
              ? list
              : [...list, fundingId]
            : list.filter((id) => id !== fundingId)
        })
      })
      .catch(() => {})
  }
}
