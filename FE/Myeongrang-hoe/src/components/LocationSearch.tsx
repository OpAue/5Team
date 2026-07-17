import { useState } from 'react'
import { useKakao } from '../lib/kakao'
import { CAMPUS_CENTER } from '../store/schema'

export interface SelectedPlace {
  name: string
  address: string
  lat: number
  lng: number
}

export default function LocationSearch({
  value,
  onSelect,
}: {
  value: SelectedPlace | null
  onSelect: (place: SelectedPlace | null) => void
}) {
  const [kakaoLoading, kakaoError] = useKakao()
  const [query, setQuery] = useState('')
  const [manualName, setManualName] = useState('')
  const [manualAddress, setManualAddress] = useState('')
  const [results, setResults] = useState<kakao.maps.services.PlacesSearchResult>([])
  const [searched, setSearched] = useState(false)

  function handleSearch() {
    const keyword = query.trim()
    if (!keyword || kakaoLoading || kakaoError) return

    const places = new kakao.maps.services.Places()
    places.keywordSearch(
      keyword,
      (data, status) => {
        setSearched(true)
        if (status === kakao.maps.services.Status.OK) {
          setResults(data)
        } else {
          setResults([])
        }
      },
      {
        location: new kakao.maps.LatLng(CAMPUS_CENTER.lat, CAMPUS_CENTER.lng),
        sort: kakao.maps.services.SortBy.DISTANCE,
      },
    )
  }

  function handlePick(item: kakao.maps.services.PlacesSearchResultItem) {
    onSelect({
      name: item.place_name,
      address: item.road_address_name || item.address_name,
      lat: Number(item.y),
      lng: Number(item.x),
    })
    setResults([])
    setSearched(false)
    setQuery('')
  }

  function handleManualSelect() {
    const name = manualName.trim()
    if (!name) return

    onSelect({
      name,
      address: manualAddress.trim() || name,
      lat: CAMPUS_CENTER.lat,
      lng: CAMPUS_CENTER.lng,
    })
    setManualName('')
    setManualAddress('')
    setResults([])
    setSearched(false)
  }

  return (
    <div className="mt-[8px] w-full">
      {value ? (
        <div className="flex items-center justify-between gap-[8px] rounded-[4px] border border-[var(--border-card)] bg-[var(--hairline)] px-[13px] py-[11px]">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-[14px] font-bold text-[var(--heading)]">{value.name}</p>
            <p className="truncate text-[12px] text-[var(--label)]">{value.address}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="shrink-0 text-[12px] font-bold text-[var(--primary-deep)]"
          >
            변경
          </button>
        </div>
      ) : (
        <>
          {kakaoError ? (
            <div className="flex flex-col gap-[8px] rounded-[4px] border border-[var(--border-card)] bg-[var(--hairline)] p-[13px]">
              <p className="text-[12px] font-medium text-[var(--label)]">
                카카오맵을 불러오지 못해 장소를 직접 입력합니다.
              </p>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSelect()}
                placeholder="장소 이름"
                className="w-full rounded-[4px] border border-[var(--border-card)] bg-white px-[12px] py-[10px] text-[14px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
              />
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSelect()}
                placeholder="주소 또는 만날 위치 설명"
                className="w-full rounded-[4px] border border-[var(--border-card)] bg-white px-[12px] py-[10px] text-[14px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleManualSelect}
                disabled={!manualName.trim()}
                className="h-[40px] rounded-[4px] bg-[var(--primary-deep)] text-[13px] font-bold text-white disabled:opacity-40"
              >
                이 장소로 설정
              </button>
              <p className="text-[11px] text-[var(--border)]">
                지도 좌표는 테스트용으로 명지대 인문캠퍼스 기준으로 저장됩니다.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-[8px]">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={
                  kakaoLoading ? '지도를 불러오는 중...' : '장소, 건물명, 지번으로 검색해보세요'
                }
                disabled={kakaoLoading}
                className="w-full flex-1 border-b border-[var(--hairline)] py-[10px] text-[15px] text-[var(--heading)] placeholder:text-[var(--border)] focus:outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={kakaoLoading}
                className="shrink-0 rounded-[4px] border border-[var(--border)] px-[12px] py-[10px] text-[13px] font-medium text-[var(--heading)] disabled:opacity-40"
              >
                검색
              </button>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-[8px] flex max-h-[220px] flex-col overflow-y-auto rounded-[4px] border border-[var(--border-card)]">
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handlePick(r)}
                  className="flex flex-col items-start gap-[2px] border-b border-[var(--hairline)] px-[13px] py-[10px] text-left last:border-b-0"
                >
                  <p className="text-[14px] font-bold text-[var(--heading)]">{r.place_name}</p>
                  <p className="text-[12px] text-[var(--label)]">
                    {r.road_address_name || r.address_name}
                  </p>
                </button>
              ))}
            </div>
          )}

          {searched && results.length === 0 && (
            <p className="mt-[8px] text-[12px] text-[var(--border)]">검색 결과가 없어요</p>
          )}
        </>
      )}
    </div>
  )
}
