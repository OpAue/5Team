import { Link } from 'react-router-dom'
import activeIcon from '../assets/shared/nav/active.svg'
import inactiveIcon from '../assets/shared/nav/inactive.svg'
import myPostsActiveIcon from '../assets/shared/nav/myposts-active.svg'
import myPostsInactiveIcon from '../assets/shared/nav/myposts-inactive.svg'

export type NavKey = 'home' | 'list' | 'chat' | 'myposts' | 'mypage'

const items: { key: NavKey; label: string; to: string }[] = [
  { key: 'home', label: '홈', to: '/' },
  { key: 'list', label: '목록', to: '/list' },
  { key: 'chat', label: '채팅', to: '/chat' },
  { key: 'myposts', label: '내가 쓴 글', to: '/myposts' },
  { key: 'mypage', label: '마이페이지', to: '/mypage' },
]

function ChatIcon({ active }: { active: boolean }) {
  const color = active ? 'var(--heading)' : 'var(--border)'
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-[21px]">
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav className="flex h-[77px] w-full shrink-0 border-t border-[var(--hairline)] bg-white">
      {items.map((item) => {
        const isActive = item.key === active

        return (
          <Link
            key={item.key}
            to={item.to}
            className="flex flex-1 flex-col items-center justify-center gap-[4px]"
          >
            {item.key === 'chat' ? (
              <ChatIcon active={isActive} />
            ) : (
              <img
                src={
                  item.key === 'myposts'
                    ? isActive
                      ? myPostsActiveIcon
                      : myPostsInactiveIcon
                    : isActive
                      ? activeIcon
                      : inactiveIcon
                }
                alt=""
                className="size-[21px]"
              />
            )}
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
