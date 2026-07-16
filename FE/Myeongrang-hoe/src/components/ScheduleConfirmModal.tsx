import { useState } from 'react'
import { confirmSchedule } from '../store/actions'
import type { FundingRecord } from '../store/schema'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toLocalInput(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatMeetText(local: string): string {
  if (!local) return '시간 미정'
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) return '시간 미정'
  return d.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ScheduleConfirmModal({
  funding,
  onClose,
}: {
  funding: FundingRecord
  onClose: () => void
}) {
  const [meetLocal, setMeetLocal] = useState(
    toLocalInput(funding.meetAt) ||
      (() => {
        const d = new Date()
        d.setHours(d.getHours() + 24)
        d.setMinutes(0, 0, 0)
        return toLocalInput(d.toISOString())
      })(),
  )
  const [locationName, setLocationName] = useState(funding.locationName)
  const [address, setAddress] = useState(funding.address)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!meetLocal || !locationName.trim() || saving) return
    setSaving(true)
    try {
      const meetAt = new Date(meetLocal).toISOString()
      await confirmSchedule(funding.id, {
        meetAt,
        meetTimeText: formatMeetText(meetLocal),
        locationName: locationName.trim(),
        address: address.trim(),
        lat: funding.lat,
        lng: funding.lng,
      })
      onClose()
    } catch {
      // toast already shown
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[170] flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-[402px] rounded-t-[12px] bg-white px-[20px] pb-[24px] pt-[16px] shadow-xl sm:rounded-[12px]">
        <div className="mb-[12px] flex items-center justify-between">
          <p className="text-[17px] font-bold text-[var(--heading)]">만남 일정 확정</p>
          <button type="button" onClick={onClose} className="text-[20px] text-[var(--label)]">
            ×
          </button>
        </div>
        <p className="mb-[14px] text-[13px] text-[var(--label)]">
          성사된 모임의 시간과 장소를 확정하면 참여자에게 알리고 캘린더에 추가할 수 있어요.
        </p>

        <label className="mb-[6px] block text-[13px] font-medium text-[var(--heading)]">만남 일시</label>
        <input
          type="datetime-local"
          value={meetLocal}
          onChange={(e) => setMeetLocal(e.target.value)}
          className="mb-[12px] h-[44px] w-full rounded-[4px] border border-[var(--hairline)] px-[12px] text-[14px] focus:outline-none"
        />

        <label className="mb-[6px] block text-[13px] font-medium text-[var(--heading)]">장소 이름</label>
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="예: 명지대 학생회관 앞"
          className="mb-[12px] h-[44px] w-full rounded-[4px] border border-[var(--hairline)] px-[12px] text-[14px] focus:outline-none"
        />

        <label className="mb-[6px] block text-[13px] font-medium text-[var(--heading)]">주소 (선택)</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="상세 주소"
          className="mb-[16px] h-[44px] w-full rounded-[4px] border border-[var(--hairline)] px-[12px] text-[14px] focus:outline-none"
        />

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || !meetLocal || !locationName.trim()}
          className="flex h-[48px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)] disabled:opacity-40"
        >
          <span className="text-[15px] font-medium text-[var(--on-primary)]">
            {saving ? '저장 중...' : '일정 확정하기'}
          </span>
        </button>
      </div>
    </div>
  )
}
