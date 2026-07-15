import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../../components/BackButton'
import { useDB } from '../../store/db'
import { chatMessagesOf, currentCountOf, getCurrentUser, getFunding, getUser, sendChatMessage } from '../../store/actions'

export default function ChatRoom() {
  const navigate = useNavigate()
  const { id } = useParams()
  useDB()
  const funding = getFunding(id)
  const me = getCurrentUser()
  const messages = chatMessagesOf(funding.id)
  const [draft, setDraft] = useState('')

  function handleSend() {
    const text = draft.trim()
    if (!text || !me) return
    sendChatMessage(funding.id, me.email, text)
    setDraft('')
  }

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
          <div className="size-[36px] shrink-0 rounded-full bg-[var(--hairline)]" />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-[12px] overflow-y-auto px-[16px] py-[16px]">
        {messages.map((m) => {
          if (m.authorEmail === 'system') {
            return (
              <div key={m.id} className="flex justify-center">
                <span className="rounded-full bg-[var(--hairline)] px-[12px] py-[6px] text-[12px] text-[var(--label)]">
                  {m.content}
                </span>
              </div>
            )
          }

          const isMe = m.authorEmail === me?.email
          const time = new Date(m.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

          if (isMe) {
            return (
              <div key={m.id} className="flex items-end justify-end gap-[6px]">
                <span className="text-[11px] text-[var(--border)]">{time}</span>
                <div className="max-w-[240px] rounded-[12px] bg-[var(--primary)] px-[14px] py-[10px]">
                  <p className="text-[14px] text-white">{m.content}</p>
                </div>
              </div>
            )
          }

          const author = getUser(m.authorEmail)
          return (
            <div key={m.id} className="flex items-start gap-[8px]">
              <div className="size-[32px] shrink-0 rounded-full bg-[var(--hairline)]" />
              <div className="flex flex-col items-start gap-[4px]">
                <p className="text-[13px] font-bold text-[var(--heading)]">{author?.name ?? '알 수 없음'}</p>
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
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="메시지를 입력하세요"
          className="h-[37px] flex-1 rounded-full bg-[var(--hairline)] px-[16px] text-[14px] text-[var(--heading)] placeholder:text-[var(--label)] focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          aria-label="전송"
          className="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-[var(--primary)]"
        >
          <span className="text-[16px] text-white">↑</span>
        </button>
      </div>
    </div>
  )
}
