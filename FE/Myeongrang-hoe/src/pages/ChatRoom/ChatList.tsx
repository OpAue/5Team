import { Link } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import { useDB } from '../../store/db'
import { chatMessagesOf, currentCountOf, fundingsOf, getCurrentUser, getUser } from '../../store/actions'

export default function ChatList() {
  useDB()
  const me = getCurrentUser()
  const rooms = me ? fundingsOf(me.email) : []

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      <PageHeader title="채팅" />

      <main className="flex-1 overflow-y-auto">
        {rooms.length === 0 && (
          <p className="py-[40px] text-center text-[14px] text-[var(--border)]">
            펀딩을 만들거나 참여하면 채팅방이 자동으로 열려요
          </p>
        )}

        {rooms.map((r) => {
          const messages = chatMessagesOf(r.id)
          const last = messages[messages.length - 1]
          const lastAuthor = last && last.authorEmail !== 'system' ? getUser(last.authorEmail)?.name : null
          return (
            <Link
              key={r.id}
              to={`/chat/${r.id}`}
              className="flex w-full items-center gap-[13px] border-b border-[var(--hairline)] px-[17px] py-[15px]"
            >
              <div className="size-[48px] shrink-0 rounded-full bg-[var(--hairline)]" />
              <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <div className="flex items-center justify-between gap-[8px]">
                  <p className="truncate text-[16px] font-bold text-[var(--heading)]">{r.title}</p>
                  <span className="shrink-0 text-[12px] text-[var(--border)]">
                    {currentCountOf(r)}/{r.targetCount}명
                  </span>
                </div>
                <p className="truncate text-[13px] text-[var(--label)]">
                  {last ? `${lastAuthor ? `${lastAuthor}: ` : ''}${last.content}` : '채팅방이 개설됐어요'}
                </p>
              </div>
            </Link>
          )
        })}
      </main>

      <BottomNav active="chat" />
    </div>
  )
}
