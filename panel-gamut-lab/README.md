# Panel Gamut Lab

RGB xy 입력 → Display P3 / BT.2020 커버리지. 독립 실행, 외부 라이브러리·API·네트워크 요청 없음.

## 실행
- `index.html`을 브라우저에서 열면 바로 작동합니다.
- 또는 Node.js에서 `node server.cjs` 실행 후 http://127.0.0.1:8765 를 엽니다.
- 테스트: `node test.cjs` (Node 18+).

## Node.js 프런트엔드에 통합
`gamut-math.js`, `locus.js`, `gamut-ui.js` 순서로 로드하고 `style.css`를 포함합니다. 각 파일은 vanilla JS이며 React/Vue 등 특정 프레임워크를 가정하지 않습니다. CSS의 body 규칙은 전체 앱 스타일에 맞게 제거 가능합니다.

```js
const widget = GamutSimulator.mount(document.querySelector('#target'), {
  primaries: { R:[.68,.32], G:[.265,.69], B:[.15,.06] }
});
widget.setPrimaries({R:[.68,.32],G:[.265,.69],B:[.15,.06]});
const result = widget.getResult(); // invalid input: null
// target.addEventListener('gamutchange', e => console.log(e.detail));
widget.destroy(); // unmount 시 이벤트 정리
```

계산 엔진만 재사용:
```js
const G = require('./gamut-math.js');
const result = G.calculate({R:[.68,.32],G:[.265,.69],B:[.15,.06]}, 'xy');
// result.p3.coverage와 result.bt2020.coverage: 0~1
// ratio: panel area/reference area, 100%를 넘을 수 있음
```

FastAPI가 이미 있다면 측정 xy 데이터를 프런트엔드로 전달하여 `setPrimaries`에 넣으면 됩니다. 이 계산에는 FastAPI 추가 엔드포인트가 필요하지 않습니다. 서버 검증이 필요하면 같은 수식을 서버에 구현하고 테스트 기준값을 공유하십시오. 이 패키지는 기존 서비스에 자동 접속하거나 변경하지 않습니다.

## 정의와 한계
- 기본 CIE 1931 xy. 선택적으로 CIE 1976 u′v′에서 면적 계산.
- coverage = area(panel ∩ reference)/area(reference). 백분율 표시. 단순 삼각형 면적비가 아닙니다.
- P3 기준은 Display P3 (D65). 시네마 DCI-P3와 동일한 RGB 원색이므로 2D 삼각형 커버리지는 동일합니다. 백색점과 전달함수 차이는 이 면적 계산에 영향을 주지 않습니다.
- Display P3의 sRGB 전달함수는 색공간 정의의 일부이며 별도 비교 대상이 아닙니다. 화면 비교 대상은 P3, BT.2020뿐입니다.
- 백색점 D65는 기준 표시이며 패널 실측 백색점이 아닙니다. RGB 입력만으로 백색점·감마 적합성, ΔE, HDR 색체적을 검증하지 않습니다.
- 입력 검증: 유한 숫자, x≥0, y>0, x+y≤1, 비퇴화 삼각형. 스펙트럼 궤적 안의 물리적 실현 가능성까지 보증하지 않습니다. 비물리적 좌표도 위 조건을 만족하면 계산될 수 있습니다.
- 그래프 궤적은 원본의 교육용 근사 표이며 계산 결과는 해당 궤적에 의존하지 않습니다. 화면 색상은 구분용입니다.
- 프리셋은 표준 좌표이며 측정값이 아닙니다. 소수점 둘째 자리 표시는 입력/측정 정확도를 의미하지 않습니다.

## 출처/라이선스
ATTRIBUTION.md, LICENSE-MIT, LICENSE-UPSTREAM.md 참고. 원본 전체 사이트가 아니라 필요한 수학 함수와 궤적 데이터만 분리·수정했습니다.
