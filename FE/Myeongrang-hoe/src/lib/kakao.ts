import { useKakaoLoader } from 'react-kakao-maps-sdk'

/**
 * 앱 전체에서 동일한 옵션으로 Kakao Maps SDK를 로드한다.
 * react-kakao-maps-sdk의 Loader는 싱글턴이라, 여러 곳에서 다른 옵션으로 호출하면
 * 먼저 마운트된 컴포넌트의 옵션만 적용되므로 반드시 이 훅을 통해서만 로드해야 한다.
 */
export function useKakao() {
  return useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    libraries: ['services'],
  })
}
