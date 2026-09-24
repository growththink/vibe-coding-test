# 나는 어떤 바이브코더일까?

바이브코딩 1기 1~3주차 내용을 20문제로 복습하는 심리테스트형 퀴즈입니다.
한 화면에 한 문제씩 풀고, 마지막에 점수와 주차별 이해도에 따라 5가지 유형 중 하나가 나옵니다.

## 구성
- `index.html` : 퀴즈 화면 (빌드 과정 없음). 문제를 풀기 전에 이름/닉네임(필수)과 한 줄 자기소개(선택)를 입력받고, 결과 화면에 이름을 붙여서 보여줍니다.
- 문제 데이터는 `index.html` 안의 `const Q = [...]` 에 있음
- 결과 유형 문구는 `const TYPES = {...}` 에서 수정
- `api/submit.js`, `api/results.js` : 제출 결과를 Vercel Blob(private)에 저장/조회하는 서버리스 함수
- `admin.html` : 제출 결과를 모아 보는 관리자 페이지 (`/admin.html`)

## 관리자 페이지
`/admin.html` 에 접속해 비밀번호를 입력하면 전체 제출 현황(이름, 자기소개, 점수, 유형, 제출 시각)을 확인하고 CSV로 내려받을 수 있습니다.
비밀번호는 Vercel 프로젝트의 `ADMIN_PASSWORD` 환경 변수 값입니다.

## 배포
Vercel에서 이 저장소를 Import 하면 설정 없이 바로 배포됩니다.
(Framework Preset: Other, Build Command 비움, Output Directory 비움)
`index.html`과 `admin.html`은 정적 파일로 서빙되고, `api/*.js`는 Node 서버리스 함수로 배포됩니다.
Vercel 프로젝트에 `BLOB_READ_WRITE_TOKEN`(Vercel Blob 연결 시 자동 생성)과 `ADMIN_PASSWORD` 환경 변수가 설정되어 있어야 합니다.
