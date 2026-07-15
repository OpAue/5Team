import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  return (
    <div className="flex min-h-screen flex-col bg-white px-[24px] pt-[100px]">
      <p className="text-[28px] font-bold text-[var(--heading)]">명랑회</p>
      <p className="text-[16px] text-[var(--label)]">학교 이메일로 안전하게 시작해보세요</p>

      <div className="h-[56px]" />

      <p className="text-[14px] font-bold text-[var(--heading)]">학교 이메일</p>
      <div className="h-[8px]" />
      <div className="flex w-full items-center gap-[8px]">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mju.ac.kr"
          className="flex-1 border-b border-[var(--hairline)] py-[14px] text-[16px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
        />
        <button
          type="button"
          className="shrink-0 rounded-[4px] border border-[var(--border)] px-[12px] py-[10px] text-[13px] font-medium text-[var(--heading)]"
        >
          인증번호 받기
        </button>
      </div>

      <div className="h-[28px]" />

      <p className="text-[14px] font-bold text-[var(--heading)]">인증번호</p>
      <div className="h-[8px]" />
      <div className="flex w-full items-center gap-[8px]">
        <div className="flex flex-1 items-center justify-between border-b border-[var(--hairline)] py-[14px]">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6자리 숫자 입력"
            className="w-full text-[16px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
          />
          <span className="shrink-0 text-[13px] font-bold text-[var(--red)]">03:00</span>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-[4px] border border-[var(--border)] px-[12px] py-[10px] text-[13px] font-medium text-[var(--heading)]"
        >
          확인
        </button>
      </div>

      <div className="h-[40px]" />

      <button
        type="button"
        className="flex h-[52px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)]"
      >
        <span className="text-[16px] font-medium text-[var(--on-primary)]">인증하고 시작하기</span>
      </button>

      <div className="h-[16px]" />

      <p className="text-center text-[12px] text-[var(--border)]">
        명지대학교 이메일(@mju.ac.kr)로만 가입할 수 있어요
      </p>
    </div>
  )
}
