import { Link, useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import fabWrite from '../../assets/myposts/fab-write.svg'
import { useDB } from '../../store/db'
import { currentCountOf, getCurrentUser, hostedBy, isMatched } from '../../store/actions'

export default function MyPosts() {
  useDB()
  const navigate = useNavigate()
  const me = getCurrentUser()
  const posts = me ? hostedBy(me.email) : []

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      <PageHeader title="내가 쓴 글" />

      <main className="relative flex-1 overflow-y-auto">
        <div className="flex flex-col gap-[12px] px-[16px] pt-[16px] pb-[24px]">
          <p className="text-[20px] font-bold text-[var(--heading)]">내가 만든 펀딩</p>

          {posts.length === 0 && (
            <p className="py-[24px] text-center text-[14px] text-[var(--border)]">
              아직 만든 펀딩이 없어요
            </p>
          )}

          {posts.map((p) => {
            const current = currentCountOf(p)
            const matched = isMatched(p)
            return (
              <div
                key={p.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/funding/${p.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/funding/${p.id}`)}
                className="flex w-full cursor-pointer gap-[12px] rounded-[4px] border border-[var(--border-card)] p-[12px] shadow-[0px_4px_6px_rgba(0,0,0,0.08)]"
              >
                <div
                  className="size-[76px] shrink-0 rounded-[4px]"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #2777e7 0%, #5d90d8 71.4%)',
                  }}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                  <span
                    className={`w-fit rounded-[11px] px-[8px] py-[3px] text-[11px] font-bold ${
                      matched
                        ? 'bg-[var(--blue-tint)] text-[var(--blue-deep)]'
                        : 'bg-[var(--primary-tint)] text-[var(--primary-deep)]'
                    }`}
                  >
                    {matched ? '펀딩 성공' : '모집중'}
                  </span>
                  <p className="truncate text-[16px] font-bold text-[var(--heading)]">{p.title}</p>
                  <p className="truncate text-[13px] text-[var(--label)]">
                    {p.address} · {p.meetTimeText}
                  </p>
                  <div className="h-[6px] w-full overflow-hidden rounded-full bg-[var(--hairline)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary-deep)]"
                      style={{ width: `${Math.round((current / p.targetCount) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[12px] font-bold text-[var(--label)]">
                    {current}/{p.targetCount}명 {matched && '· 채팅방 개설됨'}
                  </p>
                  {matched && (
                    <Link
                      to={`/review/new/${p.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-[4px] w-fit rounded-[4px] border border-[var(--primary-deep)] px-[10px] py-[5px] text-[11px] font-bold text-[var(--primary-deep)]"
                    >
                      후기 작성하기
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
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
