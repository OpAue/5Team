import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import HostDetailSheet from '../../components/HostDetailSheet'
import BackButton from '../../components/BackButton'
import { useDB } from '../../store/db'
import {
  addComment,
  commentsOf,
  confirmFunding,
  currentCountOf,
  getCurrentUser,
  getFunding,
  getUser,
  isExpired,
  isHost,
  isMatched,
  isParticipant,
  isWishlisted,
  joinFunding,
  toggleWishlist,
} from '../../store/actions'
import { useKakao } from '../../lib/kakao'
import shareBtn from '../../assets/fundingtab/share-btn.svg'
import avatarPro from '../../assets/fundingtab/avatar-pro.svg'
import participantAvatar from '../../assets/fundingtab/participant-avatar.svg'
import chatNoteIcon from '../../assets/fundingtab/chat-note-icon.svg'
import aiIcon from '../../assets/fundingtab/ai-icon.svg'
import infoIcon from '../../assets/fundingtab/info-icon.svg'
import { sunlightTier } from '../../lib/sunlight'

const riskCopy: Record<string, { label: string; body: string }> = {
  낮음: {
    label: 'AI 노쇼 리스크 분석 · 신뢰도 높음',
    body: '작성자의 이전 성사 이력, 후기 평가, 글의 구체성을 분석한 결과입니다. 안심하고 참여해도 좋아요.',
  },
  중간: {
    label: 'AI 노쇼 리스크 분석 · 신뢰도 보통',
    body: '작성자의 활동 이력이 아직 많지 않아요. 참여 전 댓글로 일정을 한 번 더 확인해보세요.',
  },
  높음: {
    label: 'AI 노쇼 리스크 분석 · 주의',
    body: '과거 노쇼·취소 이력이 있는 모임이에요. 신중하게 참여를 결정해주세요.',
  },
}

export default function FundingTab() {
  const navigate = useNavigate()
  const { id } = useParams()
  useDB()
  const funding = getFunding(id)
  const me = getCurrentUser()
  const host = getUser(funding.hostEmail)
  const [kakaoLoading, kakaoError] = useKakao()

  const [showHostDetail, setShowHostDetail] = useState(false)
  const [draft, setDraft] = useState('')

  function handleAddComment() {
    const content = draft.trim()
    if (!content || !me) return
    addComment(funding.id, me.email, content)
    setDraft('')
  }

  function handleJoin() {
    if (!me || isMatched(funding) || isExpired(funding)) return
    joinFunding(funding.id, me.email)
  }

  function handleWishlist() {
    if (!me) return
    toggleWishlist(me.email, funding.id)
  }

  function handleConfirm() {
    confirmFunding(funding.id)
  }

  const current = currentCountOf(funding)
  const matched = isMatched(funding)
  const expired = isExpired(funding)
  const joined = !!me && isParticipant(funding, me.email)
  const progress = Math.round((current / funding.targetCount) * 100)
  const risk = riskCopy[funding.aiRisk]
  const wishlisted = !!me && isWishlisted(me.email, funding.id)
  const comments = commentsOf(funding.id)
  const iAmHost = !!me && isHost(funding, me.email)

  const infoRows = [
    { label: '일시', value: funding.meetTimeText },
    { label: '장소', value: funding.locationName },
    { label: '모집인원', value: `${funding.targetCount}명` },
    { label: '모집 마감', value: funding.deadlineText },
    { label: '참가비', value: funding.fee === 0 ? '무료' : `${funding.fee.toLocaleString()}원` },
  ]

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 shrink-0 bg-white">
        <div className="h-[26px]" />
        <div className="relative flex h-[60px] items-center px-[17px]">
          <BackButton onClick={() => navigate(-1)} />
          <div className="absolute right-[17px] flex items-center gap-[14px]">
            {iAmHost && (
              <Link to={`/funding/${funding.id}/edit`} className="text-[13px] font-bold text-[var(--primary-deep)]">
                수정
              </Link>
            )}
            <button type="button" onClick={handleWishlist} aria-label="찜하기">
              <span className={`text-[22px] ${wishlisted ? 'text-[var(--red)]' : 'text-[var(--border)]'}`}>
                {wishlisted ? '♥' : '♡'}
              </span>
            </button>
            <img src={shareBtn} alt="공유" className="size-[39px]" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div
          className="relative h-[236px] overflow-hidden"
          style={{ backgroundImage: 'linear-gradient(149.6deg, #72abfa 0%, #2777e7 71.4%)' }}
        >
          <span className="absolute bottom-[18px] left-[17px] rounded-full bg-white px-[13px] py-[5px] text-[12px] font-bold text-[var(--red)]">
            {funding.best ? '인기 펀딩' : funding.category}
          </span>
        </div>

        <div className="flex flex-col gap-[4px] px-[17px] pt-[21px] pb-[4px]">
          <p className="text-[30px] font-bold text-[var(--heading)]">{funding.title}</p>

          <button
            type="button"
            onClick={() => setShowHostDetail(true)}
            className="flex w-full items-center justify-between border-t border-b border-[var(--hairline)] py-[15px]"
          >
            <div className="flex items-center gap-[11px]">
              <img src={avatarPro} alt="" className="size-[47px]" />
              <div className="flex flex-col items-start gap-[2px]">
                <div className="flex items-center gap-[6px]">
                  <p className="text-[16px] font-bold text-[var(--heading)]">{host?.name}</p>
                  <span className="rounded-[12px] bg-[var(--primary-tint)] px-[9px] py-[2px] text-[11px] font-bold text-[var(--primary-deep)]">
                    {host ? sunlightTier(host.sunlightScore) : ''}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--label)]">개최자 · 참여 {host?.participationCount ?? 0}회</p>
              </div>
            </div>
            <span className="text-[17px] font-bold text-[var(--border)]">›</span>
          </button>

          <div className="h-[13px]" />

          <div className="flex w-full flex-col gap-[13px] rounded-[4px] border border-[var(--border-card)] p-[17px] shadow-[0px_4px_13px_rgba(0,0,0,0.08)]">
            <div className="flex w-full items-center justify-between">
              <p className="text-[17px] font-bold text-[var(--heading)]">
                {current}명 참여 / 목표 {funding.targetCount}명
              </p>
              <p className="text-[13px] text-[var(--red)]">
                {matched ? '모집 완료' : `마감 ${funding.deadlineText}`}
              </p>
            </div>
            <div className="h-[9px] w-full overflow-hidden rounded-full bg-[var(--hairline)]">
              <div
                className="h-full rounded-full bg-[var(--primary-deep)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center">
              {Array.from({ length: Math.min(4, current) }).map((_, i) => (
                <img key={i} src={participantAvatar} alt="" className="-mr-[9px] size-[30px]" />
              ))}
              {current > 4 && (
                <div className="flex size-[30px] items-center justify-center rounded-full border-2 border-white bg-[#303441]">
                  <span className="text-[11px] font-bold text-white">+{current - 4}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-[6px]">
              <img src={chatNoteIcon} alt="" className="size-[15px]" />
              <p className="text-[13px] text-[var(--label)]">
                {joined
                  ? '채팅방에 참여 중이에요'
                  : matched
                    ? '모집이 마감되어 더 이상 참여할 수 없어요'
                    : expired
                      ? '모집 기간이 지나 더 이상 참여할 수 없어요'
                      : '참여하면 바로 채팅방에 들어갈 수 있어요'}
              </p>
            </div>
            {iAmHost && !matched && current >= 2 && (
              <button
                type="button"
                onClick={handleConfirm}
                className="flex h-[40px] w-full items-center justify-center rounded-[4px] border border-[var(--primary-deep)] text-[14px] font-bold text-[var(--primary-deep)]"
              >
                이 인원({current}명)으로 확정하기
              </button>
            )}
          </div>

          <div className="h-[4px]" />

          <div className="flex w-full items-start gap-[11px] rounded-[4px] bg-[var(--blue-tint)] p-[15px]">
            <img src={aiIcon} alt="" className="size-[19px] shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <p className="text-[14px] font-bold text-[var(--blue-deep)]">{risk.label}</p>
              <p className="text-[13px] text-[var(--label)]">{risk.body}</p>
            </div>
          </div>

          <div className="my-[4px] h-[1px] w-full bg-[var(--hairline)]" />

          <p className="text-[21px] font-bold text-[var(--heading)]">펀딩 소개</p>
          <p className="text-[17px] text-[var(--ink)]">{funding.description}</p>

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

          <div className="mt-[13px] h-[160px] w-full overflow-hidden rounded-[4px] bg-[var(--hairline)]">
            {!kakaoLoading && !kakaoError && (
              <Map
                center={{ lat: funding.lat, lng: funding.lng }}
                level={4}
                scrollwheel={false}
                style={{ width: '100%', height: '100%' }}
              >
                <MapMarker position={{ lat: funding.lat, lng: funding.lng }} />
              </Map>
            )}
          </div>

          <div className="my-[4px] h-[1px] w-full bg-[var(--hairline)]" />

          <p className="text-[21px] font-bold text-[var(--heading)]">댓글 {comments.length}</p>
          <div className="flex flex-col gap-[15px] pt-[4px]">
            {comments.map((c) => {
              const author = getUser(c.authorEmail)
              return (
                <div
                  key={c.id}
                  className={`flex items-start gap-[9px] ${c.parentId ? 'ml-[28px]' : ''}`}
                >
                  <div className="size-[30px] shrink-0 rounded-full bg-[var(--hairline)]" />
                  <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                    <div className="flex items-center gap-[8px]">
                      <p className="text-[14px] font-bold text-[var(--heading)]">{author?.name ?? '알 수 없음'}</p>
                    </div>
                    <p className="text-[14px] text-[var(--ink)]">{c.content}</p>
                  </div>
                </div>
              )
            })}
            {comments.length === 0 && (
              <p className="text-[13px] text-[var(--border)]">아직 댓글이 없어요</p>
            )}
          </div>

          {joined ? (
            <div className="flex items-center gap-[8px] pt-[13px]">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="일정이나 장소를 참여자들과 공유해보세요"
                className="h-[40px] flex-1 rounded-full bg-[var(--hairline)] px-[16px] text-[14px] text-[var(--heading)] placeholder:text-[var(--label)] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddComment}
                className="shrink-0 rounded-[4px] border border-[var(--border-card)] px-[14px] py-[10px] text-[13px] font-bold text-[var(--heading)]"
              >
                등록
              </button>
            </div>
          ) : (
            <p className="pt-[13px] text-[12px] text-[var(--border)]">참여자만 댓글을 남길 수 있어요</p>
          )}
        </div>
      </main>

      <div className="flex shrink-0 items-center gap-[10px] border-t border-[var(--hairline)] px-[17px] py-[13px]">
        {joined ? (
          <>
            <button
              type="button"
              onClick={() => navigate(`/chat/${funding.id}`)}
              className="flex h-[56px] flex-1 items-center justify-center rounded-[4px] bg-[var(--primary)]"
            >
              <span className="text-[17px] font-medium text-[var(--on-primary)]">채팅방 입장하기</span>
            </button>
            {matched && (
              <button
                type="button"
                onClick={() => navigate(`/review/new/${funding.id}`)}
                className="flex h-[56px] flex-1 items-center justify-center rounded-[4px] border border-[var(--primary-deep)]"
              >
                <span className="text-[17px] font-medium text-[var(--primary-deep)]">후기 작성하기</span>
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={handleJoin}
            disabled={matched || expired}
            className="flex h-[56px] flex-1 items-center justify-center rounded-[4px] bg-[var(--primary)] disabled:opacity-40"
          >
            <span className="text-[17px] font-medium text-[var(--on-primary)]">
              {matched ? '모집이 마감됐어요' : expired ? '모집 기간이 지났어요' : '펀딩 참여하기'}
            </span>
          </button>
        )}
      </div>

      {showHostDetail && (
        <HostDetailSheet hostEmail={funding.hostEmail} onClose={() => setShowHostDetail(false)} />
      )}
    </div>
  )
}
