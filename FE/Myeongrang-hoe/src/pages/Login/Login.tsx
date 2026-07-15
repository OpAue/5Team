import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isEmailTaken, loginAsTestAccount, loginWithPassword } from '../../store/actions'
import { TEST_ACCOUNTS } from '../../store/schema'
import { patchDraft } from '../../store/signupDraft'

type Mode = 'login' | 'signup'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [signupEmail, setSignupEmail] = useState('')
  const [code, setCode] = useState('')
  const [signupError, setSignupError] = useState('')

  function handleLogin() {
    if (loginWithPassword(email, password)) {
      navigate('/')
    } else {
      setLoginError('이메일 또는 비밀번호가 올바르지 않아요. 테스트 계정 버튼을 이용해보세요.')
    }
  }

  function handleTestLogin(key: keyof typeof TEST_ACCOUNTS) {
    loginAsTestAccount(TEST_ACCOUNTS[key])
    navigate('/')
  }

  function handleVerify() {
    if (isEmailTaken(signupEmail)) {
      setSignupError('이미 가입된 이메일이에요. 로그인 탭을 이용해주세요.')
      return
    }
    setSignupError('')
    patchDraft({ email: signupEmail })
    navigate('/signup/password')
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
          <p className="text-[13px] font-bold text-[var(--label)]">
            테스트 계정 2개로 서로 참여·채팅·후기를 주고받을 수 있어요
          </p>
          <div className="h-[10px]" />
          <div className="flex w-full gap-[8px]">
            <button
              type="button"
              onClick={() => handleTestLogin('test1')}
              className="flex flex-1 flex-col items-start gap-[2px] rounded-[4px] border border-dashed border-[var(--primary-deep)] bg-[var(--primary-tint)] px-[13px] py-[12px] text-left"
            >
              <span className="text-[13px] font-bold text-[var(--primary-deep)]">김명지 (test1)</span>
              <span className="text-[11px] text-[var(--label)]">인문캠퍼스</span>
            </button>
            <button
              type="button"
              onClick={() => handleTestLogin('test2')}
              className="flex flex-1 flex-col items-start gap-[2px] rounded-[4px] border border-dashed border-[var(--blue-deep)] bg-[var(--blue-tint)] px-[13px] py-[12px] text-left"
            >
              <span className="text-[13px] font-bold text-[var(--blue-deep)]">이자연 (test2)</span>
              <span className="text-[11px] text-[var(--label)]">자연캠퍼스</span>
            </button>
          </div>

          <div className="h-[24px]" />

          <div className="flex w-full items-center gap-[10px]">
            <div className="h-[1px] flex-1 bg-[var(--hairline)]" />
            <span className="text-[12px] text-[var(--border)]">또는 직접 로그인</span>
            <div className="h-[1px] flex-1 bg-[var(--hairline)]" />
          </div>

          <div className="h-[24px]" />

          <p className="text-[14px] font-bold text-[var(--heading)]">학교 이메일</p>
          <div className="h-[8px]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test1@mju.ac.kr"
            className="w-full border-b border-[var(--hairline)] py-[14px] text-[16px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
          />

          <div className="h-[28px]" />

          <p className="text-[14px] font-bold text-[var(--heading)]">비밀번호</p>
          <div className="h-[8px]" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="test1234"
            className="w-full border-b border-[var(--hairline)] py-[14px] text-[16px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
          />
          {loginError && <p className="pt-[8px] text-[12px] font-medium text-[var(--red)]">{loginError}</p>}

          <div className="h-[32px]" />

          <button
            type="button"
            onClick={handleLogin}
            className="flex h-[52px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)]"
          >
            <span className="text-[16px] font-medium text-[var(--on-primary)]">로그인</span>
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
          <p className="pt-[6px] text-[11px] text-[var(--border)]">
            데모에서는 아무 6자리 숫자나 입력하고 다음으로 진행할 수 있어요
          </p>
          {signupError && <p className="pt-[6px] text-[12px] font-medium text-[var(--red)]">{signupError}</p>}

          <div className="h-[32px]" />

          <button
            type="button"
            disabled={!signupEmail.includes('@')}
            onClick={handleVerify}
            className="flex h-[52px] w-full items-center justify-center rounded-[4px] bg-[var(--primary)] disabled:opacity-40"
          >
            <span className="text-[16px] font-medium text-[var(--on-primary)]">인증하고 시작하기</span>
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
