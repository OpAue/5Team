import { Link } from 'react-router-dom'
import logo from '../assets/shared/logo.png'
import { useDB } from '../store/db'
import { getCurrentUser } from '../store/actions'
import { hasUnreadNotifications } from '../store/notifications'

export default function PageHeader({ title }: { title: string }) {
  useDB()
  const me = getCurrentUser()
  const unread = !!me && hasUnreadNotifications(me.email)

  return (
    <header className="sticky top-0 z-10 shrink-0 bg-white">
      <div className="h-[26px]" />
      <div className="flex h-[60px] items-center justify-between px-[17px]">
        <p className="text-[21px] font-bold text-[var(--heading)]">{title}</p>
        <div className="flex items-center gap-[15px]">
          <Link to="/notifications" aria-label="알림" className="relative flex size-[28px] items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="size-[22px]">
              <path
                d="M12 3a5 5 0 0 0-5 5v3.2c0 .8-.28 1.58-.79 2.2L5 15.4c-.5.6-.07 1.5.7 1.5h12.6c.77 0 1.2-.9.7-1.5l-1.21-1.99A3.5 3.5 0 0 1 17 11.2V8a5 5 0 0 0-5-5Z"
                stroke="var(--heading)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 19.5a2.5 2.5 0 0 0 5 0"
                stroke="var(--heading)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            {unread && (
              <span className="absolute right-[1px] top-[1px] size-[7px] rounded-full bg-[var(--red)]" />
            )}
          </Link>
          <img src={logo} alt="명랑회 로고" className="h-[30px] w-auto" />
        </div>
      </div>
      <div className="border-b border-[var(--hairline)]" />
    </header>
  )
}
