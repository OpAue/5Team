import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../../components/BackButton'
import UserAvatar from '../../components/UserAvatar'
import UserProfileSheet from '../../components/UserProfileSheet'
import { useDB } from '../../store/db'
import {
  chatMessagesOf,
  currentCountOf,
  getCurrentUser,
  getFunding,
  getUser,
  sendChatMessage,
  syncChatFromServer,
  syncFundingDetail,
} from '../../store/actions'
import { getChatSeenAt, markChatSeen } from '../../lib/chatRead'

const POLL_MS = 2000

export default function ChatRoom() {
  const navigate = useNavigate()
  const { id } = useParams()
  useDB()
  const funding = getFunding(id)
  const me = getCurrentUser()
  const messages = chatMessagesOf(funding.id)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [profileEmail, setProfileEmail] = useState<string | null>(null)
  const listRef = useRef<HTMLElement | null>(null)

  // 2초 폴링 + 진입 시 즉시 동기화
  useEffect(() => {
    const numId = Number(id)
    if (!Number.isFinite(numId) || numId <= 0) return
    void syncFundingDetail(numId)
    void syncChatFromServer(numId)
    const timer = window.setInterval(() => {
      void syncChatFromServer(numId)
    }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [id])

  // 방 입장/새 메시지 수신 시 읽음 처리
  useEffect(() => {
    if (messages.length === 0) return
    const lastAt = messages[messages.length - 1]?.createdAt ?? 0
    if (lastAt > 0) markChatSeen(funding.id, lastAt)
  }, [funding.id, messages])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  async function handleSend() {
    const text = draft.trim()
    if (!text || !me || sending) return

    setSending(true)
    setDraft('')
    try {
      await sendChatMessage(funding.id, me.email, text)
      markChatSeen(funding.id, Date.now())
    } catch {
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    e.preventDefault()
    void handleSend()
  }

  // 내 메시지 이후 상대 메시지가 있으면 읽음으로 간주 (로컬 휴리스틱)
  // 서버 읽음 동기화가 없으므로, 방이 열려 있을 때 상대 최신 시각 기준으로 표시
  const myLastMsgIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].authorEmail === me?.email) return i
    }
    return -1
  })()
  const peerSeenHeuristic =
    myLastMsgIndex >= 0 &&
    messages.slice(myLastMsgIndex + 1).some((m) => m.authorEmail !== 'system' && m.authorEmail !== me?.email)

  // 방 재진입 시 이미 본 구간 이후 메시지는 읽음 처리됨 — 내 마지막 말 아래 읽음 표시
  const showReadOnMyLast =
    myLastMsgIndex >= 0 &&
    (peerSeenHeuristic || getChatSeenAt(funding.id) >= (messages[myLastMsgIndex]?.createdAt ?? 0))

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 shrink-0 bg-white">
        <div className="h-[24px]" />
        <div className="flex h-[56px] items-center gap-[12px] border-b border-[var(--hairline)] px-[16px]">
          <BackButton onClick={() => navigate(-1)} />
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-[16px] font-bold text-[var(--heading)]">{funding.title}</p>
            <p className="text-[12px] text-[var(--label)]">참여자 {currentCountOf(funding)}명</p>
          </div>
          <UserAvatar user={me} size={36} />
        </div>
      </header>

      <main
        ref={listRef}
        className="flex flex-1 flex-col gap-[12px] overflow-y-auto px-[16px] py-[16px]"
      >
        {messages.map((m, idx) => {
          if (m.authorEmail === 'system') {
            return (
              <div key={`${m.fundingId}-${m.id}`} className="flex justify-center">
                <span className="rounded-full bg-[var(--hairline)] px-[12px] py-[6px] text-[12px] text-[var(--label)]">
                  {m.content}
                </span>
              </div>
            )
          }

          const isMe = m.authorEmail === me?.email
          const time = new Date(m.createdAt).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })
          const isMyLast = isMe && idx === myLastMsgIndex

          if (isMe) {
            return (
              <div key={`${m.fundingId}-${m.id}`} className="flex flex-col items-end gap-[2px]">
                <div className="flex items-end justify-end gap-[6px]">
                  <div className="flex flex-col items-end gap-[2px]">
                    {isMyLast && (
                      <span className="text-[10px] text-[var(--primary-deep)]">
                        {showReadOnMyLast && peerSeenHeuristic ? '읽음' : '전송됨'}
                      </span>
                    )}
                    <span className="text-[11px] text-[var(--border)]">{time}</span>
                  </div>
                  <div className="max-w-[240px] rounded-[12px] bg-[var(--primary)] px-[14px] py-[10px]">
                    <p className="text-[14px] text-white">{m.content}</p>
                  </div>
                </div>
              </div>
            )
          }

          const author = getUser(m.authorEmail)
          return (
            <div key={`${m.fundingId}-${m.id}`} className="flex items-start gap-[8px]">
              <button type="button" onClick={() => setProfileEmail(m.authorEmail)} aria-label="프로필">
                <UserAvatar user={author} size={32} />
              </button>
              <div className="flex flex-col items-start gap-[4px]">
                <button
                  type="button"
                  onClick={() => setProfileEmail(m.authorEmail)}
                  className="text-[13px] font-bold text-[var(--heading)]"
                >
                  {author?.name ?? '알 수 없음'}
                </button>
                <div className="flex items-end gap-[6px]">
                  <div className="max-w-[220px] rounded-[12px] bg-[var(--hairline)] px-[14px] py-[10px]">
                    <p className="text-[14px] text-[var(--heading)]">{m.content}</p>
                  </div>
                  <span className="text-[11px] text-[var(--border)]">{time}</span>
                </div>
              </div>
            </div>
          )
        })}
      </main>

      <div className="flex shrink-0 items-center gap-[12px] border-t border-[var(--hairline)] px-[12px] py-[19px]">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={sending}
          placeholder="메시지를 입력하세요"
          className="h-[37px] flex-1 rounded-full bg-[var(--hairline)] px-[16px] text-[14px] text-[var(--heading)] placeholder:text-[var(--label)] focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || !draft.trim()}
          aria-label="전송"
          className="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-[var(--primary)] disabled:opacity-40"
        >
          <span className="text-[16px] text-white">{sending ? '…' : '↑'}</span>
        </button>
      </div>

      {profileEmail && (
        <UserProfileSheet email={profileEmail} onClose={() => setProfileEmail(null)} />
      )}
    </div>
  )
}
