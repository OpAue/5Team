import { Link } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import fabWrite from '../../assets/myposts/fab-write.svg'

const posts = [
  {
    id: 1,
    status: '모집중',
    statusStyle: 'bg-[var(--primary-tint)] text-[var(--primary-deep)]',
    title: '미당 순대국 벙개',
    meta: '정문 앞 미당순대국 · 오늘 19:00',
    progress: 75,
    foot: '3/4명 참여',
  },
  {
    id: 2,
    status: '모집중',
    statusStyle: 'bg-[var(--primary-tint)] text-[var(--primary-deep)]',
    title: '전공 교류 스터디 모임',
    meta: '인문캠퍼스 도서관 · 7/18(토) 14:00',
    progress: 50,
    foot: '10/20명 참여',
  },
  {
    id: 3,
    status: '펀딩 성공',
    statusStyle: 'bg-[var(--blue-tint)] text-[var(--blue-deep)]',
    title: '인문 x 자연 보드게임 밤',
    meta: '본관 학생라운지 · 7/14(화) 19:00 · 종료',
    progress: 100,
    foot: '20/20명 · 채팅방 개설됨',
  },
]

export default function MyPosts() {
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <PageHeader title="내가 쓴 글" />

      <main className="relative flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[12px] px-[16px] pt-[16px] pb-[24px]">
          <p className="text-[20px] font-bold text-[var(--heading)]">내가 만든 펀딩</p>
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex w-full gap-[12px] rounded-[4px] border border-[var(--border-card)] p-[12px] shadow-[0px_4px_6px_rgba(0,0,0,0.08)]"
            >
              <div
                className="size-[76px] shrink-0 rounded-[4px]"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #2777e7 0%, #5d90d8 71.4%)',
                }}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                <span
                  className={`w-fit rounded-[11px] px-[8px] py-[3px] text-[11px] font-bold ${p.statusStyle}`}
                >
                  {p.status}
                </span>
                <p className="truncate text-[16px] font-bold text-[var(--heading)]">{p.title}</p>
                <p className="truncate text-[13px] text-[var(--label)]">{p.meta}</p>
                <div className="h-[6px] w-full overflow-hidden rounded-full bg-[var(--hairline)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary-deep)]"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <p className="text-[12px] font-bold text-[var(--label)]">{p.foot}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/funding/new"
          aria-label="새 펀딩 작성"
          className="absolute bottom-[16px] right-[20px] flex size-[56px] items-center justify-center"
        >
          <img src={fabWrite} alt="" className="absolute inset-0 size-full" />
          <span className="relative text-[24px] font-bold text-[var(--on-primary)]">+</span>
        </Link>
      </main>

      <BottomNav active="myposts" />
    </div>
  )
}
