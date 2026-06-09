# 트루뷰티 (TrueBeauty)

대학교 UI/UX 과제용 모바일 퍼스트 뷰티 리뷰 큐레이션 프로토타입입니다. HTML, CSS, 바닐라 JavaScript만 사용했으며 npm이나 빌드 도구가 없습니다.

## 실행 방법

1. `truebeauty` 폴더에서 `index.html`을 브라우저로 엽니다.
2. 로고 이미지를 교체할 경우 `images/logo-placeholder.svg`를 같은 비율의 파일로 바꾸고, `index.html`의 `img` 경로를 유지하거나 수정합니다.

## 폴더 구조

```
truebeauty/
├── index.html
├── style.css
├── script.js
├── public/
│   └── logo.png
├── images/
├── data/
│   └── products.js
└── README.md
```

스플래시·헤더 로고는 `public/logo.png`를 사용합니다. 교체 시 같은 경로에 파일을 두면 됩니다.

## 데이터 수정

제품·리뷰 목업은 `data/products.js`의 `window.TrueBeautyData` 객체를 편집하면 됩니다.

## 브라우저 호환

로컬 파일로 열 때도 동작하도록 ES 모듈 대신 전역 데이터 스크립트를 사용했습니다. Pretendard 폰트는 CDN을 사용합니다(오프라인 시 시스템 폰트로 대체).
