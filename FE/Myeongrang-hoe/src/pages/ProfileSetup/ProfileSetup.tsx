import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import avatarPlaceholder from '../../assets/profilesetup/avatar-placeholder.svg'
import avatarUploadBtn from '../../assets/profilesetup/avatar-upload-btn.svg'
import { getCurrentUser, updateProfile } from '../../store/actions'
import { showToast } from '../../store/ui'
import { patchDraft } from '../../store/signupDraft'
import { FUNDING_CATEGORIES, type Campus } from '../../store/schema'
import { getAccessToken, uploadImageApi } from '../../lib/api'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

export default function ProfileSetup({ mode = 'signup' }: { mode?: 'signup' | 'edit' }) {
  const navigate = useNavigate()
  const editingUser = mode === 'edit' ? getCurrentUser() : null
  const fileRef = useRef<HTMLInputElement>(null)

  const [campus, setCampus] = useState<Campus>(editingUser?.campus ?? '인문캠퍼스')
  const [name, setName] = useState(editingUser?.name ?? '')
  const [major, setMajor] = useState(editingUser?.major ?? '')
  const [age, setAge] = useState(editingUser?.age ?? '')
  const [bio, setBio] = useState(editingUser?.bio ?? '')
  const [avatarImage, setAvatarImage] = useState(editingUser?.avatarImage ?? '')
  const [interests, setInterests] = useState<string[]>(editingUser?.interests ?? [])
  const [saving, setSaving] = useState(false)

  function toggleInterest(tag: string) {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  async function handlePickImage(file: File | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 올릴 수 있어요', 'error')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      showToast('프로필 사진은 2MB 이하로 올려주세요', 'error')
      return
    }

    if (getAccessToken()) {
      try {
        const url = await uploadImageApi(file)
        setAvatarImage(url)
        showToast('프로필 사진을 서버에 올렸어요', 'success')
        return
      } catch {
        showToast('서버 업로드 실패, 로컬 미리보기로 저장해요', 'info')
      }
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result || result.length > 3_000_000) {
        showToast('사진이 너무 커요. 2MB 이하로 올려주세요', 'error')
        return
      }
      setAvatarImage(result)
      showToast('프로필 사진을 선택했어요', 'success')
    }
    reader.onerror = () => showToast('사진을 읽지 못했어요', 'error')
    reader.readAsDataURL(file)
  }

  function handleSubmit() {
    if (!name.trim()) {
      showToast('이름을 입력해주세요', 'error')
      return
    }

    if (mode === 'edit') {
      if (!editingUser) return
      setSaving(true)
      updateProfile(editingUser.email, {
        name: name.trim(),
        campus,
        major,
        age,
        bio,
        avatarImage: avatarImage || '',
        interests,
      })
      showToast('프로필을 저장했어요', 'success')
      setSaving(false)
      navigate('/mypage')
      return
    }

    patchDraft({ name: name.trim(), campus, major, age, bio })
    // 가입 중 사진: 로컬 draft 이후 가입 완료 시 서버에 반영되도록 sessionStorage 보조
    if (avatarImage) {
      try {
        sessionStorage.setItem('mh_signup_avatar', avatarImage)
      } catch {
        // ignore
      }
    }
    navigate('/signup/interests')
  }

  return (
    <div className="flex min-h-screen flex-col bg-white px-[24px] pt-[64px] pb-[32px]">
      <p className="text-[24px] font-bold text-[var(--heading)]">
        {mode === 'edit' ? '프로필 수정' : '프로필을 설정해주세요'}
      </p>
      <p className="text-[14px] text-[var(--label)]">명랑회에서 사용할 프로필이에요</p>

      <div className="h-[32px]" />

      <div className="relative mx-auto h-[96px] w-[96px]">
        <img
          src={avatarImage || avatarPlaceholder}
          alt="프로필 사진"
          className="size-[96px] rounded-full object-cover"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            handlePickImage(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          aria-label="사진 업로드"
          onClick={() => fileRef.current?.click()}
          className="absolute bottom-0 right-0 flex size-[32px] items-center justify-center"
        >
          <img src={avatarUploadBtn} alt="" className="absolute inset-0 size-full" />
          <span className="relative text-[16px] font-bold text-[var(--on-primary)]">+</span>
        </button>
      </div>
      <p className="mt-[10px] text-center text-[11px] text-[var(--border)]">
        프로필 사진 · JPG/PNG · 최대 2MB
      </p>
      {avatarImage && mode === 'edit' && (
        <button
          type="button"
          onClick={() => setAvatarImage('')}
          className="mt-[6px] text-center text-[12px] font-medium text-[var(--label)]"
        >
          사진 삭제
        </button>
      )}

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

      <p className="text-[14px] font-bold text-[var(--heading)]">학과</p>
      <div className="h-[8px]" />
      <input
        type="text"
        value={major}
        onChange={(e) => setMajor(e.target.value)}
        placeholder="예) 컴퓨터공학과"
        className="w-full border-b border-[var(--hairline)] py-[14px] text-[16px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
      />

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

      {mode === 'edit' && (
        <>
          <div className="h-[24px]" />
          <p className="text-[14px] font-bold text-[var(--heading)]">관심사</p>
          <p className="text-[12px] text-[var(--label)]">
            선택한 관심사에 맞는 펀딩과 알림을 보여드려요
          </p>
          <div className="h-[8px]" />
          <div className="flex flex-wrap gap-[8px]">
            {FUNDING_CATEGORIES.map((tag) => {
              const active = interests.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleInterest(tag)}
                  className={`rounded-full border px-[14px] py-[9px] text-[13px] ${
                    active
                      ? 'border-[var(--primary-deep)] bg-[var(--primary-tint)] font-bold text-[var(--primary-deep)]'
                      : 'border-[var(--border-card)] bg-white font-medium text-[var(--label)]'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </>
      )}

      <div className="h-[32px]" />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className="flex h-[52px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)] disabled:opacity-40"
      >
        <span className="text-[16px] font-medium text-[var(--on-primary)]">
          {saving ? '저장 중...' : mode === 'edit' ? '저장하기' : '다음'}
        </span>
      </button>
    </div>
  )
}
