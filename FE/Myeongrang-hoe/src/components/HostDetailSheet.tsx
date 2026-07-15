import BackButton from './BackButton'
import hostAvatar from '../assets/hostdetail/host-avatar.svg'
import sunlightIcon from '../assets/hostdetail/sunlight-icon.svg'
import reviewerAvatar from '../assets/hostdetail/reviewer-avatar.svg'

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
    body: '모임 진행을 정말 편안하게 이끌어주셔서 좋았어요!',
    date: '2026.07.05 · 보드게임 밤 개최',
  },
  {
    id: 2,
    name: '박인문',
    tag: '인문캠퍼스 · 24살',
    chips: ['시간 약속을 잘 지켰어요', '분위기를 잘 만들어줬어요'],
    body: '시간 약속도 잘 지키고 분위기도 잘 이끌어주셨습니다.',
    date: '2026.06.28 · 전공 교류 스터디 개최',
  },
]

export default function HostDetailSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="flex h-[734px] w-full max-w-[402px] flex-col overflow-y-auto rounded-t-[24px] bg-white shadow-[0px_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="flex h-[20px] w-full shrink-0 items-center justify-center">
          <div className="h-[4px] w-[36px] rounded-full bg-[var(--border)]" />
        </div>

        <div className="flex shrink-0 items-center gap-[12px] px-[16px] pt-[8px] pb-[12px]">
          <BackButton onClick={onClose} />
          <p className="text-[18px] font-bold text-[var(--heading)]">개최자 세부내역</p>
        </div>

        <div className="flex shrink-0 items-center gap-[12px] px-[16px] pt-[8px] pb-[16px]">
          <img src={hostAvatar} alt="" className="size-[64px]" />
          <div className="flex flex-col items-start gap-[6px]">
            <p className="text-[18px] font-bold text-[var(--heading)]">이명지</p>
            <span className="rounded-[11px] bg-[var(--primary-tint)] px-[10px] py-[4px] text-[10px] font-bold text-[var(--primary-deep)]">
              인문캠퍼스 · 23살
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-[14px] px-[16px]">
          <img src={sunlightIcon} alt="" className="size-[48px] shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <div className="flex items-center gap-[8px]">
              <p className="text-[14px] font-bold text-[var(--heading)]">햇살지수</p>
              <span className="rounded-[11px] bg-[var(--primary-tint)] px-[8px] py-[2px] text-[11px] font-bold text-[var(--primary-deep)]">
                나무 단계
              </span>
            </div>
            <div className="h-[8px] w-full overflow-hidden rounded-full bg-[var(--hairline)]">
              <div className="h-full w-[78%] rounded-full bg-[var(--primary-deep)]" />
            </div>
            <p className="text-[12px] text-[var(--label)]">
              78 / 100 · 노쇼 0회 · 약속 시간 준수 100%
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center px-[16px] pt-[16px] pb-[8px]">
          {stats.map((s, i) => (
            <div key={s.label} className="flex flex-1 items-center">
              {i > 0 && <div className="h-[32px] w-px shrink-0 bg-[var(--hairline)]" />}
              <div className="flex flex-1 flex-col items-center gap-[2px]">
                <p className="text-[18px] font-bold text-[var(--heading)]">{s.value}</p>
                <p className="text-[12px] text-[var(--label)]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-px w-full shrink-0 bg-[var(--hairline)]" />

        <div className="shrink-0 px-[16px] pt-[16px] pb-[8px]">
          <p className="text-[18px] font-bold text-[var(--heading)]">받은 리뷰</p>
        </div>

        {reviews.map((r) => (
          <div
            key={r.id}
            className="flex shrink-0 flex-col gap-[8px] border-b border-[var(--hairline)] px-[16px] py-[14px]"
          >
            <div className="flex items-center gap-[10px]">
              <img src={reviewerAvatar} alt="" className="size-[28px]" />
              <div className="flex items-center gap-[6px]">
                <p className="text-[13px] font-bold text-[var(--heading)]">{r.name}</p>
                <span className="rounded-[11px] bg-[var(--blue-tint)] px-[8px] py-[2px] text-[10px] font-bold text-[var(--blue-deep)]">
                  {r.tag}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-[6px]">
              {r.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-[11px] bg-[var(--primary-tint)] px-[10px] py-[4px] text-[11px] font-bold text-[var(--primary-deep)]"
                >
                  {chip}
                </span>
              ))}
            </div>
            <p className="text-[13px] text-[var(--ink)]">{r.body}</p>
            <p className="text-[11px] text-[var(--border)]">{r.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
