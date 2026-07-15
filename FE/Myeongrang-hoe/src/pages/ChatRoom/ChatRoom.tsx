import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../../components/BackButton'

type Message =
  | { type: 'system'; id: number; text: string }
  | { type: 'me'; id: number; text: string; time: string }
  | { type: 'other'; id: number; name: string; text: string; time: string }

const initialMessages: Message[] = [
  { type: 'system', id: 1, text: '이명지님이 채팅방을 개설했습니다' },
  {
    type: 'other',
    id: 2,
    name: '이명지',
    text: '안녕하세요! 오늘 보드게임 밤 참여해 주셔서 감사해요',
    time: '19:02',
  },
  { type: 'other', id: 3, name: '박인문', text: '몇 시까지 가면 될까요?', time: '19:03' },
  { type: 'me', id: 4, text: '저는 7시까지 갈게요!', time: '19:05' },
  {
    type: 'other',
    id: 5,
    name: '이명지',
    text: '네 좋아요~ 학생라운지 3층에서 봬요',
    time: '19:05',
  },
  { type: 'system', id: 6, text: '최자연님이 참여하셨습니다' },
  {
    type: 'me',
    id: 7,
    text: '장소 다시 한 번 확인할게요, 본관 학생라운지 맞죠?',
    time: '19:10',
  },
  { type: 'other', id: 8, name: '이명지', text: '맞아요! 이따 봬요', time: '19:11' },
]

export default function ChatRoom() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')

  function handleSend() {
    const text = draft.trim()
    if (!text) return
    const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [...prev, { type: 'me', id: Date.now(), text, time }])
    setDraft('')
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 shrink-0 bg-white">
        <div className="h-[24px]" />
        <div className="flex h-[56px] items-center gap-[12px] border-b border-[var(--hairline)] px-[16px]">
          <BackButton onClick={() => navigate(-1)} />
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-[16px] font-bold text-[var(--heading)]">
              인문 x 자연 보드게임 밤
            </p>
            <p className="text-[12px] text-[var(--label)]">참여자 14명</p>
          </div>
          <div className="size-[36px] shrink-0 rounded-full bg-[var(--hairline)]" />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-[12px] overflow-y-auto px-[16px] py-[16px]">
        {messages.map((m) => {
          if (m.type === 'system') {
            return (
              <div key={m.id} className="flex justify-center">
                <span className="rounded-full bg-[var(--hairline)] px-[12px] py-[6px] text-[12px] text-[var(--label)]">
                  {m.text}
                </span>
              </div>
            )
          }
          if (m.type === 'me') {
            return (
              <div key={m.id} className="flex items-end justify-end gap-[6px]">
                <span className="text-[11px] text-[var(--border)]">{m.time}</span>
                <div className="max-w-[240px] rounded-[12px] bg-[var(--primary)] px-[14px] py-[10px]">
                  <p className="text-[14px] text-white">{m.text}</p>
                </div>
              </div>
            )
          }
          return (
            <div key={m.id} className="flex items-start gap-[8px]">
              <div className="size-[32px] shrink-0 rounded-full bg-[var(--hairline)]" />
              <div className="flex flex-col items-start gap-[4px]">
                <p className="text-[13px] font-bold text-[var(--heading)]">{m.name}</p>
                <div className="flex items-end gap-[6px]">
                  <div className="max-w-[220px] rounded-[12px] bg-[var(--hairline)] px-[14px] py-[10px]">
                    <p className="text-[14px] text-[var(--heading)]">{m.text}</p>
                  </div>
                  <span className="text-[11px] text-[var(--border)]">{m.time}</span>
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
