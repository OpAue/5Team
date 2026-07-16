import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import locateBtn from '../../assets/home/locate-btn.svg'
import { signupWithApi } from '../../lib/api'
import { applyServerUser, signUp, updateProfile } from '../../store/actions'
import { clearDraft, getDraft } from '../../store/signupDraft'

export default function LocationPermission() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function finish() {
    if (submitting) return

    const draft = getDraft()
    const email = draft.email.trim().toLowerCase()
    const password = draft.password
    const name = draft.name.trim() || '새 학생'

    if (!email) {
      setError('이메일 인증 정보가 없어요. 처음부터 다시 진행해주세요.')
      return
    }
    if (!password || password.length < 8) {
      setError('비밀번호 정보가 없어요. 비밀번호 설정부터 다시 진행해주세요.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const { user } = await signupWithApi({
        email,
        password,
        name,
        campus: draft.campus,
        major: draft.major,
        age: draft.age,
        bio: draft.bio,
        interests: draft.interests,
      })
      applyServerUser(user, { password, setCurrent: true })
      // 가입 중 고른 프로필 사진 반영
      try {
        const avatar = sessionStorage.getItem('mh_signup_avatar')
        if (avatar) {
          updateProfile(email, { avatarImage: avatar })
          sessionStorage.removeItem('mh_signup_avatar')
        }
      } catch {
        // ignore
      }
      clearDraft()
      navigate('/')
    } catch (err) {
      // Offline fallback keeps local demo usable if API is down
      const message = err instanceof Error ? err.message : '회원가입에 실패했어요.'
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        let avatar = ''
        try {
          avatar = sessionStorage.getItem('mh_signup_avatar') ?? ''
        } catch {
          // ignore
        }
        signUp({
          email,
          password,
          name,
          campus: draft.campus,
          major: draft.major,
          age: draft.age,
          bio: draft.bio,
          interests: draft.interests,
        })
        if (avatar) updateProfile(email, { avatarImage: avatar })
        try {
          sessionStorage.removeItem('mh_signup_avatar')
        } catch {
          // ignore
        }
        clearDraft()
        navigate('/')
        return
      }
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-[24px] pt-[140px]">
      <img src={locateBtn} alt="" className="size-[80px]" />

      <div className="h-[28px]" />

      <p className="text-center text-[24px] font-bold text-[var(--heading)]">
        내 주변 펀딩을 찾으려면
        <br />
        위치 권한이 필요해요
      </p>

      <div className="h-[12px]" />

      <p className="text-center text-[15px] text-[var(--label)]">
        1km 반경의 모임을 지도에서 보여주고
        <br />
        모집이 임박하면 알림을 보내드려요
      </p>

      {error && <p className="mt-[16px] text-center text-[13px] font-medium text-[var(--red)]">{error}</p>}

      <div className="flex-1" />

      <button
        type="button"
        onClick={finish}
        disabled={submitting}
        className="mb-[16px] flex h-[52px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)] disabled:opacity-40"
      >
        <span className="text-[16px] font-medium text-[var(--on-primary)]">
          {submitting ? '가입 처리 중...' : '위치 권한 허용하기'}
        </span>
      </button>

      <button
        type="button"
        onClick={finish}
        disabled={submitting}
        className="mb-[40px] text-[13px] text-[var(--border)] disabled:opacity-40"
      >
        나중에 할게요
      </button>
    </div>
  )
}
