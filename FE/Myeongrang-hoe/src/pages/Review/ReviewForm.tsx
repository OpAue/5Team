import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackButton from '../../components/BackButton'
import participantAvatar from '../../assets/fundingtab/participant-avatar.svg'
import { useDB } from '../../store/db'
import { CHECKLIST_ITEMS, getCurrentUser, getFunding, otherParticipants, submitReview } from '../../store/actions'

type TargetState = {
  noShow: boolean
  checked: string[]
  comment: string
}

function emptyState(): TargetState {
  return { noShow: false, checked: [], comment: '' }
}

export default function ReviewForm() {
  const navigate = useNavigate()
  const { fundingId } = useParams()
  useDB()
  const me = getCurrentUser()
  const funding = getFunding(fundingId)
  const targets = me ? otherParticipants(funding, me.email) : []

  const [activeEmail, setActiveEmail] = useState(targets[0]?.email ?? '')
  const [state, setState] = useState<Record<string, TargetState>>(
    Object.fromEntries(targets.map((t) => [t.email, emptyState()])),
  )

  const active = state[activeEmail]
  const completedCount = Object.values(state).filter((s) => s.noShow || s.checked.length > 0).length

  function toggleCheck(item: string) {
    setState((prev) => {
      const cur = prev[activeEmail] ?? emptyState()
      const checked = cur.checked.includes(item)
        ? cur.checked.filter((c) => c !== item)
        : [...cur.checked, item]
      return { ...prev, [activeEmail]: { ...cur, checked } }
    })
  }

  function setComment(comment: string) {
    setState((prev) => ({ ...prev, [activeEmail]: { ...(prev[activeEmail] ?? emptyState()), comment } }))
  }

  function setNoShow(noShow: boolean) {
    setState((prev) => ({ ...prev, [activeEmail]: { ...(prev[activeEmail] ?? emptyState()), noShow } }))
  }

  function handleSubmitAll() {
    if (!me) return
    targets.forEach((t) => {
      const s = state[t.email]
      if (!s) return
      if (s.noShow) {
        submitReview(funding.id, me.email, t.email, [], '', true)
      } else if (s.checked.length > 0 || s.comment.trim()) {
        submitReview(funding.id, me.email, t.email, s.checked, s.comment.trim())
      }
    })
    navigate('/mypage')
  }

  if (targets.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <header className="sticky top-0 z-10 shrink-0 bg-white">
          <div className="h-[24px]" />
          <div className="flex h-[56px] items-center gap-[12px] border-b border-[var(--hairline)] px-[16px]">
            <BackButton onClick={() => navigate(-1)} />
            <p className="text-[18px] font-bold text-[var(--heading)]">후기 작성</p>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-[16px]">
          <p className="text-center text-[14px] text-[var(--border)]">
            함께 참여한 다른 사람이 없어서 후기를 남길 대상이 없어요
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 shrink-0 bg-white">
        <div className="h-[24px]" />
        <div className="flex h-[56px] items-center gap-[12px] border-b border-[var(--hairline)] px-[16px]">
          <BackButton onClick={() => navigate(-1)} />
          <p className="text-[18px] font-bold text-[var(--heading)]">{funding.title} 후기</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-[16px] pb-[24px]">
        <p className="mt-[16px] text-[14px] text-[var(--label)]">
          함께한 참여자들에게 후기를 남겨주세요 ({completedCount}/{targets.length})
        </p>

        <div className="mt-[12px] flex gap-[8px] overflow-x-auto">
          {targets.map((t) => (
            <button
              key={t.email}
              type="button"
              onClick={() => setActiveEmail(t.email)}
              className={`flex shrink-0 flex-col items-center gap-[6px] rounded-[4px] border p-[10px] ${
                activeEmail === t.email
                  ? 'border-[var(--primary-deep)] bg-[var(--primary-tint)]'
                  : 'border-[var(--border-card)] bg-white'
              }`}
            >
              <img src={participantAvatar} alt="" className="size-[36px]" />
              <span
                className={`text-[13px] ${
                  activeEmail === t.email ? 'font-bold text-[var(--primary-deep)]' : 'text-[var(--label)]'
                }`}
              >
                {t.name}
              </span>
              {state[t.email]?.noShow && (
                <span className="text-[10px] font-bold text-[var(--red)]">노쇼 신고</span>
              )}
              {!state[t.email]?.noShow && (state[t.email]?.checked.length ?? 0) > 0 && (
                <span className="text-[10px] font-bold text-[var(--blue-deep)]">작성됨</span>
              )}
            </button>
          ))}
        </div>

        {active && (
          <>
            <p className="mt-[24px] text-[14px] font-bold text-[var(--heading)]">
              {targets.find((t) => t.email === activeEmail)?.name}님이 약속에 나왔나요?
            </p>
            <div className="mt-[10px] flex gap-[8px]">
              <button
                type="button"
                onClick={() => setNoShow(false)}
                className={`flex-1 rounded-[4px] border py-[12px] text-[14px] font-bold ${
                  !active.noShow
                    ? 'border-[var(--primary-deep)] bg-[var(--primary-tint)] text-[var(--primary-deep)]'
                    : 'border-[var(--border-card)] bg-white text-[var(--label)]'
                }`}
              >
                네, 참석했어요
              </button>
              <button
                type="button"
                onClick={() => setNoShow(true)}
                className={`flex-1 rounded-[4px] border py-[12px] text-[14px] font-bold ${
                  active.noShow
                    ? 'border-[var(--red)] bg-[#FFF1EF] text-[var(--red)]'
                    : 'border-[var(--border-card)] bg-white text-[var(--label)]'
                }`}
              >
                아니요, 노쇼했어요
              </button>
            </div>

            {active.noShow ? (
              <p className="mt-[16px] rounded-[4px] bg-[#FFF1EF] p-[13px] text-[13px] text-[var(--red)]">
                노쇼로 신고되면 상대방의 노쇼 횟수가 올라가고 햇살지수가 낮아져요. 참석 여부만
                기록되고 별도 후기는 남기지 않아요.
              </p>
            ) : (
              <>
                <div className="mt-[20px] h-[132px] w-full rounded-[4px] bg-[var(--hairline)]">
                  <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-[8px]">
                    <input type="file" accept="image/*" className="hidden" />
                    <span className="flex size-[36px] items-center justify-center rounded-full bg-white text-[18px] text-[var(--label)]">
                      +
                    </span>
                    <span className="text-[13px] text-[var(--label)]">사진 추가 (선택)</span>
                  </label>
                </div>

                <p className="mt-[20px] text-[14px] font-bold text-[var(--heading)]">
                  {targets.find((t) => t.email === activeEmail)?.name}님은 어땠나요?
                </p>
                <div className="mt-[10px] flex flex-col gap-[8px]">
                  {CHECKLIST_ITEMS.map((item) => {
                    const checked = active.checked.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleCheck(item)}
                        className={`flex items-center gap-[10px] rounded-[4px] border px-[14px] py-[12px] text-left ${
                          checked
                            ? 'border-[var(--primary-deep)] bg-[var(--primary-tint)]'
                            : 'border-[var(--border-card)] bg-white'
                        }`}
                      >
                        <span
                          className={`flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border text-[12px] font-bold ${
                            checked
                              ? 'border-[var(--primary-deep)] bg-[var(--primary-deep)] text-white'
                              : 'border-[var(--border)] text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                        <span
                          className={`text-[14px] ${checked ? 'font-bold text-[var(--primary-deep)]' : 'text-[var(--heading)]'}`}
                        >
                          {item}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <p className="mt-[20px] text-[14px] font-bold text-[var(--heading)]">자유 후기</p>
                <textarea
                  value={active.comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="함께한 시간에 대한 솔직한 후기를 남겨주세요"
                  className="mt-[8px] h-[96px] w-full resize-none rounded-[4px] border border-[var(--hairline)] p-[11px] text-[14px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
                />
              </>
            )}
          </>
        )}
      </main>

      <div className="flex shrink-0 items-center border-t border-[var(--hairline)] px-[16px] py-[14px]">
        <button
          type="button"
          onClick={handleSubmitAll}
          className="flex h-[52px] flex-1 items-center justify-center rounded-[4px] bg-[var(--primary)]"
        >
          <span className="text-[16px] font-medium text-[var(--on-primary)]">후기 등록하기</span>
        </button>
      </div>
    </div>
  )
}
