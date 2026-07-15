import { Link } from 'react-router-dom'
import activeIcon from '../assets/shared/nav/active.svg'
import inactiveIcon from '../assets/shared/nav/inactive.svg'
import myPostsActiveIcon from '../assets/shared/nav/myposts-active.svg'
import myPostsInactiveIcon from '../assets/shared/nav/myposts-inactive.svg'

export type NavKey = 'home' | 'list' | 'myposts' | 'mypage'

const items: { key: NavKey; label: string; to: string }[] = [
  { key: 'home', label: '홈', to: '/' },
  { key: 'list', label: '목록', to: '/list' },
  { key: 'myposts', label: '내가 쓴 글', to: '/myposts' },
  { key: 'mypage', label: '마이페이지', to: '/mypage' },
]

export default function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav className="flex h-[77px] w-full shrink-0 border-t border-[var(--hairline)] bg-white">
      {items.map((item) => {
        const isActive = item.key === active
        const icon =
          item.key === 'myposts'
            ? isActive
              ? myPostsActiveIcon
              : myPostsInactiveIcon
            : isActive
              ? activeIcon
              : inactiveIcon

        return (
          <Link
            key={item.key}
            to={item.to}
            className="flex flex-1 flex-col items-center justify-center gap-[4px]"
          >
            <img src={icon} alt="" className="size-[21px]" />
            <span
              className={`text-[12px] whitespace-nowrap ${
                isActive ? 'font-bold text-[var(--heading)]' : 'font-medium text-[var(--border)]'
              }`}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
