# 프론트 기반 백엔드 기능 로드맵

프론트엔드 화면·스토어를 기준으로 백엔드 필요 기능을 정리한 문서입니다.  
상태: ✅ 완료 · 🔌 BE 있음/FE 연동 필요 · ❌ 미구현 · 🖥️ FE 로컬 유지 가능

---

## 1. 인증·회원

| # | 기능 | FE | BE | 상태 |
|---|------|----|----|------|
| A1 | 학교 메일 OTP 발송/검증 | Login | `/api/auth/send-verification-code`, `verify-code` | ✅ |
| A2 | 회원가입 | Signup 플로우 | `/api/auth/signup` | ✅ |
| A3 | 로그인 + 토큰 | Login | `/api/auth/login` → `accessToken` | ✅ |
| A4 | 이메일 중복 확인 | Login | `/api/auth/check-email` | ✅ |
| A5 | 내 프로필 조회/수정 | MyPage, ProfileSetup | `GET/PATCH /api/users/me` | ✅ |
| A6 | 공개 프로필(이름 등) | 참여자 표시 | `GET /api/users/profile?email=` | ✅ |
| A7 | 마지막 위치 저장 | Home | `PATCH /api/users/me/location` | ✅ |
| A8 | SMTP 실제 메일 | Login | env + `/api/mail/status` | ✅ (자격증명 시) |

---

## 2. 펀딩 (PRD 핵심)

| # | 기능 | FE | BE | 상태 |
|---|------|----|----|------|
| F1 | 목록 / 주변 조회 | Home, FundingList | `GET /api/fundings?lat&lng` | ✅ |
| F2 | 상세 | FundingTab | `GET /api/fundings/{id}` | ✅ |
| F3 | 생성 | FundingForm | `POST /api/fundings` | ✅ |
| F4 | 수정 | FundingForm edit | `PUT /api/fundings/{id}` | ✅ |
| F5 | 참여 | FundingTab | `POST .../join` | ✅ |
| F6 | 참여 취소 | FundingTab | `POST .../leave` | ✅ |
| F7 | 호스트 모집 확정 | FundingTab | `POST .../confirm` | ✅ |
| F8 | 목표 인원 성사·인원 카운트 | 전역 | 참여 시 `matched` / `currentCount` | ✅ |
| F9 | 노쇼 리스크(규칙) | Funding 카드 | 생성 시 `aiRisk` | ✅ |
| F10 | 성사 임박 넛지 문구 | Home/알림 | `GET .../nudge` (+ 클라이언트 알림) | ✅ |

---

## 3. 커뮤니티

| # | 기능 | FE | BE | 상태 |
|---|------|----|----|------|
| C1 | 댓글 목록/작성 | FundingTab | `GET/POST .../comments` | ✅ |
| C2 | 채팅 목록(참여 펀딩) | ChatList | 펀딩 목록 필터 | ✅ FE |
| C3 | 채팅 메시지 | ChatRoom | `GET/POST .../chat` + 폴링 | ✅ |
| C4 | 후기 작성·햇살지수 | ReviewForm | `POST .../reviews` | ✅ |
| C5 | 받은 후기 | MyPage | `GET /api/users/reviews?email=` | ✅ |
| C6 | 펀딩별 후기 목록 | FundingTab 동기화 | `GET .../reviews` | ✅ |
| C7 | 찜 토글/목록 | FundingTab, MyPage | `POST .../wishlist`, me.wishlist | ✅ |

---

## 4. 알림·기타

| # | 기능 | FE | BE | 상태 |
|---|------|----|----|------|
| N1 | 알림 피드 | Notifications | 서버 데이터 기반 **클라이언트 계산** | ✅ |
| N2 | 읽음 처리 | markNotificationsSeen | `PATCH /api/users/me` (`notificationsSeenAt`) | ✅ |
| M1 | 카카오맵 | Home 등 | FE only | ✅ |
| M2 | Claude 실시간 AI | PRD | 규칙 기반 대체 중 | 후순위 |

---

## 5. 구현 순서 (이번 작업)

1. BE 보완: 위치, 공개 프로필, 펀딩 후기 목록  
2. FE `api.ts` 전 엔드포인트  
3. `actions.ts` + 주요 화면 서버 연동  
4. 검증 후 커밋·push  

완료 후 화면에서 로그인 → 홈 동기화 → 생성/참여/댓글/채팅/후기/찜이 서버에 남으면 1차 완료입니다.
