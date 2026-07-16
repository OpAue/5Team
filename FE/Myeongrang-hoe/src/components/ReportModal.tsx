import { useState } from 'react'
import { getCurrentUser } from '../store/actions'
import { blockUser, submitReport, type ReportTargetType } from '../store/moderation'

const REASONS = [
  '스팸 / 광고',
  '욕설 · 혐오 표현',
  '허위 · 사기 의심',
  '노쇼 · 약속 불이행',
  '기타',
]

type Props = {
  open: boolean
  onClose: () => void
  targetType: ReportTargetType
  targetId: string
  /** 사용자 신고/차단 시 이메일 */
  targetEmail?: string
  title?: string
}

export default function ReportModal({
  open,
  onClose,
  targetType,
  targetId,
  targetEmail,
  title = '신고하기',
}: Props) {
  const me = getCurrentUser()
  const [reason, setReason] = useState(REASONS[0])
  const [detail, setDetail] = useState('')
  const [alsoBlock, setAlsoBlock] = useState(false)

  if (!open) return null

  function handleSubmit() {
    if (!me) return
    submitReport({
      reporterEmail: me.email,
      targetType,
      targetId,
      reason,
      detail: detail.trim() || undefined,
    })
    if (alsoBlock && targetEmail) {
      blockUser(targetEmail)
    }
    setDetail('')
    setAlsoBlock(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[170] flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-[402px] rounded-t-[12px] bg-white px-[20px] pb-[24px] pt-[16px] shadow-xl sm:rounded-[12px]">
        <div className="mb-[12px] flex items-center justify-between">
          <p className="text-[17px] font-bold text-[var(--heading)]">{title}</p>
          <button type="button" onClick={onClose} className="text-[20px] text-[var(--label)]">
            ×
          </button>
        </div>

        <p className="mb-[10px] text-[13px] text-[var(--label)]">신고 사유</p>
        <div className="flex flex-col gap-[8px]">
          {REASONS.map((r) => (
            <label key={r} className="flex items-center gap-[10px] text-[14px] text-[var(--heading)]">
              <input
                type="radio"
                name="report-reason"
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              {r}
            </label>
          ))}
        </div>

        <p className="mb-[6px] mt-[14px] text-[13px] text-[var(--label)]">상세 내용 (선택)</p>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="어떤 점이 문제였는지 알려주세요"
          className="h-[80px] w-full resize-none rounded-[4px] border border-[var(--hairline)] p-[10px] text-[13px] focus:outline-none"
        />

        {targetEmail && (
          <label className="mt-[12px] flex items-center gap-[8px] text-[13px] text-[var(--heading)]">
            <input
              type="checkbox"
              checked={alsoBlock}
              onChange={(e) => setAlsoBlock(e.target.checked)}
            />
            이 사용자도 함께 차단하기
          </label>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className="mt-[16px] flex h-[48px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)]"
        >
          <span className="text-[15px] font-medium text-[var(--on-primary)]">신고 접수</span>
        </button>
      </div>
    </div>
  )
}
