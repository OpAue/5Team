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

/** 펀딩 카테고리이자 사용자 관심사 태그 — 두 목록이 어긋나면 "내 관심사" 매칭이 깨지므로 하나로 공유한다 */
export const FUNDING_CATEGORIES = ['맛집', '교류', '산책', '스터디', '스포츠', '봉사', '쇼핑'] as const

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
    'sunny@mju.ac.kr': {
      email: 'sunny@mju.ac.kr',
      password: 'test1234',
      name: '박햇살',
      campus: '인문캠퍼스',
      major: '경영학과',
      age: '24',
      bio: '약속 시간을 잘 지키는 맛집 펀딩 개최자예요.',
      interests: ['맛집', '교류'],
      sunlightScore: 92,
      noShowCount: 0,
      participationCount: 12,
      loginable: false,
      notificationsSeenAt: 0,
    },
    'risk@mju.ac.kr': {
      email: 'risk@mju.ac.kr',
      password: 'test1234',
      name: '최주의',
      campus: '자연캠퍼스',
      major: '전자공학과',
      age: '22',
      bio: '아직 모임 이력이 충분하지 않아요.',
      interests: ['스포츠'],
      sunlightScore: 24,
      noShowCount: 2,
      participationCount: 1,
      loginable: false,
      notificationsSeenAt: 0,
    },
  }

  const now = Date.now()
  const hoursFromNow = (hours: number) => new Date(now + hours * 60 * 60 * 1000).toISOString()

  return {
    version: 6,
    currentUserEmail: null,
    users,
    fundings: [
      {
        id: 1,
        category: '맛집',
        title: '저녁 홍대 카츠집',
        locationName: '홍대 카츠집',
        address: '서울 마포구 홍익로 근처',
        lat: CAMPUS_CENTER.lat,
        lng: CAMPUS_CENTER.lng,
        meetAt: hoursFromNow(5),
        meetTimeText: '5시간 후',
        deadlineAt: hoursFromNow(2),
        deadlineText: '2시간 후',
        targetCount: 2,
        fee: 12000,
        fillerParticipants: 0,
        participants: ['test1@mju.ac.kr'],
        description:
          '저녁에 홍대 카츠집 같이 갈 사람을 찾습니다. 목표 2명 중 현재 1명이 모여 있어서 AI 성사 임박 넛지를 바로 확인할 수 있어요.',
        hostEmail: 'test1@mju.ac.kr',
        aiRisk: '낮음',
        nudgeMessage: '딱 한 명만 더 모이면 오늘 저녁 바로 출발할 수 있어요!',
        best: true,
        createdAt: now - 30 * 60 * 1000,
      },
      {
        id: 2,
        category: '스포츠',
        title: '수원 스포츠몬스터',
        locationName: '수원 스포츠몬스터',
        address: '경기 수원시 영통구 광교중앙로 근처',
        lat: 37.2851,
        lng: 127.0575,
        meetAt: hoursFromNow(28),
        meetTimeText: '내일 오후',
        deadlineAt: hoursFromNow(20),
        deadlineText: '20시간 후',
        targetCount: 4,
        fee: 25000,
        fillerParticipants: 2,
        participants: ['sunny@mju.ac.kr'],
        description:
          '수원 스포츠몬스터에서 같이 놀 사람을 모집합니다. 개최자 박햇살은 햇살지수 92점의 큰 나무 단계라 좋은 후기와 신뢰도를 함께 확인할 수 있어요.',
        hostEmail: 'sunny@mju.ac.kr',
        aiRisk: '낮음',
        best: true,
        createdAt: now - 3 * 60 * 60 * 1000,
      },
      {
        id: 3,
        category: '스포츠',
        title: '자연캠 풋살 인원',
        locationName: '자연캠 운동장',
        address: '경기 용인시 처인구 명지로 116',
        lat: 37.2221,
        lng: 127.1878,
        meetAt: hoursFromNow(8),
        meetTimeText: '8시간 후',
        deadlineAt: hoursFromNow(3),
        deadlineText: '3시간 후',
        targetCount: 5,
        fee: 5000,
        fillerParticipants: 0,
        participants: ['risk@mju.ac.kr'],
        description:
          '자연캠 풋살 인원을 모집합니다. 개최자에게 낮은 햇살지수와 노쇼 이력이 있어 AI 노쇼 리스크 분석에서 위험 신호를 확인할 수 있어요.',
        hostEmail: 'risk@mju.ac.kr',
        aiRisk: '높음',
        createdAt: now - 90 * 60 * 1000,
      },
    ],
    comments: [],
    chatMessages: [],
    reviews: [
      {
        id: 1,
        fundingId: 2,
        writerEmail: 'test2@mju.ac.kr',
        targetEmail: 'sunny@mju.ac.kr',
        noShow: false,
        checklist: ['시간 약속을 잘 지켰어요', '친절했어요', '다시 함께하고 싶어요'],
        content: '처음 만난 사람도 편하게 대화할 수 있게 분위기를 잘 만들어줬어요.',
        createdAt: now - 24 * 60 * 60 * 1000,
      },
      {
        id: 2,
        fundingId: 3,
        writerEmail: 'test1@mju.ac.kr',
        targetEmail: 'risk@mju.ac.kr',
        noShow: true,
        checklist: [],
        content: '',
        createdAt: now - 48 * 60 * 60 * 1000,
      },
    ],
    wishlist: {},
    nextFundingId: 4,
    nextCommentId: 1,
    nextChatId: 1,
    nextReviewId: 3,
  }
}

export function createSeedDB(): DB {
  return seedDB()
}
