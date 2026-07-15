import { useNavigate } from 'react-router-dom'
import locateBtn from '../../assets/home/locate-btn.svg'
import { signUp } from '../../store/actions'
import { clearDraft, getDraft } from '../../store/signupDraft'

export default function LocationPermission() {
  const navigate = useNavigate()

  function finish() {
    const draft = getDraft()
    signUp({
      email: draft.email || `guest${Date.now()}@mju.ac.kr`,
      password: draft.password || 'password',
      name: draft.name || '새 학생',
      campus: draft.campus,
      major: draft.major,
      age: draft.age,
      bio: draft.bio,
      interests: draft.interests,
    })
    clearDraft()
    navigate('/')
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

      <div className="flex-1" />

      <button
        type="button"
        onClick={finish}
        className="mb-[16px] flex h-[52px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)]"
      >
        <span className="text-[16px] font-medium text-[var(--on-primary)]">위치 권한 허용하기</span>
      </button>

      <button
        type="button"
        onClick={finish}
        className="mb-[40px] text-[13px] text-[var(--border)]"
      >
        나중에 할게요
      </button>
    </div>
  )
}
