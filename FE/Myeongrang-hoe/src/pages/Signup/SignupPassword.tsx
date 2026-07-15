import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { patchDraft } from '../../store/signupDraft'

export default function SignupPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const mismatch = confirm.length > 0 && password !== confirm

  return (
    <div className="flex min-h-screen flex-col bg-white px-[24px] pt-[100px]">
      <p className="text-[24px] font-bold text-[var(--heading)]">비밀번호를 설정해주세요</p>
      <p className="text-[16px] text-[var(--label)]">다음부터는 이메일과 비밀번호로 로그인할 수 있어요</p>

      <div className="h-[40px]" />

      <p className="text-[14px] font-bold text-[var(--heading)]">비밀번호</p>
      <div className="h-[8px]" />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="8자 이상 입력해주세요"
        className="w-full border-b border-[var(--hairline)] py-[14px] text-[16px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
      />

      <div className="h-[28px]" />

      <p className="text-[14px] font-bold text-[var(--heading)]">비밀번호 확인</p>
      <div className="h-[8px]" />
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="비밀번호를 다시 입력해주세요"
        className="w-full border-b border-[var(--hairline)] py-[14px] text-[16px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
      />
      {mismatch && (
        <p className="pt-[8px] text-[12px] font-medium text-[var(--red)]">비밀번호가 일치하지 않아요</p>
      )}

      <div className="h-[40px]" />

      <button
        type="button"
        disabled={password.length < 8 || mismatch}
        onClick={() => {
          patchDraft({ password })
          navigate('/profile-setup')
        }}
        className="flex h-[52px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)] disabled:opacity-40"
      >
        <span className="text-[16px] font-medium text-[var(--on-primary)]">다음</span>
      </button>
    </div>
  )
}
