import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyServerUser, loginWithPassword } from '../../store/actions'
import { loginWithApi, sendVerificationCode, setAccessToken, verifyEmailCode } from '../../lib/api'
import { showToast } from '../../store/ui'
import { patchDraft } from '../../store/signupDraft'

type Mode = 'login' | 'signup'

const SCHOOL_EMAIL_RE = /^[A-Za-z0-9._%+\-]+@([A-Za-z0-9-]+\.)+ac\.kr$/i

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const [signupEmail, setSignupEmail] = useState('')
  const [code, setCode] = useState('')
  const [signupError, setSignupError] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [verifying, setVerifying] = useState(false)

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) {
      setLoginError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    setLoginError('')
    setLoggingIn(true)
    try {
      const { user } = await loginWithApi(normalizedEmail, password)
      applyServerUser(user, { password, setCurrent: true })
      showToast('로그인했어요', 'success')
      navigate('/')
    } catch (error) {
      // Fallback: local seed accounts when backend is offline
      if (loginWithPassword(normalizedEmail, password)) {
        setAccessToken(null)
        showToast('오프라인 모드로 로그인했어요', 'info')
        navigate('/')
        return
      }
      setLoginError(error instanceof Error ? error.message : '로그인에 실패했어요.')
    } finally {
      setLoggingIn(false)
    }
  }

  function isSchoolEmail(value: string) {
    return SCHOOL_EMAIL_RE.test(value.trim())
  }

  async function handleSendCode() {
    const normalizedEmail = signupEmail.trim().toLowerCase()
    if (!normalizedEmail) {
      setSignupError('학교 이메일을 입력해주세요.')
      return
    }
    if (!isSchoolEmail(normalizedEmail)) {
      setSignupError('학교 이메일 형식만 사용할 수 있어요. 예: example@mju.ac.kr')
      return
    }

    setSignupError('')
    setVerificationMessage('')
    setSendingCode(true)

    try {
      const result = await sendVerificationCode(normalizedEmail)
      const detail = result.code ? ` 테스트 모드에서는 인증번호 ${result.code} 를 입력할 수 있어요.` : ''
      setVerificationMessage(`${result.message}${detail}`)
    } catch (error) {
      setSignupError(error instanceof Error ? error.message : '인증번호 전송에 실패했어요.')
    } finally {
      setSendingCode(false)
    }
  }

  async function handleVerify() {
    const normalizedEmail = signupEmail.trim().toLowerCase()
    if (!normalizedEmail || !isSchoolEmail(normalizedEmail)) {
      setSignupError('학교 이메일 형식만 사용할 수 있어요. 예: example@mju.ac.kr')
      return
    }
    if (!code.trim()) {
      setSignupError('인증번호를 입력해주세요.')
      return
    }

    setSignupError('')
    setVerifying(true)

    try {
      await verifyEmailCode(normalizedEmail, code.trim())
      patchDraft({ email: normalizedEmail })
      navigate('/signup/password')
    } catch (error) {
      setSignupError(error instanceof Error ? error.message : '인증에 실패했어요.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white px-[24px] pt-[80px] pb-[40px]">
      <p className="text-[28px] font-bold text-[var(--heading)]">명랑회</p>
      <p className="text-[16px] text-[var(--label)]">학교 이메일로 안전하게 시작해보세요</p>

      <div className="h-[32px]" />

      <div className="flex w-full rounded-[4px] bg-[var(--hairline)] p-[4px]">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 rounded-[4px] py-[10px] text-[14px] font-bold ${
            mode === 'login' ? 'bg-white text-[var(--heading)] shadow-[0px_1px_4px_rgba(0,0,0,0.12)]' : 'text-[var(--border)]'
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 rounded-[4px] py-[10px] text-[14px] font-bold ${
            mode === 'signup' ? 'bg-white text-[var(--heading)] shadow-[0px_1px_4px_rgba(0,0,0,0.12)]' : 'text-[var(--border)]'
          }`}
        >
          회원가입
        </button>
      </div>

      <div className="h-[32px]" />

      {mode === 'login' ? (
        <>
          <p className="text-[14px] font-bold text-[var(--heading)]">학교 이메일</p>
          <div className="h-[8px]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mju.ac.kr"
            className="w-full border-b border-[var(--hairline)] py-[14px] text-[16px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
          />

          <div className="h-[28px]" />

          <p className="text-[14px] font-bold text-[var(--heading)]">비밀번호</p>
          <div className="h-[8px]" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PassWord"
            className="w-full border-b border-[var(--hairline)] py-[14px] text-[16px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
          />
          {loginError && <p className="pt-[8px] text-[12px] font-medium text-[var(--red)]">{loginError}</p>}

          <div className="h-[32px]" />

          <button
            type="button"
            onClick={handleLogin}
            disabled={loggingIn}
            className="flex h-[52px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)] disabled:opacity-40"
          >
            <span className="text-[16px] font-medium text-[var(--on-primary)]">
              {loggingIn ? '로그인 중...' : '로그인'}
            </span>
          </button>

          <div className="h-[16px]" />

          <p className="text-center text-[12px] text-[var(--border)]">
            처음이신가요?{' '}
            <button type="button" onClick={() => setMode('signup')} className="font-bold text-[var(--primary-deep)]">
              회원가입하기
            </button>
          </p>
        </>
      ) : (
        <>
          <p className="text-[14px] font-bold text-[var(--heading)]">학교 이메일</p>
          <div className="h-[8px]" />
          <div className="flex w-full items-center gap-[8px]">
            <input
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="example@mju.ac.kr"
              className="flex-1 border-b border-[var(--hairline)] py-[14px] text-[16px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sendingCode || !isSchoolEmail(signupEmail)}
              className="shrink-0 rounded-[4px] border border-[var(--border)] px-[12px] py-[10px] text-[13px] font-medium text-[var(--heading)] disabled:opacity-40"
            >
              {sendingCode ? '전송 중...' : '인증번호 받기'}
            </button>
          </div>

          <div className="h-[28px]" />

          {verificationMessage && <p className="text-[12px] font-medium text-[var(--primary-deep)]">{verificationMessage}</p>}

          <div className="h-[12px]" />

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
              onClick={handleVerify}
              disabled={verifying}
              className="shrink-0 rounded-[4px] border border-[var(--border)] px-[12px] py-[10px] text-[13px] font-medium text-[var(--heading)] disabled:opacity-40"
            >
              {verifying ? '확인 중...' : '확인'}
            </button>
          </div>
          <p className="pt-[6px] text-[11px] text-[var(--border)]">
            인증번호 받기 버튼으로 발송된 숫자를 입력한 뒤 확인해주세요.
          </p>
          {signupError && <p className="pt-[6px] text-[12px] font-medium text-[var(--red)]">{signupError}</p>}

          <div className="h-[32px]" />

          <button
            type="button"
            disabled={verifying || !signupEmail.trim() || !isSchoolEmail(signupEmail) || !code.trim()}
            onClick={handleVerify}
            className="flex h-[52px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)] disabled:opacity-40"
          >
            <span className="text-[16px] font-medium text-[var(--on-primary)]">
              {verifying ? '확인 중...' : '인증하고 시작하기'}
            </span>
          </button>

          <div className="h-[16px]" />

          <p className="text-center text-[12px] text-[var(--border)]">
            명지대학교 이메일(@mju.ac.kr)로만 가입할 수 있어요
          </p>
        </>
      )}
    </div>
  )
}