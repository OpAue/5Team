export type Campus = '인문캠퍼스' | '자연캠퍼스'
export type RiskLevel = '낮음' | '중간' | '높음'

export interface UserRecord {
  email: string
  password: string
  name: string
  campus: Campus
  major: string
  age: string
  bio: string
  interests: string[]
  sunlightScore: number
  noShowCount: number
  participationCount: number
  loginable: boolean
  /** 프로필 사진 data URL */
  avatarImage?: string
  /** 마지막으로 확인된 위치 (홈 화면 접속 시 갱신, 넛지 알림 타겟팅에 사용) */
  lastLat?: number
  lastLng?: number
  /** 이 시각 이후 생성된 알림만 안 읽은 것으로 표시 */
  notificationsSeenAt: number
}

export interface CommentRecord {
  id: number
  fundingId: number
  authorEmail: string
  content: string
  parentId?: number
  createdAt: number
}

export interface ChatMessageRecord {
  id: number
  fundingId: number
  authorEmail: string | 'system'
  content: string
  createdAt: number
}

export interface ReviewRecord {
  id: number
  fundingId: number
  writerEmail: string
  targetEmail: string
  noShow: boolean
  checklist: string[]
  content: string
  createdAt: number
}

export interface FundingRecord {
  id: number
  category: string
  title: string
  locationName: string
  address: string
  lat: number
  lng: number
  /** 실제 만남 일시 (ISO, 미정이면 빈 문자열) */
  meetAt: string
  meetTimeText: string
  /** 실제 모집 마감 일시 (ISO, 미정이면 빈 문자열) */
  deadlineAt: string
  deadlineText: string
  targetCount: number
  /** 참가비 (원), 0이면 무료 */
  fee: number
  /** 익명/배경 참여자 수 (실제 계정으로 추적하지 않는 인원) */
  fillerParticipants: number
  /** 실제 계정 이메일 목록 (호스트 포함) */
  participants: string[]
  description: string
  hostEmail: string
  aiRisk: RiskLevel
  /** data URL 또는 서버 업로드 URL (선택) */
  coverImage?: string

  best?: boolean
  /** 서버 matched 플래그 (호스트 확정 등) */
  matched?: boolean
  /** 호스트 조기 마감/취소 */
  closed?: boolean
  /** 성사 후 일정 확정 */
  scheduleConfirmed?: boolean
  /** 서버(Claude 대체 규칙 기반)가 생성한 성사 임박 넛지 문구 캐시 */
  nudgeMessage?: string
  createdAt: number
}

export interface DB {
  version: number
  currentUserEmail: string | null
  users: Record<string, UserRecord>
  fundings: FundingRecord[]
  comments: CommentRecord[]
  chatMessages: ChatMessageRecord[]
  reviews: ReviewRecord[]
  wishlist: Record<string, number[]>
  nextFundingId: number
  nextCommentId: number
  nextChatId: number
  nextReviewId: number
}

export const CAMPUS_CENTER = { lat: 37.5805, lng: 126.9227 }

/** 성사 임박 넛지를 "주변 사용자"로 판단하는 반경 (km) */
export const NUDGE_RADIUS_KM = 1.2

export const CHECKLIST_ITEMS = [
  '시간 약속을 잘 지켰어요',
  '친절했어요',
  '분위기를 잘 만들어줬어요',
  '다시 함께하고 싶어요',
  '약속 장소를 잘 안내했어요',
]

export const TEST_ACCOUNTS = {
  test1: 'test1@mju.ac.kr',
  test2: 'test2@mju.ac.kr',
}

function seedDB(): DB {
  const users: Record<string, UserRecord> = {
    'test1@mju.ac.kr': {
      email: 'test1@mju.ac.kr',
      password: 'test1234',
      name: '김명지',
      campus: '인문캠퍼스',
      major: '컴퓨터공학과',
      age: '23',
      bio: '',
      interests: [],
      sunlightScore: 50,
      noShowCount: 0,
      participationCount: 0,
      loginable: true,
      notificationsSeenAt: 0,
    },
    'test2@mju.ac.kr': {
      email: 'test2@mju.ac.kr',
      password: 'test1234',
      name: '이자연',
      campus: '자연캠퍼스',
      major: '생명과학과',
      age: '21',
      bio: '',
      interests: [],
      sunlightScore: 50,
      noShowCount: 0,
      participationCount: 0,
      loginable: true,
      notificationsSeenAt: 0,
    },
  }

  return {
    version: 4,
    currentUserEmail: null,
    users,
    fundings: [],
    comments: [],
    chatMessages: [],
    reviews: [],
    wishlist: {},
    nextFundingId: 1,
    nextCommentId: 1,
    nextChatId: 1,
    nextReviewId: 1,
  }
}

export function createSeedDB(): DB {
  return seedDB()
}
