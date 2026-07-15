import BottomNav from '../../components/BottomNav'
import GigCard from '../../components/GigCard'
import PageHeader from '../../components/PageHeader'
import pin from '../../assets/home/pin.svg'
import pinDot from '../../assets/home/pin-dot.svg'
import locateBtn from '../../assets/home/locate-btn.svg'
import nudgeIcon from '../../assets/home/nudge-icon.svg'
import avatars1 from '../../assets/home/avatars-1.svg'
import avatars2 from '../../assets/home/avatars-2.svg'
import avatars3 from '../../assets/home/avatars-3.svg'
import avatars4 from '../../assets/home/avatars-4.svg'

const pins = [
  { left: 150, top: 96 },
  { left: 247, top: 182 },
  { left: 75, top: 225 },
]

const gigs = [
  {
    id: 1,
    category: '맛집',
    title: '미당 순대국 벙개',
    meta: '정문 앞 미당순대국 · 오늘 19:00',
    progress: 75,
    avatars: avatars1,
    foot: '3/4명 · 목표 달성 임박',
    best: true,
  },
  {
    id: 2,
    category: '교류',
    title: '인문 x 자연 보드게임 밤',
    meta: '본관 학생라운지 · 7/14(화) 19:00',
    progress: 70,
    avatars: avatars2,
    foot: '14/20명 참여',
  },
  {
    id: 3,
    category: '산책',
    title: '자연캠 산책 & 커피챗',
    meta: '자연캠퍼스 정문 · 7/16(목) 16:00',
    progress: 35,
    avatars: avatars3,
    foot: '7/20명 참여',
  },
  {
    id: 4,
    category: '스터디',
    title: '전공 교류 스터디 모임',
    meta: '인문캠퍼스 도서관 · 7/18(토) 14:00',
    progress: 50,
    avatars: avatars4,
    foot: '10/20명 참여',
  },
]

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <PageHeader title="명랑회" />

      <main className="flex-1 overflow-y-auto">
        <div className="relative h-[343px] overflow-hidden bg-[var(--primary-tint)]">
          {pins.map((p, i) => (
            <div key={i} className="absolute" style={{ left: p.left, top: p.top }}>
              <img src={pin} alt="" className="size-[26px]" />
              <img
                src={pinDot}
                alt=""
                className="absolute size-[10px]"
                style={{ left: 8, top: 8 }}
              />
            </div>
          ))}
          <button
            type="button"
            aria-label="내 위치로 이동"
            className="absolute right-[18px] bottom-[16px]"
          >
            <img src={locateBtn} alt="" className="size-[47px]" />
          </button>
        </div>

        <div className="flex h-[21px] items-center justify-center bg-white">
          <div className="h-[4px] w-[39px] rounded-full bg-[var(--border)]" />
        </div>

        <div className="flex flex-col gap-[13px] px-[17px] pt-[13px] pb-[17px]">
          <p className="text-[21px] font-bold text-[var(--heading)]">내 주변 펀딩</p>

          <div className="flex items-center gap-[11px] rounded-[4px] border border-[var(--primary-deep)] bg-[var(--primary-tint)] px-[15px] py-[13px]">
            <img src={nudgeIcon} alt="" className="size-[21px] shrink-0" />
            <p className="flex-1 text-[14px] font-bold text-[var(--heading)]">
              딱 한 명만 더 모이면 "미당 순대국 벙개"가 오늘 저녁 바로 출발해요!
            </p>
          </div>

          {gigs.map((g) => (
            <GigCard key={g.id} gig={g} to="/funding" />
          ))}
        </div>
      </main>

      <BottomNav active="home" />
    </div>
  )
}
