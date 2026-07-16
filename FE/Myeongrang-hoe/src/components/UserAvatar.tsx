import avatarPlaceholder from '../assets/profilesetup/avatar-placeholder.svg'
import type { UserRecord } from '../store/schema'

type Props = {
  user?: Pick<UserRecord, 'name' | 'avatarImage'> | null
  /** 이메일만 있을 때 이름 이니셜용 */
  name?: string
  avatarImage?: string | null
  size?: number
  className?: string
  alt?: string
}

/**
 * 프로필 사진이 있으면 표시, 없으면 이니셜 또는 기본 플레이스홀더.
 */
export default function UserAvatar({
  user,
  name,
  avatarImage,
  size = 30,
  className = '',
  alt = '',
}: Props) {
  const img = (avatarImage ?? user?.avatarImage)?.trim()
  const label = (name ?? user?.name ?? '').trim()
  const initial = label ? label.charAt(0) : '?'

  if (img) {
    return (
      <img
        src={img}
        alt={alt || label || '프로필'}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--hairline)] ${className}`}
      style={{ width: size, height: size }}
      aria-label={alt || label || '프로필'}
    >
      {label ? (
        <span
          className="font-bold text-[var(--primary-deep)]"
          style={{ fontSize: Math.max(10, size * 0.38) }}
        >
          {initial}
        </span>
      ) : (
        <img src={avatarPlaceholder} alt="" className="size-full object-cover opacity-80" />
      )}
    </div>
  )
}
