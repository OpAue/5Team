import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HostDetailSheet from '../../components/HostDetailSheet'
import BackButton from '../../components/BackButton'
import shareBtn from '../../assets/fundingtab/share-btn.svg'
import avatarPro from '../../assets/fundingtab/avatar-pro.svg'
import participantAvatar from '../../assets/fundingtab/participant-avatar.svg'
import chatNoteIcon from '../../assets/fundingtab/chat-note-icon.svg'
import aiIcon from '../../assets/fundingtab/ai-icon.svg'
import infoIcon from '../../assets/fundingtab/info-icon.svg'

const infoRows = [
  { label: '일시', value: '7/14(화) 19:00' },
  { label: '장소', value: '본관 학생라운지' },
  { label: '모집인원', value: '20명' },
  { label: '참가비', value: '5,000원' },
]

export default function FundingTab() {
  const navigate = useNavigate()
  const [showHostDetail, setShowHostDetail] = useState(false)

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 shrink-0 bg-white">
        <div className="h-[26px]" />
        <div className="relative flex h-[60px] items-center px-[17px]">
          <BackButton onClick={() => navigate(-1)} />
          <img src={shareBtn} alt="공유" className="absolute right-[17px] size-[39px]" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="relative h-[236px] overflow-hidden" style={{ backgroundImage: 'linear-gradient(149.6deg, #72abfa 0%, #2777e7 71.4%)' }}>
          <span className="absolute bottom-[18px] left-[17px] rounded-full bg-white px-[13px] py-[5px] text-[12px] font-bold text-[var(--red)]">
            인기 펀딩
          </span>
        </div>

        <div className="flex flex-col gap-[4px] px-[17px] pt-[21px] pb-[4px]">
          <p className="text-[30px] font-bold text-[var(--heading)]">인문 x 자연 보드게임 밤</p>

          <button
            type="button"
            onClick={() => setShowHostDetail(true)}
            className="flex w-full items-center justify-between border-t border-b border-[var(--hairline)] py-[15px]"
          >
            <div className="flex items-center gap-[11px]">
              <img src={avatarPro} alt="" className="size-[47px]" />
              <div className="flex flex-col items-start gap-[2px]">
                <div className="flex items-center gap-[6px]">
                  <p className="text-[16px] font-bold text-[var(--heading)]">이명지</p>
                  <span className="rounded-[12px] bg-[var(--primary-tint)] px-[9px] py-[2px] text-[11px] font-bold text-[var(--primary-deep)]">
                    나무 단계
                  </span>
                </div>
                <p className="text-[13px] text-[var(--label)]">개최자 · 후기 9개</p>
              </div>
            </div>
            <span className="text-[17px] font-bold text-[var(--border)]">›</span>
          </button>

          <div className="h-[13px]" />

          <div className="flex w-full flex-col gap-[13px] rounded-[4px] border border-[var(--border-card)] p-[17px] shadow-[0px_4px_13px_rgba(0,0,0,0.08)]">
            <div className="flex w-full items-center justify-between">
              <p className="text-[17px] font-bold text-[var(--heading)]">14명 참여 / 목표 20명</p>
              <p className="text-[13px] text-[var(--red)]">마감 D-3</p>
            </div>
            <div className="h-[9px] w-full overflow-hidden rounded-full bg-[var(--hairline)]">
              <div className="h-full w-[70%] rounded-full bg-[var(--primary-deep)]" />
            </div>
            <div className="flex items-center">
              {[0, 1, 2, 3].map((i) => (
                <img
                  key={i}
                  src={participantAvatar}
                  alt=""
                  className="-mr-[9px] size-[30px]"
                />
              ))}
              <div className="flex size-[30px] items-center justify-center rounded-full border-2 border-white bg-[#303441]">
                <span className="text-[11px] font-bold text-white">+10</span>
              </div>
            </div>
            <div className="flex items-center gap-[6px]">
              <img src={chatNoteIcon} alt="" className="size-[15px]" />
              <p className="text-[13px] text-[var(--label)]">
                목표 인원 달성 시 자동으로 채팅방이 생성돼요
              </p>
            </div>
          </div>

          <div className="h-[4px]" />

          <div className="flex w-full items-start gap-[11px] rounded-[4px] bg-[var(--blue-tint)] p-[15px]">
            <img src={aiIcon} alt="" className="size-[19px] shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <p className="text-[14px] font-bold text-[var(--blue-deep)]">
                AI 노쇼 리스크 분석 · 신뢰도 높음
              </p>
              <p className="text-[13px] text-[var(--label)]">
                작성자의 이전 성사 이력, 후기 평가, 글의 구체성을 분석한 결과입니다. 안심하고 참여해도 좋아요.
              </p>
            </div>
          </div>

          <div className="my-[4px] h-[1px] w-full bg-[var(--hairline)]" />

          <p className="text-[21px] font-bold text-[var(--heading)]">펀딩 소개</p>
          <p className="text-[17px] text-[var(--ink)]">
            인문캠퍼스와 자연캠퍼스 학생들이 함께 모여 보드게임을 즐기며 자연스럽게 교류하는 자리입니다. 처음 만나는 분들도 편하게 즐길 수 있도록 진행자가 함께합니다.
          </p>

          <div className="my-[4px] h-[1px] w-full bg-[var(--hairline)]" />

          {infoRows.map((row, i) => (
            <div
              key={row.label}
              className={`flex w-full items-center justify-between py-[13px] ${
                i < infoRows.length - 1 ? 'border-b border-[var(--hairline)]' : ''
              }`}
            >
              <div className="flex items-center gap-[9px]">
                <img src={infoIcon} alt="" className="size-[17px]" />
                <p className="text-[15px] text-[var(--label)]">{row.label}</p>
              </div>
              <p className="text-[15px] font-bold text-[var(--heading)]">{row.value}</p>
            </div>
          ))}
        </div>
      </main>

      <div className="flex shrink-0 items-center border-t border-[var(--hairline)] px-[17px] py-[13px]">
        <button
          type="button"
          className="flex h-[56px] flex-1 items-center justify-center rounded-[4px] bg-[var(--primary)]"
        >
          <span className="text-[17px] font-medium text-[var(--on-primary)]">펀딩 참여하기</span>
        </button>
      </div>

      {showHostDetail && <HostDetailSheet onClose={() => setShowHostDetail(false)} />}
    </div>
  )
}
