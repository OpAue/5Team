import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../../components/BackButton'
import { useDB } from '../../store/db'
import {
  getCurrentUser,
  markNotificationsSeen,
  syncFundingsFromServer,
  syncMeFromServer,
} from '../../store/actions'
import { computeNotifications } from '../../store/notifications'
import { CAMPUS_CENTER } from '../../store/schema'

function timeAgo(ts: number): string {
  const diffMin = Math.floor((Date.now() - ts) / 60000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  return `${Math.floor(diffHour / 24)}일 전`
}

export default function Notifications() {
  const navigate = useNavigate()
  useDB()
  const me = getCurrentUser()
  const notifications = me ? computeNotifications(me.email) : []
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      await syncMeFromServer()
      await syncFundingsFromServer({
        lat: CAMPUS_CENTER.lat,
        lng: CAMPUS_CENTER.lng,
        radiusKm: 50,
      })
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (me && !loading) markNotificationsSeen(me.email)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.email, loading])

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 shrink-0 bg-white">
        <div className="h-[26px]" />
        <div className="flex h-[60px] items-center gap-[12px] border-b border-[var(--hairline)] px-[17px]">
          <BackButton onClick={() => navigate(-1)} />
          <p className="text-[21px] font-bold text-[var(--heading)]">알림</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {loading && notifications.length === 0 && (
          <p className="py-[40px] text-center text-[14px] text-[var(--border)]">불러오는 중...</p>
        )}

        {!loading && notifications.length === 0 && (
          <p className="py-[40px] text-center text-[14px] text-[var(--border)]">
            아직 알림이 없어요
          </p>
        )}

        {notifications.map((n) => (
          <Link
            key={n.id}
            to={n.to}
            className={`flex w-full items-start gap-[13px] border-b border-[var(--hairline)] px-[17px] py-[17px] ${
              n.kind === 'wishlist-almost' ? 'bg-[var(--primary-tint)]/40' : ''
            }`}
          >
            <img src={n.icon} alt="" className="size-[21px] shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
              <div className="flex items-center gap-[6px]">
                <p className="truncate text-[15px] font-bold text-[var(--heading)]">{n.title}</p>
                {n.kind === 'wishlist-almost' && (
                  <span className="shrink-0 rounded-full bg-[var(--red)] px-[6px] py-[1px] text-[10px] font-bold text-white">
                    찜
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[var(--label)]">{n.body}</p>
              <p className="text-[12px] text-[var(--border)]">{timeAgo(n.createdAt)}</p>
            </div>
          </Link>
        ))}
      </main>
    </div>
  )
}
