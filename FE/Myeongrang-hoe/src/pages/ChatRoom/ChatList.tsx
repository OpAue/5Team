import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import { useDB } from '../../store/db'
import {
  chatMessagesOf,
  currentCountOf,
  fundingsOf,
  getCurrentUser,
  getUser,
  syncChatFromServer,
  syncFundingsFromServer,
} from '../../store/actions'
import { CAMPUS_CENTER } from '../../store/schema'
import { countUnreadChat } from '../../lib/chatRead'

const LIST_POLL_MS = 4000

export default function ChatList() {
  useDB()
  const me = getCurrentUser()
  const rooms = me ? fundingsOf(me.email) : []
  const [loading, setLoading] = useState(true)
  const [, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    void syncFundingsFromServer({
      lat: CAMPUS_CENTER.lat,
      lng: CAMPUS_CENTER.lng,
      radiusKm: 100,
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 목록에서도 주기적으로 채팅 동기화 → 읽지 않음 배지 갱신
  useEffect(() => {
    if (!me || rooms.length === 0) return
    let cancelled = false
    const syncAll = () => {
      void Promise.all(rooms.map((r) => syncChatFromServer(r.id))).then(() => {
        if (!cancelled) setTick((n) => n + 1)
      })
    }
    syncAll()
    const timer = window.setInterval(syncAll, LIST_POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
    // rooms id 목록 기준
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.email, rooms.map((r) => r.id).join(',')])

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      <PageHeader title="채팅" />

      <main className="flex-1 overflow-y-auto">
        {loading && rooms.length === 0 && (
          <p className="py-[40px] text-center text-[14px] text-[var(--border)]">불러오는 중...</p>
        )}

        {!loading && rooms.length === 0 && (
          <p className="py-[40px] text-center text-[14px] text-[var(--border)]">
            펀딩을 만들거나 참여하면 채팅방이 자동으로 열려요
          </p>
        )}

        {rooms.map((r) => {
          const messages = chatMessagesOf(r.id)
          const last = messages[messages.length - 1]
          const lastAuthor =
            last && last.authorEmail !== 'system' ? getUser(last.authorEmail)?.name : null
          const unread = countUnreadChat(r.id, messages, me?.email)
          return (
            <Link
              key={r.id}
              to={`/chat/${r.id}`}
              className="flex w-full items-center gap-[13px] border-b border-[var(--hairline)] px-[17px] py-[15px]"
            >
              <div className="size-[48px] shrink-0 rounded-full bg-[var(--hairline)]" />
              <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <div className="flex items-center justify-between gap-[8px]">
                  <p
                    className={`truncate text-[16px] font-bold ${
                      unread > 0 ? 'text-[var(--heading)]' : 'text-[var(--heading)]'
                    }`}
                  >
                    {r.title}
                  </p>
                  <div className="flex shrink-0 items-center gap-[6px]">
                    <span className="text-[12px] text-[var(--border)]">
                      {currentCountOf(r)}/{r.targetCount}명
                    </span>
                    {unread > 0 && (
                      <span className="flex min-w-[20px] items-center justify-center rounded-full bg-[var(--red)] px-[6px] py-[2px] text-[11px] font-bold text-white">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                </div>
                <p
                  className={`truncate text-[13px] ${
                    unread > 0 ? 'font-semibold text-[var(--heading)]' : 'text-[var(--label)]'
                  }`}
                >
                  {last
                    ? `${lastAuthor ? `${lastAuthor}: ` : ''}${last.content}`
                    : '채팅방이 개설됐어요'}
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
