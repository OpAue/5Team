#  명랑회 (Myeongrang-hoe)

> **사람이 모여야 시작되는 모임, AI가 성사시키는 대학생 크라우드펀딩 플랫폼**

<div align="center">

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Claude](https://img.shields.io/badge/Claude_API-D97757?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)


** 2026 명지톤 **

*"연결을 넘어, 유대로"*

AI 기반 대학 간 교류 플랫폼

</div>

---

#  프로젝트 소개

**동행 펀딩**은 **크라우드펀딩의 개념을 대학생 모임 모집에 적용한 AI 기반 플랫폼**입니다.

텀블벅에서 목표 금액이 달성되어야 프로젝트가 시작되듯,

동행 펀딩에서는 **목표 인원이 모여야 모임이 성사됩니다.**

단순한 모집 게시판이 아니라,

AI가 모임의 성사율을 높이고,
참여자의 신뢰도를 분석하며,
후기를 서비스의 자산으로 축적하여

**인문캠퍼스와 자연캠퍼스 학생들의 지속적인 교류를 만드는 것**이 목표입니다.

---

#  Why?

많은 대학생들은

* 🍽️ 맛집을 가고 싶지만 같이 갈 사람이 없다.
* 👥 모임을 만들기에는 부담스럽다.
* ❌ 모집 인원이 부족해 모임이 취소된다.
* 🏫 같은 학교지만 다른 캠퍼스 학생을 만날 기회가 거의 없다.

동행 펀딩은

> **"사람이 부족해서 시작하지 못하는 경험"**

을 해결합니다.

---

#  핵심 아이디어

## 기존 모임 플랫폼

```text
모임 생성
      ↓
사람 모집
      ↓
모이지 않으면 실패
```

---

## 동행 펀딩

```text
모임 생성
      ↓
목표 인원 설정
      ↓
AI가 성사율 향상
      ↓
목표 인원 달성
      ↓
자동 모임 성사
      ↓
후기 축적
      ↓
다음 모임의 신뢰도 증가
```

---

#  서비스 플로우

```text
학교 이메일 로그인
        │
        ▼
현재 위치 허용
        │
        ▼
주변 펀딩 조회
        │
        ▼
펀딩 참여
        │
        ▼
목표 인원 달성
        │
        ▼
자동 채팅방 생성
        │
        ▼
모임 진행
        │
        ▼
후기 작성
        │
        ▼
AI 후기 요약
        │
        ▼
햇살지수 업데이트
```

---

#  AI Features

##  1. 성사 임박 알림 (AI Nudge)

목표 인원이 거의 모였을 때

Claude가 상황에 맞는 독려 메시지를 생성합니다.

예시

> 🍽️
> 딱 한 명만 더 모이면 오늘 저녁 바로 출발할 수 있어요!

단순한 Push가 아니라

상황을 이해한 AI 메시지를 생성합니다.

---

## 🌳 2. 햇살지수 (Sunlight Index)

동행 펀딩만의 AI 신뢰도 시스템입니다.

사용자의 활동을 분석하여

신뢰도를 나무 성장 형태로 표현합니다.

| 햇살지수   | 단계      |
| ------ | ------- |
| 0~30   | 🌱 새싹   |
| 31~60  | 🌿 묘목   |
| 61~90  | 🌳 나무   |
| 91~100 | 🌲 큰 나무 |

### 분석 요소

* 모임 성사 횟수
* 노쇼 여부
* 후기 평가
* 약속 시간 준수
* 신고 내역
* 후기 체크리스트

---

##  3. 노쇼 리스크 분석

Claude가

* 글의 구체성
* 장소
* 시간
* 작성자 이력
* 취소 이력
* 후기

등을 분석하여

```text
신뢰도 높음

또는

노쇼 위험 높음
```

과 같이 안내합니다.

---

# 📍 위치 기반 서비스

Geolocation API를 이용하여

현재 위치를 기반으로

주변 펀딩을 추천합니다.

### 제공 기능

* 📍 현재 위치 확인
* 🗺 주변 펀딩 표시
* 🍽 주변 맛집 펀딩 조회
* 📌 약속 장소 표시
* 📲 클릭 시 해당 펀딩 페이지 이동

---

#  주요 기능

### 👨‍🎓 학교 이메일 인증

* 명지대학교 이메일 로그인
* 학교 구성원만 이용 가능
* 안전한 커뮤니티 형성

---

### 🍽 펀딩 생성

* 제목
* 장소
* 날짜
* 시간
* 모집 인원
* 설명
* 사진

---

### 👥 목표 인원 시스템

```text
목표 4명

현재 3명

↓

모집 중
```

↓

```text
목표 4명

현재 4명

↓

자동 성사
```

---

### 💬 채팅방 자동 생성

목표 인원이 달성되면

자동으로

참여자 채팅방이 생성됩니다.

---

###  후기 시스템

모든 참여자가

후기를 작성합니다.

체크리스트 방식

✅ 친절했어요

✅ 시간 약속을 잘 지켰어요

✅ 분위기를 잘 만들어줬어요

✅ 다시 함께하고 싶어요

---

# 🏫 캠퍼스 간 교류

동행 펀딩은

인문캠퍼스와 자연캠퍼스 학생들의

생활권을 연결합니다.

예를 들어

자연캠 학생이 올린 맛집 펀딩에

인문캠 학생이 참여하면서

자연스럽게

새로운 지역과 사람을 경험하게 됩니다.

즉,

> **교류를 권장하는 것이 아니라,
> 모임 성사를 위해 자연스럽게 교류가 일어나는 구조입니다.**

---

# 🛠 Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

---

## Backend

* NestJS
* REST API

---

## Database

* Supabase (PostgreSQL)

---

## Authentication

* 학교 이메일 OTP 인증

---

## AI

* Claude API

---

## Map

* Kakao Maps API
* Geolocation API

---

## Deployment

* Vercel

---

# 📂 프로젝트 구조

```text
donghaeng-funding

├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
│
├── backend/
│   ├── src/
│   ├── auth/
│   ├── funding/
│   ├── review/
│   ├── ai/
│   └── location/
│
└── README.md
```

---

# 🎯 MVP

* [x] 학교 이메일 로그인
* [x] 펀딩 CRUD
* [x] 목표 인원 달성 시스템
* [x] 참여 기능
* [x] 채팅방 생성
* [x] AI 넛지 메시지
* [x] 햇살지수
* [x] 후기 작성
* [x] AI 후기 요약
* [x] 위치 기반 펀딩 조회

---

#  Future Work

* AI 기반 관심사 매칭
* 일정 추천
* 성사율 예측
* 교류 통계
* 리워드 시스템
* 학교 간 서비스 확장

---

# 👥 Team

**2026 명지톤 AI 융합 해커톤**

**Team 동행 펀딩**

> **연결을 넘어, 유대로**

AI를 통해 사람을 연결하고,

모임을 성사시키며,

대학생들의 새로운 인연을 만들어갑니다.

---

<div align="center">

### 🌱 사람이 모여야 시작되는 모임

**DongHaeng Funding**

*"Where People Complete the Funding."*

</div>
