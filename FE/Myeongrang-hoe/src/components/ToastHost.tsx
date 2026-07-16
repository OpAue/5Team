import { useSyncExternalStore } from 'react'
import { dismissToast, getUiState, subscribeUi } from '../store/ui'
import LoadingScreen from './LoadingScreen'

export default function ToastHost() {
  const ui = useSyncExternalStore(subscribeUi, getUiState, getUiState)

  return (
    <>
      {ui.globalLoading && (
        <LoadingScreen message={ui.loadingMessage || '잠시만 기다려 주세요'} fullScreen />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-[88px] z-[210] flex flex-col items-center gap-[8px] px-[16px]">
        {ui.toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => dismissToast(t.id)}
            className={`pointer-events-auto max-w-[370px] rounded-[8px] px-[14px] py-[11px] text-left text-[13px] font-medium shadow-lg ${
              t.kind === 'error'
                ? 'bg-[#c62828] text-white'
                : t.kind === 'success'
                  ? 'bg-[var(--primary-deep)] text-white'
                  : 'bg-[var(--heading)] text-white'
            }`}
          >
            {t.message}
          </button>
        ))}
      </div>
    </>
  )
}
