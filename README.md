# 나는 어떤 바이브코더일까?

바이브코딩 1기 1~3주차 내용을 20문제로 복습하는 심리테스트형 퀴즈입니다.
한 화면에 한 문제씩 풀고, 마지막에 점수와 주차별 이해도에 따라 5가지 유형 중 하나가 나옵니다.

## 구성
- `index.html` 한 파일로 동작 (빌드 과정 없음)
- 문제 데이터는 `index.html` 안의 `const Q = [...]` 에 있음
- 결과 유형 문구는 `const TYPES = {...}` 에서 수정

## 배포
Vercel에서 이 저장소를 Import 하면 설정 없이 바로 배포됩니다.
(Framework Preset: Other, Build Command 비움, Output Directory 비움)
