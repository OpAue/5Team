import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const categories = ['맛집', '교류', '산책', '스터디', '스포츠', '봉사']

export default function FundingForm() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [headcount, setHeadcount] = useState(4)

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
          <p className="text-[18px] font-bold text-[var(--heading)]">펀딩 만들기</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-[16px] pb-[24px]">
        <label className="mt-[16px] flex h-[132px] w-full cursor-pointer flex-col items-center justify-center gap-[8px] rounded-[4px] bg-[var(--hairline)]">
          <input type="file" accept="image/*" className="hidden" />
          <span className="flex size-[36px] items-center justify-center rounded-full bg-white text-[18px] text-[var(--label)]">
            +
          </span>
          <span className="text-[13px] text-[var(--label)]">사진 추가</span>
        </label>

        <p className="mt-[20px] text-[14px] font-bold text-[var(--heading)]">제목</p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="펀딩 제목을 입력해주세요"
          className="mt-[8px] w-full border-b border-[var(--hairline)] py-[10px] text-[15px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
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
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="만날 장소를 입력해주세요"
          className="mt-[8px] w-full border-b border-[var(--hairline)] py-[10px] text-[15px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
        />

        <div className="mt-[20px] flex gap-[16px]">
          <div className="flex-1">
            <p className="text-[14px] font-bold text-[var(--heading)]">날짜</p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-[8px] w-full border-b border-[var(--hairline)] py-[10px] text-[14px] text-[var(--heading)] focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-[var(--heading)]">시간</p>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-[8px] w-full border-b border-[var(--hairline)] py-[10px] text-[14px] text-[var(--heading)] focus:outline-none"
            />
          </div>
        </div>

        <p className="mt-[20px] text-[14px] font-bold text-[var(--heading)]">모집 인원</p>
        <div className="mt-[8px] flex items-center gap-[12px]">
          <button
            type="button"
            onClick={() => setHeadcount((n) => Math.max(2, n - 1))}
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

        <p className="mt-[20px] text-[14px] font-bold text-[var(--heading)]">참가비</p>
        <p className="mt-[8px] text-[14px] text-[var(--border)]">0원 (무료로 등록됩니다)</p>
      </main>

      <div className="flex shrink-0 items-center border-t border-[var(--hairline)] px-[16px] py-[14px]">
        <button
          type="button"
          className="flex h-[52px] flex-1 items-center justify-center rounded-[4px] bg-[var(--primary)]"
        >
          <span className="text-[16px] font-medium text-[var(--on-primary)]">펀딩 만들기</span>
        </button>
      </div>
    </div>
  )
}
