import { useState } from 'react'
import avatarPlaceholder from '../../assets/profilesetup/avatar-placeholder.svg'
import avatarUploadBtn from '../../assets/profilesetup/avatar-upload-btn.svg'

type Campus = '인문캠퍼스' | '자연캠퍼스'

export default function ProfileSetup() {
  const [campus, setCampus] = useState<Campus>('인문캠퍼스')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [bio, setBio] = useState('')

  return (
    <div className="flex min-h-screen flex-col bg-white px-[24px] pt-[64px] pb-[32px]">
      <p className="text-[24px] font-bold text-[var(--heading)]">프로필을 설정해주세요</p>
      <p className="text-[14px] text-[var(--label)]">명랑회에서 사용할 프로필이에요</p>

      <div className="h-[32px]" />

      <div className="relative h-[96px] w-full">
        <img
          src={avatarPlaceholder}
          alt="프로필 사진"
          className="absolute left-1/2 size-[96px] -translate-x-1/2"
        />
        <button
          type="button"
          aria-label="사진 업로드"
          className="absolute left-1/2 top-[68px] flex size-[32px] translate-x-[36px] items-center justify-center"
        >
          <img src={avatarUploadBtn} alt="" className="absolute inset-0 size-full" />
          <span className="relative text-[16px] font-bold text-[var(--on-primary)]">+</span>
        </button>
      </div>

      <div className="h-[32px]" />

      <p className="text-[14px] font-bold text-[var(--heading)]">이름</p>
      <div className="h-[8px]" />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="실명을 입력해주세요"
        className="w-full border-b border-[var(--hairline)] py-[14px] text-[16px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
      />

      <div className="h-[24px]" />

      <p className="text-[14px] font-bold text-[var(--heading)]">캠퍼스</p>
      <div className="h-[8px]" />
      <div className="flex w-full gap-[8px]">
        {(['인문캠퍼스', '자연캠퍼스'] as Campus[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCampus(c)}
            className={`flex-1 rounded-[4px] border py-[12px] text-[14px] ${
              campus === c
                ? 'border-[var(--primary-deep)] bg-[var(--primary-tint)] font-bold text-[var(--primary-deep)]'
                : 'border-[var(--border-card)] bg-white font-medium text-[var(--label)]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="h-[24px]" />

      <p className="text-[14px] font-bold text-[var(--heading)]">나이</p>
      <div className="h-[8px]" />
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        placeholder="만 나이를 입력해주세요"
        className="w-full border-b border-[var(--hairline)] py-[14px] text-[16px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
      />

      <div className="h-[24px]" />

      <p className="text-[14px] font-bold text-[var(--heading)]">한줄소개</p>
      <div className="h-[8px]" />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="다른 학생들에게 나를 소개해보세요"
        className="h-[88px] w-full resize-none rounded-[4px] border border-[var(--hairline)] p-[11px] text-[14px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
      />

      <div className="h-[32px]" />

      <button
        type="button"
        className="flex h-[52px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)]"
      >
        <span className="text-[16px] font-medium text-[var(--on-primary)]">시작하기</span>
      </button>
    </div>
  )
}
