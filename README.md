<div align="center">

# Coco Shopping Mall

**사용자 후기 중심의 뷰티 쇼핑몰 플랫폼**

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![Oracle](https://img.shields.io/badge/Oracle-Database-red.svg)](https://www.oracle.com/database/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 피부 타입 기반 상품 추천과 사용자 후기를 통한 스마트한 쇼핑 경험

[프로젝트 소개](#프로젝트-소개) • [주요 기능](#주요-기능) • [기술 스택](#기술-스택) • [시작하기](#시작하기) • [프로젝트 구조](#프로젝트-구조) • [보안](#보안)

</div>

---

## 프로젝트 소개

**Coco**는 사용자 후기와 피부 프로필을 기반으로 한 뷰티 쇼핑몰 플랫폼입니다. 단순한 상품 판매를 넘어서, 사용자들이 작성한 리뷰와 피부 타입 정보를 활용하여 더 나은 구매 결정을 할 수 있도록 돕는 것이 목표입니다.

### 핵심 특징

- **피부 타입 기반 추천**: 사용자의 피부 프로필을 분석하여 맞춤 상품 추천
- **리뷰 중심 쇼핑**: 다른 사용자들의 상세 리뷰를 통한 구매 결정 지원
- **Comate 시스템**: 유사한 피부 타입의 사용자들을 팔로우하고 리뷰 공유
- **다양한 인증 방식**: 일반 회원가입 및 소셜 로그인 (카카오, 네이버, 구글)
- **관리자 대시보드**: 상품, 주문, 회원 관리 통합 관리

---

## 주요 기능

### 회원 관리
- 일반 회원가입 및 로그인
- 소셜 로그인 (카카오, 네이버, 구글)
- JWT 토큰 기반 인증
- 아이디/비밀번호 찾기 (이메일 인증)
- 회원 정보 수정 및 프로필 관리

### 상품 관리
- 상품 목록 조회 (검색, 필터링, 정렬)
- 상품 상세 정보
- 카테고리별 상품 분류
- 피부 타입/고민/퍼스널 컬러 태그 기반 필터링
- 관리자 상품 등록/수정/삭제

### 주문 및 결제
- 장바구니 기능
- 주문 생성 및 관리
- 포인트 적립 및 사용
- 주문 내역 조회 및 취소

### 리뷰 시스템
- 상품 리뷰 작성 (텍스트, 이미지, 태그)
- 리뷰 수정 및 삭제
- 별점 평가
- 리뷰 좋아요 기능
- 유사 피부 타입 리뷰 필터링

### Comate (피부 프로필 기반 소셜)
- 피부 프로필 등록 (피부 타입, 퍼스널 컬러 등)
- 유사 피부 타입 사용자 추천
- 다른 사용자 팔로우/언팔로우
- Comate의 리뷰 및 좋아요한 리뷰 조회
- 피부 타입 기반 상품/리뷰/사용자 추천

### 관리자 기능
- 대시보드 통계
- 상품 관리 (등록, 수정, 삭제)
- 카테고리 관리
- 회원 관리 및 포인트 수정
- 주문 관리 및 상태 변경

---

## 기술 스택

### Backend

| 기술 | 버전 | 용도 |
|------|------|------|
| **Java** | 21 | 프로그래밍 언어 |
| **Spring Boot** | 3.5.7 | 웹 애플리케이션 프레임워크 |
| **Spring Security** | - | 인증 및 권한 관리 |
| **Spring Data JPA** | - | 데이터베이스 접근 계층 |
| **JWT (jjwt)** | 0.12.3 | 토큰 기반 인증 |
| **Oracle Database** | - | 관계형 데이터베이스 |
| **Gradle** | - | 빌드 도구 |
| **Spring Mail** | - | 이메일 인증 |

### Frontend

| 기술 | 버전 | 용도 |
|------|------|------|
| **React** | 19.2.0 | UI 라이브러리 |
| **React Router** | 7.9.5 | 클라이언트 사이드 라우팅 |
| **Styled Components** | 6.1.19 | CSS-in-JS 스타일링 |
| **Axios** | 1.13.2 | HTTP 클라이언트 |
| **React Toastify** | 11.0.5 | 알림 메시지 |
| **React Slick** | 0.31.0 | 캐러셀 컴포넌트 |

---

## 프로젝트 구조

```
Shoppingmall-coco/
├── shoppingmall-back/              # Spring Boot 백엔드
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/shoppingmallcoco/project/
│   │   │   │       ├── controller/        # REST API 컨트롤러
│   │   │   │       │   ├── MemberController.java
│   │   │   │       │   ├── ProductApiController.java
│   │   │   │       │   ├── OrderController.java
│   │   │   │       │   ├── ReviewController.java
│   │   │   │       │   ├── ComateController.java
│   │   │   │       │   └── admin/        # 관리자 컨트롤러
│   │   │   │       ├── service/          # 비즈니스 로직
│   │   │   │       ├── repository/       # 데이터 접근 계층
│   │   │   │       ├── entity/           # JPA 엔티티
│   │   │   │       ├── dto/              # 데이터 전송 객체
│   │   │   │       ├── util/             # 유틸리티 (JWT)
│   │   │   │       ├── filter/           # 필터 (JWT 인증)
│   │   │   │       └── config/           # 설정 클래스
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── *.sql                 # SQL 스크립트
│   │   └── test/
│   ├── build.gradle
│   └── settings.gradle
│
└── shoppingmall-front/             # React 프론트엔드
    ├── public/
    └── src/
        ├── components/             # 재사용 가능한 컴포넌트
        │   ├── admin/              # 관리자 페이지 컴포넌트
        │   ├── product/            # 상품 관련 컴포넌트
        │   ├── Header.js
        │   ├── Footer.js
        │   └── ProtectedRoute.js
        ├── pages/                  # 페이지 컴포넌트
        │   ├── admin/              # 관리자 페이지
        │   ├── product/            # 상품 페이지
        │   ├── Home.js
        │   ├── Login.js
        │   └── ...
        ├── features/               # 커스텀 훅 및 기능
        ├── hooks/                  # React 커스텀 훅
        ├── styles/                 # Styled Components 테마
        ├── utils/                  # 유틸리티 함수
        ├── css/                    # CSS 스타일 파일
        ├── App.js                  # 메인 앱 컴포넌트
        └── index.js                # 진입점
```

---

## 시작하기

### 필수 요구사항

- **JDK 21** 이상
- **Node.js** 16.x 이상
- **Oracle Database** 11g 이상 (또는 호환 데이터베이스)
- **Gradle** 7.x 이상
- **npm** 또는 **yarn**

### 설치 및 실행

#### 1. 저장소 클론

```bash
git clone https://github.com/your-username/Shoppingmall-coco.git
cd Shoppingmall-coco
```

#### 2. 백엔드 설정

```bash
cd shoppingmall-back
```

**application.properties 설정**

```properties
# Database
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:xe
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

# JWT
jwt.secret=YOUR_SECRET_KEY
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:3000

# File Upload
file.upload-dir=/path/to/upload/directory/

# Email (선택사항)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL
spring.mail.password=YOUR_PASSWORD
```

**백엔드 실행**

```bash
./gradlew bootRun
# 또는
./gradlew build
java -jar build/libs/shoppingmall-back-0.0.1-SNAPSHOT.war
```

백엔드는 기본적으로 `http://localhost:8080`에서 실행됩니다.

#### 3. 프론트엔드 설정

```bash
cd shoppingmall-front
```

**패키지 설치**

```bash
npm install
```

**프론트엔드 실행**

```bash
npm start
```

프론트엔드는 기본적으로 `http://localhost:3000`에서 실행됩니다.

### 데이터베이스 설정

프로젝트에 포함된 SQL 스크립트를 실행하여 테이블을 생성하세요:

```bash
# Oracle Database에 연결하여 실행
@shoppingmall-back/src/main/resources/create_all_tables.sql
@shoppingmall-back/src/main/resources/create_comate_tables.sql
```

---

## 보안

프로젝트는 다음과 같은 보안 기능을 구현하고 있습니다:

- **JWT 토큰 기반 인증**: Stateless 인증 방식
- **Spring Security**: 엔드포인트별 권한 관리
- **SQL Injection 방지**: JPA 파라미터 바인딩
- **입력 검증**: 컨트롤러 레벨 검증
- **파일 업로드 보안**: 파일 타입 및 크기 검증
- **리소스 소유권 검증**: 사용자별 데이터 접근 제어
- **CORS 설정**: 명시적 오리진 허용

자세한 보안 점검 보고서는 [API_SECURITY_AUDIT_REPORT.md](shoppingmall-back/API_SECURITY_AUDIT_REPORT.md)를 참고하세요.

**보안 점수**: 82.5/100

---

## 주요 API 엔드포인트

### 인증
- `POST /api/member/signup` - 회원가입
- `POST /api/member/login` - 로그인
- `POST /api/member/kakao/login` - 카카오 로그인
- `POST /api/member/naver/login` - 네이버 로그인
- `POST /api/member/google/login` - 구글 로그인

### 상품
- `GET /api/products` - 상품 목록 조회
- `GET /api/products/{prdNo}` - 상품 상세 조회
- `GET /api/products/{prdNo}/similar-skin-tags` - 유사 피부 타입 통계 (인증 필요)

### 주문
- `POST /api/orders` - 주문 생성 (인증 필요)
- `GET /api/orders/my` - 내 주문 내역 (인증 필요)
- `GET /api/orders/{orderNo}` - 주문 상세 조회 (인증 필요)

### 리뷰
- `GET /api/products/{productNo}/reviews` - 리뷰 목록
- `POST /api/reviews` - 리뷰 작성 (인증 필요)
- `PUT /api/reviews/{reviewNo}` - 리뷰 수정 (인증 필요)
- `DELETE /api/reviews/{reviewNo}` - 리뷰 삭제 (인증 필요)

### Comate
- `GET /api/comate/user/{memNo}` - 사용자 프로필 조회
- `GET /api/comate/recommend` - 추천 콘텐츠 조회
- `POST /api/comate/follow/{targetMemNo}` - 팔로우 (인증 필요)

자세한 API 문서는 코드 내 주석을 참고하세요.

---

## 프로젝트 목표

이 프로젝트는 다음 목표를 달성하기 위해 개발되었습니다:

1. **실전 프로젝트 경험**: Spring Boot와 React를 활용한 풀스택 개발 경험
2. **협업 능력 향상**: Git을 활용한 팀 협업 및 코드 리뷰
3. **보안 인식 강화**: OWASP 기준을 준수한 보안 구현
4. **사용자 경험 개선**: 피부 프로필 기반 맞춤 추천 서비스

---

## 팀원

이 프로젝트는 **K-Digital Training Java 풀스택 개발자 아카데미 6회차** 최종 프로젝트로, 6명의 팀원이 협업하여 개발했습니다.

### 역할 분담
- 회원/로그인/인증 시스템
- 상품 관리 시스템
- 주문 및 결제 시스템
- 리뷰 시스템
- Comate (피부 프로필 기반 소셜) 시스템
- 관리자 대시보드
- 프론트엔드 UI/UX

---

## 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

---

## 감사의 말

- [K-Digital Training](https://www.k-digital.or.kr/) - 교육 기회 제공
- [Spring Boot](https://spring.io/projects/spring-boot) - 강력한 백엔드 프레임워크
- [React](https://reactjs.org/) - 유연한 프론트엔드 라이브러리

---

## 문의

프로젝트에 대한 문의사항이나 제안사항이 있으시면 이슈를 등록해주세요.

---

<div align="center">

**Made with by Coco Team**

[Back to Top](#coco-shopping-mall)

</div>

