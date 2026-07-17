function normalizeBaseUrl(raw: string | undefined): string {
  const value = (raw ?? '').trim().replace(/\/+$/, '')
  // 빈 문자열도 로컬 기본값으로 처리한다 (??는 빈 문자열에 발동하지 않음)
  if (!value) return 'http://127.0.0.1:8080'
  if (/^https?:\/\//i.test(value)) return value
  // 배포 환경변수에 프로토콜 없이 도메인만 넣은 경우, 상대 경로로 붙지 않게 보정한다
  return `https://${value}`
}

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)

const TOKEN_KEY = 'mh_access_token'

export type ApiUser = {
  id: number
  email: string
  name: string
  campus: '인문캠퍼스' | '자연캠퍼스' | string
  major: string
  age: string
  bio: string
  interests: string[]
  sunlightScore: number
  noShowCount: number
  participationCount: number
  loginable: boolean
  lastLat?: number | null
  lastLng?: number | null
  notificationsSeenAt?: number
  avatarImage?: string
}

export type ApiFunding = {
  id: number
  category: string
  title: string
  locationName: string
  address: string
  lat: number
  lng: number
  meetAt: string
  meetTimeText: string
  deadlineAt: string
  deadlineText: string
  targetCount: number
  fee: number
  fillerParticipants: number
  participants: string[]
  currentCount: number
  description: string
  coverImage?: string
  hostEmail: string
  aiRisk: string
  best: boolean
  matched: boolean
  closed?: boolean
  scheduleConfirmed?: boolean
  createdAt: number
  distanceKm?: number | null
}

export type ApiChatMessage = {
  id: number
  fundingId: number
  authorEmail: string
  content: string
  createdAt: number
}

export type ApiComment = {
  id: number
  fundingId: number
  authorEmail: string
  content: string
  parentId?: number | null
  createdAt: number
}

export type ApiReview = {
  id: number
  fundingId: number
  writerEmail: string
  targetEmail: string
  noShow: boolean
  checklist: string[]
  content: string
  createdAt: number
}

export type FundingInputBody = {
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
  coverImage?: string
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

async function parseJson(response: Response): Promise<Record<string, unknown> | null> {
  try {
    return (await response.json()) as Record<string, unknown>
  } catch {
    return null
  }
}

function errorMessage(payload: Record<string, unknown> | null, fallback: string): string {
  const message = payload?.message
  return typeof message === 'string' && message.trim() ? message : fallback
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

async function request(
  path: string,
  init?: RequestInit & { auth?: boolean },
): Promise<{ response: Response; payload: Record<string, unknown> | null }> {
  const headers =
    init?.auth === false
      ? { 'Content-Type': 'application/json', ...(init.headers ?? {}) }
      : authHeaders(init?.headers)
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  const payload = await parseJson(response)
  return { response, payload }
}

// ---------- auth ----------

export async function sendVerificationCode(email: string): Promise<{
  message: string
  code?: string
  delivered: boolean
}> {
  const { response, payload } = await request('/api/auth/send-verification-code', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email }),
  })
  if (!response.ok) throw new Error(errorMessage(payload, '인증번호 전송에 실패했어요.'))
  return {
    message: errorMessage(payload, '인증번호를 발송했어요.'),
    code: typeof payload?.code === 'string' ? payload.code : undefined,
    delivered: Boolean(payload?.delivered),
  }
}

export async function verifyEmailCode(email: string, code: string): Promise<void> {
  const { response, payload } = await request('/api/auth/verify-code', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, code }),
  })
  if (!response.ok || !payload?.verified) {
    throw new Error(errorMessage(payload, '인증번호가 올바르지 않아요.'))
  }
}

export async function loginWithApi(
  email: string,
  password: string,
): Promise<{ user: ApiUser; accessToken?: string }> {
  const { response, payload } = await request('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok || !payload?.user) {
    throw new Error(errorMessage(payload, '이메일 또는 비밀번호가 올바르지 않아요.'))
  }
  const accessToken = typeof payload.accessToken === 'string' ? payload.accessToken : undefined
  if (accessToken) setAccessToken(accessToken)
  return { user: payload.user as ApiUser, accessToken }
}

export async function signupWithApi(input: {
  email: string
  password: string
  name: string
  campus: string
  major: string
  age: string
  bio: string
  interests: string[]
}): Promise<{ user: ApiUser; accessToken?: string }> {
  const { response, payload } = await request('/api/auth/signup', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(input),
  })
  if (!response.ok || !payload?.user) {
    throw new Error(errorMessage(payload, '회원가입에 실패했어요.'))
  }
  const accessToken = typeof payload.accessToken === 'string' ? payload.accessToken : undefined
  if (accessToken) setAccessToken(accessToken)
  return { user: payload.user as ApiUser, accessToken }
}

// ---------- users ----------

export async function fetchMe(): Promise<{ user: ApiUser; wishlist: number[] }> {
  const { response, payload } = await request('/api/users/me')
  if (!response.ok || !payload?.user) throw new Error(errorMessage(payload, '내 정보를 불러오지 못했어요.'))
  return {
    user: payload.user as ApiUser,
    wishlist: Array.isArray(payload.wishlist) ? (payload.wishlist as number[]) : [],
  }
}

export async function updateProfileApi(body: {
  name?: string
  campus?: string
  major?: string
  age?: string
  bio?: string
  interests?: string[]
  notificationsSeenAt?: number
  avatarImage?: string
}): Promise<ApiUser> {
  const { response, payload } = await request('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  if (!response.ok || !payload?.user) throw new Error(errorMessage(payload, '프로필 저장에 실패했어요.'))
  return payload.user as ApiUser
}

export async function updateLocationApi(lat: number, lng: number): Promise<ApiUser> {
  const { response, payload } = await request('/api/users/me/location', {
    method: 'PATCH',
    body: JSON.stringify({ lat, lng }),
  })
  if (!response.ok || !payload?.user) throw new Error(errorMessage(payload, '위치 저장에 실패했어요.'))
  return payload.user as ApiUser
}

export async function fetchUserProfile(email: string): Promise<ApiUser> {
  const { response, payload } = await request(`/api/users/profile?email=${encodeURIComponent(email)}`)
  if (!response.ok || !payload?.user) throw new Error(errorMessage(payload, '사용자를 찾을 수 없어요.'))
  return payload.user as ApiUser
}

export async function fetchUserReviews(email: string): Promise<ApiReview[]> {
  const { response, payload } = await request(`/api/users/reviews?email=${encodeURIComponent(email)}`)
  if (!response.ok) throw new Error(errorMessage(payload, '후기를 불러오지 못했어요.'))
  return (payload?.reviews as ApiReview[]) ?? []
}

// ---------- fundings ----------

export async function fetchFundings(params?: {
  lat?: number
  lng?: number
  radiusKm?: number
}): Promise<ApiFunding[]> {
  const qs = new URLSearchParams()
  if (params?.lat != null) qs.set('lat', String(params.lat))
  if (params?.lng != null) qs.set('lng', String(params.lng))
  if (params?.radiusKm != null) qs.set('radiusKm', String(params.radiusKm))
  const query = qs.toString()
  const { response, payload } = await request(`/api/fundings${query ? `?${query}` : ''}`)
  if (!response.ok) throw new Error(errorMessage(payload, '펀딩 목록을 불러오지 못했어요.'))
  return (payload?.fundings as ApiFunding[]) ?? []
}

export async function fetchFunding(id: number): Promise<ApiFunding> {
  const { response, payload } = await request(`/api/fundings/${id}`)
  if (!response.ok || !payload?.funding) throw new Error(errorMessage(payload, '펀딩을 찾을 수 없어요.'))
  return payload.funding as ApiFunding
}

export async function createFundingApi(input: FundingInputBody): Promise<ApiFunding> {
  const { response, payload } = await request('/api/fundings', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!response.ok || !payload?.funding) throw new Error(errorMessage(payload, '펀딩 생성에 실패했어요.'))
  return payload.funding as ApiFunding
}

export async function updateFundingApi(id: number, input: FundingInputBody): Promise<ApiFunding> {
  const { response, payload } = await request(`/api/fundings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  if (!response.ok || !payload?.funding) throw new Error(errorMessage(payload, '펀딩 수정에 실패했어요.'))
  return payload.funding as ApiFunding
}

export async function joinFundingApi(fundingId: number): Promise<ApiFunding> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/join`, { method: 'POST' })
  if (!response.ok || !payload?.funding) throw new Error(errorMessage(payload, '참여에 실패했어요.'))
  return payload.funding as ApiFunding
}

export async function leaveFundingApi(fundingId: number): Promise<ApiFunding> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/leave`, { method: 'POST' })
  if (!response.ok || !payload?.funding) throw new Error(errorMessage(payload, '참여 취소에 실패했어요.'))
  return payload.funding as ApiFunding
}

export async function confirmFundingApi(fundingId: number): Promise<ApiFunding> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/confirm`, { method: 'POST' })
  if (!response.ok || !payload?.funding) throw new Error(errorMessage(payload, '모집 확정에 실패했어요.'))
  return payload.funding as ApiFunding
}

export async function closeFundingApi(fundingId: number): Promise<ApiFunding> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/close`, { method: 'POST' })
  if (!response.ok || !payload?.funding) throw new Error(errorMessage(payload, '모집 마감에 실패했어요.'))
  return payload.funding as ApiFunding
}

export async function deleteFundingApi(fundingId: number): Promise<void> {
  const { response, payload } = await request(`/api/fundings/${fundingId}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(errorMessage(payload, '펀딩 삭제에 실패했어요.'))
}

export async function confirmScheduleApi(
  fundingId: number,
  body: {
    meetAt?: string
    meetTimeText?: string
    locationName?: string
    address?: string
    lat?: number
    lng?: number
  },
): Promise<ApiFunding> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/schedule`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!response.ok || !payload?.funding) throw new Error(errorMessage(payload, '일정 확정에 실패했어요.'))
  return payload.funding as ApiFunding
}

/** 이미지 파일 업로드 → 서버 경로 (/uploads/...) 반환. 절대 URL로 변환 */
export async function uploadImageApi(file: File): Promise<string> {
  const token = getAccessToken()
  const form = new FormData()
  form.append('file', file)
  const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  const payload = await parseJson(response)
  if (!response.ok || typeof payload?.url !== 'string') {
    throw new Error(errorMessage(payload, '이미지 업로드에 실패했어요.'))
  }
  const url = payload.url as string
  if (url.startsWith('http')) return url
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

/** 상대 업로드 경로를 절대 URL로 */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

export async function fetchNudge(fundingId: number): Promise<string> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/nudge`)
  if (!response.ok) throw new Error(errorMessage(payload, '넛지 메시지를 불러오지 못했어요.'))
  return typeof payload?.message === 'string' ? payload.message : ''
}

export async function fetchChat(fundingId: number): Promise<ApiChatMessage[]> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/chat`)
  if (!response.ok) throw new Error(errorMessage(payload, '채팅을 불러오지 못했어요.'))
  return (payload?.messages as ApiChatMessage[]) ?? []
}

export async function sendChatApi(fundingId: number, content: string): Promise<ApiChatMessage> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
  if (!response.ok || !payload?.message) throw new Error(errorMessage(payload, '메시지 전송에 실패했어요.'))
  return payload.message as ApiChatMessage
}

export async function fetchComments(fundingId: number): Promise<ApiComment[]> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/comments`)
  if (!response.ok) throw new Error(errorMessage(payload, '댓글을 불러오지 못했어요.'))
  return (payload?.comments as ApiComment[]) ?? []
}

export async function addCommentApi(
  fundingId: number,
  content: string,
  parentId?: number,
): Promise<ApiComment> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, parentId }),
  })
  if (!response.ok || !payload?.comment) throw new Error(errorMessage(payload, '댓글 작성에 실패했어요.'))
  return payload.comment as ApiComment
}

export async function deleteCommentApi(fundingId: number, commentId: number): Promise<void> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/comments/${commentId}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error(errorMessage(payload, '댓글 삭제에 실패했어요.'))
}

export async function fetchFundingReviews(fundingId: number): Promise<ApiReview[]> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/reviews`)
  if (!response.ok) throw new Error(errorMessage(payload, '후기를 불러오지 못했어요.'))
  return (payload?.reviews as ApiReview[]) ?? []
}

export async function submitReviewApi(
  fundingId: number,
  body: { targetEmail: string; checklist: string[]; content: string; noShow?: boolean },
): Promise<ApiReview> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!response.ok || !payload?.review) throw new Error(errorMessage(payload, '후기 저장에 실패했어요.'))
  return payload.review as ApiReview
}

export async function toggleWishlistApi(
  fundingId: number,
): Promise<{ wishlisted: boolean; fundingId: number }> {
  const { response, payload } = await request(`/api/fundings/${fundingId}/wishlist`, { method: 'POST' })
  if (!response.ok) throw new Error(errorMessage(payload, '찜 처리에 실패했어요.'))
  return {
    wishlisted: Boolean(payload?.wishlisted),
    fundingId: Number(payload?.fundingId ?? fundingId),
  }
}
