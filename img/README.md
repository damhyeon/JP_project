이미지를 이 폴더에 넣고, script.js의 `IMAGES` 배열에 슬러그를 추가하면 카드에 표시됩니다.

## 규격

| 항목 | 값 |
|---|---|
| 경로 | `img/<slug>.webp` |
| 형식 | WebP (jpg/png도 동작하지만 webp 권장) |
| 크기 | 400 x 400 px (카드 실제 표시 약 160~225px, 2x retina 대비) |
| 배경 | 투명 PNG/WebP 권장. 불투명하면 라벨 가독성이 떨어집니다 |
| 크롭 | 정사각형 중앙 기준. `object-fit:cover` 로裁되므로 중앙에 피사체 배치 |
| 권장 용량 | 카드당 15KB 이하 (41장 합계 600KB 이내) |

## 슬러그 목록 (영문 소문자, 공백은 하이픈)

해산물
```
shrimp  crab  abalone  squid  salmon-roe  salmon  mackerel  tuna
```
육류
```
beef  pork  lamb  chicken  duck
```
곡류
```
wheat  buckwheat  barley  rice  brown-rice  corn  sesame
```
견과 및 콩류
```
almond  peanut  walnut  cashew  soybean  pea
```
과일
```
apple  pear  strawberry  grape  peach  kiwi  orange  banana
```
유제품 및 계란
```
milk  cheese  yogurt  butter  cream  egg  mayonnaise
```

## 활성화 방법

`script.js`:
```js
const IMAGES = ['shrimp','crab'];   // 추가한 슬러그만 나열
```

`IMAGES`에 없는 카드는 이모지 그대로 표시됩니다. 목록에 올려놓은 파일이
실제로 없으면 이모지로 자동 대체되므로, 404 에러가 발생하지 않습니다.

## 디자인 주의

- 카드 하단 1/3에 검은 그라데이션(라벨 영역)이 씌워집니다. 이미지 하단부는
  어두운 톤이나 단순한 배색이 유리합니다.
- 카드 모서리는 20px_radius 로 잘립니다. 가장자리에 피사체를 붙이지 마세요.
- 알레르기 판정용 이미지이므로 **음식 색이 실제와 다르면 오해를 부릅니다.**
  예: 오리 고기는 빨간 고기, 게는 주황.
