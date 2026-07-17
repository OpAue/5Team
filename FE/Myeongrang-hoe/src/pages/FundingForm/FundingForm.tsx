import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LocationSearch, { type SelectedPlace } from '../../components/LocationSearch'
import {
  createFundingAsync,
  getCurrentUser,
  getFunding,
  isHost,
  syncFundingDetail,
  updateFundingAsync,
} from '../../store/actions'
import { setGlobalLoading, showToast } from '../../store/ui'
import { getAccessToken, uploadImageApi } from '../../lib/api'
import { FUNDING_CATEGORIES } from '../../store/schema'

const categories = FUNDING_CATEGORIES
const MAX_IMAGE_BYTES = 2 * 1024 * 1024 // 2MB

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function todayDateInput(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function nowDatetimeLocalInput(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function isoToDateInput(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function isoToTimeInput(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function isoToDatetimeLocalInput(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function computeMeetAt(dateStr: string, timeStr: string): string {
  if (!dateStr && !timeStr) return ''
  const baseDate = dateStr || todayDateInput()
  const t = timeStr || '00:00'
  return new Date(`${baseDate}T${t}`).toISOString()
}

function formatMeetText(dateStr: string, timeStr: string): string {
  if (!dateStr) return timeStr ? `오늘 ${timeStr}` : '시간 미정'
  const d = new Date(`${dateStr}T${timeStr || '00:00'}`)
  const isToday = d.toDateString() === new Date().toDateString()
  const week = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  const datePart = isToday ? '오늘' : `${d.getMonth() + 1}/${d.getDate()}(${week})`
  return timeStr ? `${datePart} ${timeStr}` : datePart
}

function formatDeadlineText(deadline: string): string {
  if (!deadline) return '미정'
  const [dateStr, timeStr] = deadline.split('T')
  return formatMeetText(dateStr, timeStr)
}

function computeScheduleError(dateStr: string, timeStr: string, deadlineStr: string): string {
  let meetAt = ''

  if (dateStr && !timeStr) {
    // 시간을 아직 안 골랐으면 자정(00:00) 기준으로 비교하지 않고 "날짜"만 지났는지 본다.
    // (그렇지 않으면 오늘 날짜를 골라도 이미 자정은 지났으니 항상 에러가 뜨는 버그가 생긴다)
    const chosenDateStart = new Date(`${dateStr}T00:00`).getTime()
    const todayStart = new Date(`${todayDateInput()}T00:00`).getTime()
    if (chosenDateStart < todayStart) {
      return '이미 지난 날짜는 선택할 수 없어요'
    }
  } else if (dateStr || timeStr) {
    meetAt = computeMeetAt(dateStr, timeStr)
    if (new Date(meetAt).getTime() < Date.now() - 60000) {
      return '이미 지난 시간은 선택할 수 없어요'
    }
  }

  if (deadlineStr) {
    if (new Date(deadlineStr).getTime() < Date.now() - 60000) {
      return '이미 지난 마감 시간은 선택할 수 없어요'
    }
    if (meetAt && new Date(deadlineStr).getTime() > new Date(meetAt).getTime()) {
      return '모집 마감은 만나는 시간보다 늦을 수 없어요'
    }
  }

  return ''
}

export default function FundingForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const me = getCurrentUser()
  const editing = !!id
  const existing = editing ? getFunding(id) : null
  const forbidden = editing && !!me && !!existing && !isHost(existing, me.email)

  useEffect(() => {
    if (forbidden && existing) {
      navigate(`/funding/${existing.id}`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forbidden])

  useEffect(() => {
    const numId = Number(id)
    if (editing && Number.isFinite(numId) && numId > 0) {
      void syncFundingDetail(numId)
    }
  }, [editing, id])

  const [title, setTitle] = useState(existing?.title ?? '')
  const [content, setContent] = useState(existing?.description ?? '')
  const [category, setCategory] = useState(existing?.category ?? categories[0])
  const [place, setPlace] = useState<SelectedPlace | null>(
    existing
      ? { name: existing.locationName, address: existing.address, lat: existing.lat, lng: existing.lng }
      : null,
  )
  const [date, setDate] = useState(existing ? isoToDateInput(existing.meetAt) : '')
  const [time, setTime] = useState(existing ? isoToTimeInput(existing.meetAt) : '')
  const [headcount, setHeadcount] = useState(existing?.targetCount ?? 4)
  const [deadline, setDeadline] = useState(existing ? isoToDatetimeLocalInput(existing.deadlineAt) : '')
  const [fee, setFee] = useState(existing?.fee ?? 0)
  const [coverImage, setCoverImage] = useState(existing?.coverImage ?? '')

  const minHeadcount = existing ? Math.max(2, existing.participants.length) : 2

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (existing?.coverImage) setCoverImage(existing.coverImage)
  }, [existing?.id, existing?.coverImage])

  const canSubmit = !!me && title.trim().length > 0 && !!place?.name && !error && !submitting

  function handleDateChange(nextDate: string) {
    setDate(nextDate)
    setError(computeScheduleError(nextDate, time, deadline))
  }

  function handleTimeChange(nextTime: string) {
    setTime(nextTime)
    setError(computeScheduleError(date, nextTime, deadline))
  }

  function handleDeadlineChange(nextDeadline: string) {
    setDeadline(nextDeadline)
    setError(computeScheduleError(date, time, nextDeadline))
  }

  async function handleImageChange(file: File | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 올릴 수 있어요', 'error')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showToast('이미지는 2MB 이하만 올릴 수 있어요', 'error')
      return
    }

    // 로그인 시 서버 파일 저장, 실패/오프라인 시 data URL 폴백
    if (getAccessToken()) {
      setGlobalLoading(true, '이미지 업로드 중...')
      try {
        const url = await uploadImageApi(file)
        setCoverImage(url)
        showToast('사진을 서버에 올렸어요', 'success')
        return
      } catch {
        showToast('서버 업로드 실패, 로컬 미리보기로 저장해요', 'info')
      } finally {
        setGlobalLoading(false)
      }
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result) {
        showToast('이미지를 읽지 못했어요', 'error')
        return
      }
      if (result.length > 3_000_000) {
        showToast('이미지가 너무 커요. 2MB 이하로 올려주세요', 'error')
        return
      }
      setCoverImage(result)
      showToast('사진을 추가했어요', 'success')
    }
    reader.onerror = () => showToast('이미지를 읽지 못했어요', 'error')
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setCoverImage('')
  }

  async function handleSubmit() {
    if (!me || !canSubmit || !place || submitting) return
    const scheduleError = computeScheduleError(date, time, deadline)
    if (scheduleError) {
      setError(scheduleError)
      return
    }
    const input = {
      category,
      title: title.trim(),
      description: content.trim() || '자세한 소개는 준비 중이에요.',
      address: place.address,
      locationName: place.name,
      lat: place.lat,
      lng: place.lng,
      meetAt: computeMeetAt(date, time),
      meetTimeText: formatMeetText(date, time),
      deadlineAt: deadline ? new Date(deadline).toISOString() : '',
      deadlineText: formatDeadlineText(deadline),
      targetCount: headcount,
      fee,
      coverImage,
    }

    setSubmitting(true)
    setGlobalLoading(true, editing ? '수정 중...' : '펀딩 만드는 중...')
    try {
      if (editing && existing) {
        await updateFundingAsync(existing.id, input)
        navigate(`/funding/${existing.id}`, { replace: true })
      } else {
        const newId = await createFundingAsync({ ...input, hostEmail: me.email })
        navigate(`/funding/${newId}`, { replace: true })
      }
    } catch {
      // 토스트는 actions에서 처리
    } finally {
      setSubmitting(false)
      setGlobalLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 shrink-0 bg-white">
        <div className="h-[24px]" />
        <div className="flex h-[56px] items-center gap-[12px] border-b border-[var(--hairline)] px-[16px]">
          <button type="button" onClick={() => navigate(-1)} aria-label="닫기">
            <span className="flex size-[36px] items-center justify-center text-[20px] text-[var(--heading)]">
              ×
            </span>
          </button>
          <p className="text-[18px] font-bold text-[var(--heading)]">
            {editing ? '펀딩 수정' : '펀딩 만들기'}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-[16px] pb-[24px]">
        {coverImage ? (
          <div className="relative mt-[16px] h-[160px] w-full overflow-hidden rounded-[4px] bg-[var(--hairline)]">
            <img src={coverImage} alt="펀딩 사진" className="h-full w-full object-cover" />
            <div className="absolute right-[8px] top-[8px] flex gap-[6px]">
              <label className="cursor-pointer rounded-[4px] bg-black/55 px-[10px] py-[6px] text-[12px] font-medium text-white">
                변경
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    handleImageChange(e.target.files?.[0] ?? null)
                    e.target.value = ''
                  }}
                />
              </label>
              <button
                type="button"
                onClick={clearImage}
                className="rounded-[4px] bg-black/55 px-[10px] py-[6px] text-[12px] font-medium text-white"
              >
                삭제
              </button>
            </div>
          </div>
        ) : (
          <label className="mt-[16px] flex h-[132px] w-full cursor-pointer flex-col items-center justify-center gap-[8px] rounded-[4px] bg-[var(--hairline)]">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                handleImageChange(e.target.files?.[0] ?? null)
                e.target.value = ''
              }}
            />
            <span className="flex size-[36px] items-center justify-center rounded-full bg-white text-[18px] text-[var(--label)]">
              +
            </span>
            <span className="text-[13px] text-[var(--label)]">사진 추가</span>
            <span className="text-[11px] text-[var(--border)]">JPG, PNG, WEBP · 최대 2MB</span>
          </label>
        )}

        <p className="mt-[20px] text-[14px] font-bold text-[var(--heading)]">제목</p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="펀딩 제목을 입력해주세요"
          className="mt-[8px] w-full border-b border-[var(--hairline)] py-[10px] text-[15px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
        />

        <p className="mt-[20px] text-[14px] font-bold text-[var(--heading)]">설명</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="어떤 모임인지 자세히 소개해주세요"
          className="mt-[8px] h-[96px] w-full resize-none rounded-[4px] border border-[var(--hairline)] p-[11px] text-[15px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
        />

        <p className="mt-[20px] text-[14px] font-bold text-[var(--heading)]">카테고리</p>
        <div className="mt-[8px] flex flex-wrap gap-[8px]">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-[14px] py-[7px] text-[13px] ${
                category === c
                  ? 'border-[var(--primary-deep)] bg-[var(--primary-tint)] font-bold text-[var(--primary-deep)]'
                  : 'border-[var(--border-card)] bg-white font-medium text-[var(--label)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="mt-[20px] text-[14px] font-bold text-[var(--heading)]">장소</p>
        <LocationSearch value={place} onSelect={setPlace} />

        <div className="mt-[20px] flex gap-[16px]">
          <div className="flex-1">
            <p className="text-[14px] font-bold text-[var(--heading)]">날짜</p>
            <input
              type="date"
              value={date}
              min={todayDateInput()}
              onChange={(e) => handleDateChange(e.target.value)}
              className="mt-[8px] w-full border-b border-[var(--hairline)] py-[10px] text-[14px] text-[var(--heading)] focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-[var(--heading)]">시간</p>
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="mt-[8px] w-full border-b border-[var(--hairline)] py-[10px] text-[14px] text-[var(--heading)] focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="mt-[8px] text-[12px] font-medium text-[var(--red)]">{error}</p>}

        <p className="mt-[20px] text-[14px] font-bold text-[var(--heading)]">모집 인원</p>
        <div className="mt-[8px] flex items-center gap-[12px]">
          <button
            type="button"
            onClick={() => setHeadcount((n) => Math.max(minHeadcount, n - 1))}
            className="flex size-[32px] items-center justify-center rounded-[4px] border border-[var(--border-card)] text-[16px] text-[var(--heading)]"
          >
            −
          </button>
          <span className="w-[24px] text-center text-[15px] font-bold text-[var(--heading)]">
            {headcount}
          </span>
          <button
            type="button"
            onClick={() => setHeadcount((n) => n + 1)}
            className="flex size-[32px] items-center justify-center rounded-[4px] border border-[var(--border-card)] text-[16px] text-[var(--heading)]"
          >
            +
          </button>
          <span className="text-[14px] text-[var(--label)]">명</span>
        </div>
        {editing && existing && existing.participants.length > 2 && (
          <p className="mt-[6px] text-[12px] text-[var(--border)]">
            이미 {existing.participants.length}명이 참여 중이라 그 아래로는 줄일 수 없어요
          </p>
        )}

        <p className="mt-[20px] text-[14px] font-bold text-[var(--heading)]">모집 마감</p>
        <input
          type="datetime-local"
          value={deadline}
          min={nowDatetimeLocalInput()}
          onChange={(e) => handleDeadlineChange(e.target.value)}
          className="mt-[8px] w-full border-b border-[var(--hairline)] py-[10px] text-[14px] text-[var(--heading)] focus:outline-none"
        />

        <p className="mt-[20px] text-[14px] font-bold text-[var(--heading)]">참가비</p>
        <div className="mt-[8px] flex items-center gap-[8px]">
          <input
            type="number"
            min={0}
            step={500}
            value={fee}
            onChange={(e) => setFee(Math.max(0, Number(e.target.value) || 0))}
            placeholder="0"
            className="w-full border-b border-[var(--hairline)] py-[10px] text-[15px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
          />
          <span className="shrink-0 text-[14px] text-[var(--label)]">원</span>
        </div>
        <p className="mt-[6px] text-[12px] text-[var(--border)]">
          {fee === 0 ? '무료로 등록됩니다' : `1인당 ${fee.toLocaleString()}원`}
        </p>
      </main>

      <div className="flex shrink-0 items-center border-t border-[var(--hairline)] px-[16px] py-[14px]">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => void handleSubmit()}
          className="flex h-[52px] flex-1 items-center justify-center rounded-[4px] bg-[var(--primary)] disabled:opacity-40"
        >
          <span className="text-[16px] font-medium text-[var(--on-primary)]">
            {submitting
              ? editing
                ? '수정 중...'
                : '만드는 중...'
              : editing
                ? '수정 완료'
                : '펀딩 만들기'}
          </span>
        </button>
      </div>
    </div>
  )
}
