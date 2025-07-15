# SeaNavigator - GPS 기반 기상 예측 및 재난 경고 시스템

SeaNavigator는 항해 중인 선박을 위한 실시간 기상 정보 및 재난 경고 서비스를 제공하는 모바일 애플리케이션입니다. 3D 지구본 시각화와 AI 기반 기상 예측을 통해 안전한 항해를 지원합니다.

![SeaNavigator Logo](./assets/logo.png)

## 주요 기능

### 1. GPS 기반 실시간 고공 기상 예측

- 사용자의 현재 GPS 위치 기반 실시간 기상 데이터 제공
- 기온, 풍향, 풍속(난기류 포함), 구름 밀도, 강수 형태(비, 눈, 우박 등), 대기압 정보 제공
- 국내외 다양한 기상 API 활용하여 정확한 데이터 제공

### 2. 3D 시각화

- Three.js를 활용한 고품질 3D 지구본 시각화
- 실시간으로 전 세계 날씨 정보를 지구본에 표시
- GPS 기반으로 현재 배의 위치를 지구본 상에 시각적으로 표시
- 직관적인 UI로 사용자 경험 최적화

### 3. AI 기반 장기 고공 기상 예측

- 머신러닝 모델을 활용한 장기 기상 예측 정보 제공
- 육상 관측소 및 자체 탐사 데이터 융합 분석
- 정확도 높은 장기 기상 패턴 분석

### 4. 공중 재난 경고

- 태풍, 토네이도 등 위험 기상 현상 실시간 모니터링
- AI 기반 위험 분석으로 예상 경로, 예상 강도, 도달 시간 예측
- 긴급 상황 시 즉각적인 알림 제공

### 5. 오프라인 모드 지원

- 제한적인 공중 통신 환경을 고려한 오프라인 캐싱 시스템
- 한 번 수신된 기상 데이터는 일정 시간 동안 오프라인 상태에서도 열람 가능
- 통신 가능/지상 기지국 연결 시점에 데이터 자동 업데이트

### 6. 항해 추천 경로

- 출발지와 목적지 입력 시 AI 기반 최적 항해 경로 추천
- 기상 조건, 해류, 위험 요소를 고려한 안전 경로 제안
- 실시간 경로 재조정 기능

## 기술 스택

- **프레임워크**: React Native / Expo
- **언어**: TypeScript
- **3D 시각화**: Three.js, @react-three/fiber, @react-three/drei
- **위치 서비스**: Expo Location, React Native Maps
- **데이터 저장**: Expo SQLite (오프라인 캐싱용)
- **상태 관리**: React Context API
- **UI 컴포넌트**: React Native Paper
- **날씨 API**: OpenWeatherMap, Weatherstack, 기상청 API 등

## 설치 방법

1. 저장소 클론

```bash
git clone https://github.com/yourusername/SeaNavigator.git
cd SeaNavigator
```

2. 의존성 패키지 설치

```bash
npm install
```

3. 애플리케이션 실행

```bash
# iOS 시뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android

# 웹에서 실행
npm run web
```

## API 키 설정

기상 데이터 API를 사용하기 위한 API 키 설정이 필요합니다:

1. 프로젝트 루트 폴더에 `.env` 파일 생성
2. 다음 형식으로 API 키 추가:

```
OPENWEATHER_API_KEY=your_api_key_here
WEATHERSTACK_API_KEY=your_api_key_here
```

## 개발 로드맵

- [x] 프로젝트 초기 설정
- [x] 기본 UI 구현
- [x] 3D 지구본 시각화 구현
- [x] GPS 위치 추적 기능 구현
- [x] 날씨 API 연동
- [x] 오프라인 캐싱 구현
- [x] 네비게이션 및 화면 구성
- [ ] 환경 변수 및 API 키 관리
- [ ] AI 기반 예측 모델 통합
- [ ] 재난 경고 시스템 구현
- [ ] 항해 경로 추천 기능 구현
- [ ] 다국어 지원 추가
- [ ] UI/UX 개선 및 최적화
- [ ] 베타 테스트 및 피드백 수집
- [ ] 최종 출시 및 지속적 개선

## 라이센스

MIT License

## 연락처

질문이나 피드백이 있으시면 이슈를 등록하거나 다음 이메일로 연락주세요: your.email@example.com
