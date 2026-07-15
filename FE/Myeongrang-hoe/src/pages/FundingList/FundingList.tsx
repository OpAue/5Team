import BottomNav from '../../components/BottomNav'
import GigCard from '../../components/GigCard'
import PageHeader from '../../components/PageHeader'
import avatars1 from '../../assets/list/avatars-1.svg'
import avatars2 from '../../assets/list/avatars-2.svg'
import avatars3 from '../../assets/list/avatars-3.svg'
import avatars4 from '../../assets/list/avatars-4.svg'
import avatars5 from '../../assets/list/avatars-5.svg'
import avatars6 from '../../assets/list/avatars-6.svg'

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
  {
    id: 5,
    category: '스포츠',
    title: '주말 배드민턴 정모',
    meta: '자연캠퍼스 체육관 · 7/19(일) 10:00',
    progress: 60,
    avatars: avatars5,
    foot: '6/10명 참여',
  },
  {
    id: 6,
    category: '봉사',
    title: '학교 앞 거리 정화 봉사',
    meta: '정문 집합 · 7/20(월) 09:00',
    progress: 20,
    avatars: avatars6,
    foot: '3/15명 참여',
  },
]

export default function FundingList() {
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <PageHeader title="전체 펀딩 목록" />

      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[13px] px-[17px] pt-[17px] pb-[26px]">
          <p className="text-[21px] font-bold text-[var(--heading)]">모든 약속</p>
          {gigs.map((g) => (
            <GigCard key={g.id} gig={g} to="/funding" />
          ))}
        </div>
      </main>

      <BottomNav active="list" />
    </div>
  )
}
