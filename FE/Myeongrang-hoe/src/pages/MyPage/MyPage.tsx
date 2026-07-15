import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import profileAvatar from '../../assets/mypage/profile-avatar.svg'
import sunlightIcon from '../../assets/mypage/sunlight-icon.svg'
import reviewerAvatar from '../../assets/mypage/reviewer-avatar.svg'

const stats = [
  { value: 12, label: '참여한 펀딩' },
  { value: 9, label: '받은 리뷰' },
  { value: 0, label: '노쇼 횟수' },
]

const reviews = [
  {
    id: 1,
    name: '이자연',
    tag: '자연캠퍼스 · 21살',
    chips: ['친절했어요', '다시 함께하고 싶어요'],
    body: '보드게임 밤에서 처음 뵀는데 정말 친절하게 설명해주셔서 재밌게 놀았어요! 다음에도 또 뵙고 싶어요.',
    date: '2026.07.05 · 보드게임 밤 참여',
  },
  {
    id: 2,
    name: '박인문',
    tag: '인문캠퍼스 · 24살',
    chips: ['시간 약속을 잘 지켰어요', '분위기를 잘 만들어줬어요'],
    body: '시간 약속을 잘 지켜주셔서 좋았습니다. 스터디 모임도 유익했어요.',
    date: '2026.06.28 · 전공 교류 스터디 참여',
  },
  {
    id: 3,
    name: '최자연',
    tag: '자연캠퍼스 · 22살',
    chips: ['친절했어요', '시간 약속을 잘 지켰어요', '다시 함께하고 싶어요'],
    body: '먼저 다가와서 말 걸어주셔서 어색하지 않게 즐길 수 있었어요. 감사합니다!',
    date: '2026.06.20 · 산책 & 커피챗 참여',
  },
]

export default function MyPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <PageHeader title="마이페이지" />

      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-[13px] border-b border-[var(--hairline)] px-[17px] pt-[26px] pb-[17px]">
          <img src={profileAvatar} alt="" className="size-[77px]" />
          <p className="text-[21px] font-bold text-[var(--heading)]">김명지</p>
          <span className="rounded-[12px] bg-[var(--primary-tint)] px-[11px] py-[4px] text-[11px] font-bold text-[var(--primary-deep)]">
            인문캠퍼스 · 23살
          </span>
          <button
            type="button"
            className="rounded-full border border-[var(--border-card)] bg-white px-[14px] py-[6px] text-[12px] font-medium text-[var(--heading)]"
          >
            프로필 수정하기
          </button>

          <div className="flex w-full items-center gap-[15px] p-[4px]">
            <img src={sunlightIcon} alt="" className="size-[60px] shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
              <div className="flex items-center gap-[9px]">
                <p className="text-[15px] font-bold text-[var(--heading)]">햇살지수</p>
                <span className="rounded-[12px] bg-[var(--primary-tint)] px-[9px] py-[2px] text-[12px] font-bold text-[var(--primary-deep)]">
                  나무 단계
                </span>
              </div>
              <div className="h-[9px] w-full overflow-hidden rounded-full bg-[var(--hairline)]">
                <div className="h-full w-[78%] rounded-full bg-[var(--primary-deep)]" />
              </div>
              <p className="text-[13px] text-[var(--label)]">
                78 / 100 · 노쇼 0회 · 약속 시간 준수 100%
              </p>
            </div>
          </div>

          <div className="flex w-full items-center">
            {stats.map((s, i) => (
              <div key={s.label} className="flex flex-1 items-center">
                {i > 0 && <div className="h-[34px] w-[1px] shrink-0 bg-[var(--hairline)]" />}
                <div className="flex flex-1 flex-col items-center gap-[2px]">
                  <p className="text-[19px] font-bold text-[var(--heading)]">{s.value}</p>
                  <p className="text-[13px] text-[var(--label)]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-[17px] pt-[17px]">
          <p className="text-[21px] font-bold text-[var(--heading)]">받은 리뷰</p>
        </div>

        {reviews.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-[9px] border-b border-[var(--hairline)] p-[17px]"
          >
            <div className="flex items-center gap-[11px]">
              <img src={reviewerAvatar} alt="" className="size-[34px]" />
              <div className="flex items-center gap-[6px]">
                <p className="text-[15px] font-bold text-[var(--heading)]">{r.name}</p>
                <span className="rounded-[12px] bg-[var(--blue-tint,#ebf4ff)] px-[9px] py-[2px] text-[12px] font-bold text-[var(--blue-deep,#116ad4)]">
                  {r.tag}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-[6px]">
              {r.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-[12px] bg-[var(--primary-tint)] px-[11px] py-[4px] text-[12px] font-bold text-[var(--primary-deep)]"
                >
                  {chip}
                </span>
              ))}
            </div>
            <p className="text-[15px] text-black">{r.body}</p>
            <p className="text-[12px] text-[var(--border)]">{r.date}</p>
          </div>
        ))}
      </main>

      <BottomNav active="mypage" />
    </div>
  )
}
