/**
 * TrueBeauty — 목업 제품·리뷰 데이터
 * file:// 환경 호환을 위해 전역 객체로 노출합니다.
 */
(function () {
  "use strict";

  window.TrueBeautyData = {
    categories: [
      { id: "skincare", label: "스킨케어" },
      { id: "makeup", label: "메이크업" },
      { id: "hair", label: "헤어" },
      { id: "body", label: "바디" },
    ],

    magazineArticles: [
      {
        id: "mag-today-controversy",
        tag: "논란 리포트",
        coverImage: "images/insight-controversy.png",
        skinTypes: ["민감성", "복합성", "지성", "건성"],
        excerptTemplate: "%SUMMARY% — 찬반 후기와 성분 이슈, 지금 확인해야 할 포인트만 골라 담았습니다.",
        titleTemplate: "오늘의 논란 제품 — %NAME%",
        paragraphs: [
          "「%NAME%」에 대한 관심이 커지면서 %SUMMARY%에 대한 의견이 엇갈리고 있습니다. 일부 후기에서는 자극·건조함이 언급되며 성분표를 다시 확인하자는 목소리가 있습니다.",
          "반면 피부 특성에 맞는 사용자에게는 산뜻한 사용감이 장점으로 꼽히기도 합니다. 최종 선택 전에는 소용량으로 테스트하고, 필요 시 패치 테스트를 병행하는 것을 권장합니다.",
        ],
      },
      {
        id: "mag-trust-sources",
        title: "화면 속 모든 정보에는 '출처'가 있습니다",
        excerpt:
          "트루뷰티 화면의 14개 요소는 3가지 출처에서 나옵니다. 광고가 아닌 '진짜 후기'에 기반해 신뢰를 만드는 방법을 매거진에서 정리했습니다.",
        tag: "신뢰 설계",
        skinTypes: ["민감성", "복합성", "지성", "건성", "수부지"],
        coverImage: "images/product-placeholder.svg",
        sections: [
          {
            heading: "출처가 분명하면, 믿을 수 있다",
            paragraphs: [
              "제품을 고를 때 우리는 수많은 숫자와 문장을 봅니다. 신뢰도, 만족도, 최저가, 키워드 요약까지 — 그런데 이 정보가 어디서 왔는지는 잘 보이지 않을 때가 많죠.",
              "트루뷰티는 '출처가 보이면 믿을 수 있다'는 원칙 위에 설계되었습니다. 화면에 보이는 14개 요소마다 데이터가 어디서 왔는지 추적할 수 있고, 광고가 아닌 진짜 후기에 기반해 신뢰를 쌓도록 구성했습니다.",
            ],
          },
          {
            heading: "정보는 어디서 오나 — 3가지 데이터 출처",
            paragraphs: [
              "트루뷰티의 정보는 크게 세 갈래로 나뉩니다. 성격이 다르기 때문에, 무엇이 실측이고 무엇이 시연용인지 구분하는 것이 첫걸음입니다.",
            ],
            list: [
              "① 실제 사용자 후기 — NLP 텍스트 분석으로 신뢰도·광고 의심·만족도, 장·단점 키워드 TOP3를 후기 문장에서 자동 산출합니다.",
              "② 제품·브랜드 데이터 — 제품 사진, 제품명, 브랜드, 신뢰 한줄평, 주의 문구 등 앱에 등록된 기본 정보를 그대로 표시합니다.",
              "③ 프로토타입 Mock — 판매처 가격, 최저가, 시세 추이 등 일부 분포 데이터는 시드 기반으로 생성되며, 항상 같은 값으로 일관되게 보여 줍니다. 'Mock' 라벨로 실제 후기가 아님을 명확히 안내합니다.",
            ],
          },
          {
            heading: "핵심 지표 '신뢰도'는 이렇게 계산됩니다",
            paragraphs: [
              "신뢰도 ≈ 100 − (광고 의심 × 0.42) − 반복·복붙 패널티",
              "이 점수는 제품 품질 점수가 아닙니다. '이 후기를 믿어도 될까?' — 진짜 후기처럼 보이는지를 측정하는 지표예요.",
              "광고 키워드(협찬·체험단·강추), 너무 짧은 글, 과장 표현이 많을수록 광고 의심이 올라가고 신뢰도는 내려갑니다. 같은 문장·단어가 반복되면 반복·복붙 패널티가 추가됩니다. 화면에 표시되는 %는 제품 후기 여러 개의 평균입니다.",
            ],
          },
          {
            heading: "광고 의심이란?",
            paragraphs: [
              "광고 의심은 후기가 '광고처럼' 보이는 정도를 뜻합니다. 협찬·체험단·강추 키워드, 28자 미만의 짧은 후기, 과장 표현과 반복 문구가 대표적인 신호입니다.",
              "수치가 높을수록 광고 후기일 가능성이 커지고, 낮을수록 진짜 경험담일 가능성이 높아집니다. 트루뷰티는 이 지표를 숨기지 않고 함께 보여 줍니다.",
            ],
          },
          {
            heading: "그래서 사용자가 얻는 가치 — 5가지",
            paragraphs: [
              "14개 화면 요소는 아래 다섯 가지 가치로 묶어 생각할 수 있습니다. 각 항목마다 원본 표의 출처 번호를 따라가면 화면과 데이터를 1:1로 연결할 수 있어요.",
            ],
            list: [
              "즉시 인지 — 제품 사진·제품명·브랜드로 어떤 제품인지 바로 파악합니다. (출처 1·2·14)",
              "신뢰 검증 — 신뢰도·광고 의심 지표와 광고 문구 vs 실후기 대조로 후기를 검증합니다. (출처 3·12·13)",
              "진짜 경험 — 5축 속성·만족도·키워드, 피부타입별 리뷰 분포로 실제 사용 경험을 확인합니다. (출처 7·8·9·10)",
              "나에게 맞춤 — 내 피부타입 기준 적합도와 타입별 맞춤 인사이트를 제공합니다. (출처 6·11)",
              "구매 이득 — 판매처별 최저가 비교와 시세 추이로 구매 타이밍을 판단합니다. (출처 4·5)",
            ],
          },
          {
            heading: "마무리",
            paragraphs: [
              "트루뷰티는 정보의 출처를 투명하게 보여 주는 앱입니다. 다음에 제품 상세를 볼 때, 숫자 옆의 출처 라벨과 Mock 표시를 한 번 확인해 보세요. 출처가 보이면, 그만큼 믿고 비교할 수 있습니다.",
            ],
          },
        ],
      },
      {
        id: "mag-1",
        title: "민감 피부를 위한 성분 체크리스트",
        excerpt: "자극 가능 성분을 빠르게 걸러내는 방법과 패치 테스트 팁.",
        skinTypes: ["민감성"],
        tag: "성분 해석",
        coverImage: "images/insight-mag-1-ingredients.png",
      },
      {
        id: "mag-2",
        title: "동일 라인 세럼 vs 크림, 무엇을 먼저?",
        excerpt: "텍스처와 배합 순서를 데이터 관점에서 비교했습니다.",
        skinTypes: ["복합성", "지성"],
        tag: "제품 비교",
        coverImage: "images/insight-mag-2-serum-cream.png",
      },
      {
        id: "mag-3",
        title: "건조 계절에 믿을 수 있는 보습 루틴",
        excerpt: "실제 사용자 경험에서 반복 언급된 보습 유지 포인트.",
        skinTypes: ["건성"],
        tag: "피부 타입별 추천",
        coverImage: "images/insight-mag-3-moisture.png",
      },
    ],

    products: [
      {
        id: "p1",
        name: "토리든 다이브인 저분자 히알루론산 세럼",
        category: "skincare",
        trueCertified: true,
        image: "images/products/p1-serum.png",
        priceLabel: "2만 원대",
        popularityScore: 97,
        controversyNote: "극건성·겨울 단독 사용 시 보습 한계",
        isControversialToday: true,
        trustHeadline:
          "5종 저분자 히알루론산·판테놀·세라마이드 복합 처방으로 속보습과 장벽 케어가 균형 잡혀 신뢰도가 높습니다.",
        trustWarning:
          "극건성·겨울철에는 단독 사용보다 크림·오일 레이어링을 권장합니다.",
        marketingClaims: [
          "5D 저분자 히알루론산 속층 보습",
          "48시간 지속 수분",
          "무향·무알코올 저자극 포뮬러",
        ],
        realUserThemes: {
          tagKeywords: ["산뜻한", "속건조"],
          positive: [
            "끈적임 없는 산뜻한 흡수",
            "속당김·속건조 완화",
            "레이어링·메이크업 전 부담 적음",
          ],
          negative: [
            "극건성·겨울 단독 사용 시 보습 부족",
            "건조한 실내에서 덧바름 필요",
          ],
          risks: ["히알루론산 단독 과다 시 일시적 당김(소수)"],
        },
        insightsBySkin: {
          지성: "가벼운 워터리 제형으로 유분 부담이 적다는 평이 많습니다.",
          건성: "촉촉함은 빠르지만 크림·오일과 레이어링해야 한다는 의견이 많습니다.",
          민감성: "무향·무알코올 처방으로 자극 없이 쓴다는 후기가 많습니다.",
          복합성: "T존은 산뜻, 볼은 추가 보습이 필요하다는 패턴이 자주 보입니다.",
        },
        reviews: [
          {
            id: "r1-1",
            author: "수분러버",
            skinType: "건성",
            concern: "건조",
            text: "바르자마자 속당김이 줄어요. 끈적임 없이 스며들고 크림 전에 쓰기 좋습니다.",
          },
          {
            id: "r1-2",
            author: "데일리유저",
            skinType: "지성",
            concern: "유분/번들거림",
            text: "유분감 없이 가볍게 흡수돼요. 아침 루틴에 선크림 전에 레이어링하기 편합니다.",
          },
          {
            id: "r1-3",
            author: "민감피부K",
            skinType: "민감성",
            concern: "트러블",
            text: "향이 없고 따가움 없이 썼어요. 붉은기가 조금 가라앉은 느낌입니다.",
          },
          {
            id: "r1-4",
            author: "복합T존",
            skinType: "복합성",
            concern: "모공",
            text: "T존은 산뜻한데 볼은 겨울엔 한 겹 더 필요해요. 속건조 잡는 데는 도움 됩니다.",
          },
          {
            id: "r1-5",
            author: "성분확인러",
            skinType: "건성",
            concern: "피부결/광채",
            text: "히알루론산만으로는 밤에 부족할 때가 있어요. 오일이나 크림과 같이 쓰면 만족도가 올라갑니다.",
          },
          {
            id: "r1-6",
            author: "리뷰어_J",
            skinType: "복합성",
            concern: "건조",
            text: "텍스처는 물처럼 가볍고 흡수가 빨라요. 건조한 날엔 두 번 발라도 부담 없습니다.",
          },
          {
            id: "r1-7",
            author: "재구매러",
            skinType: "건성",
            concern: "건조",
            text: "속건조에 산뜻하게 스며들고 재구매각이에요. 아침에도 끈적임 없이 레이어링하기 좋습니다.",
            trustScore: 76,
            adSuspicion: 52,
          },
        ],
      },
      {
        id: "p2",
        name: "벨벳 핏 쿠션 글로우",
        category: "makeup",
        trueCertified: false,
        image: "images/products/p2-cushion.png",
        priceLabel: "4만 원대",
        popularityScore: 88,
        controversyNote: "묻어남 이슈",
        isControversialToday: false,
        marketingClaims: ["24시간 지속", "자연스러운 광", "피부 표현 균일"],
        realUserThemes: {
          tagKeywords: ["톤보정", "얇은발림"],
          positive: ["톤 보정 자연스러움", "얇게 발림"],
          negative: ["마스크에 묻음", "유분 많은 피부에 무너짐"],
          risks: ["건조 시 각질 부각"],
        },
        insightsBySkin: {
          지성: "무너짐·묻어남 후기가 상대적으로 많습니다.",
          건성: "촉촉함은 좋지만 각질 관리가 필요하다는 의견이 있습니다.",
          민감성: "향에 민감한 경우 패치가 필요합니다.",
          복합성: "부위별로 유지력 차이가 있다는 평이 많습니다.",
        },
        reviews: [
          {
            id: "r2-1",
            author: "글로우킴",
            skinType: "건성",
            concern: "톤",
            text: "얇게 발리고 톤이 예뻐요. 다만 마스크 안에서는 묻어납니다.",
          },
          {
            id: "r2-2",
            author: "오일컷",
            skinType: "지성",
            concern: "모공",
            text: "오후에는 유분과 함께 지워지는 느낌이에요.",
          },
          {
            id: "r2-3",
            author: "글로우찐",
            skinType: "복합성",
            concern: "톤",
            text: "톤 보정이 예뻐서 인생템 각인! 체험단으로 받았는데 강추합니다. 다만 마스크에 묻어나요.",
            trustScore: 73,
            adSuspicion: 78,
          },
        ],
      },
      {
        id: "p4",
        name: "세라 바디 로션 딥 모이스처",
        category: "body",
        trueCertified: false,
        image: "images/products/p4-body-lotion.png",
        priceLabel: "1만 원대",
        popularityScore: 85,
        controversyNote: null,
        isControversialToday: false,
        marketingClaims: ["세라마이드 함유", "끈적임 최소", "대용량"],
        realUserThemes: {
          tagKeywords: ["가성비", "흡수"],
          positive: ["가성비", "흡수 속도"],
          negative: ["건조한 날 씨에는 부족"],
          risks: [],
        },
        insightsBySkin: {
          지성: "바디 제품으로는 산뜻한 편이라는 평이 많습니다.",
          건성: "겨울에는 레이어링이 필요하다는 후기가 있습니다.",
          민감성: "무향 옵션을 찾는 사용자가 있습니다.",
          복합성: "부위별로 발림 차이가 있다는 의견입니다.",
        },
        reviews: [
          {
            id: "r4-1",
            author: "바디케어",
            skinType: "건성",
            concern: "건조",
            text: "가성비 좋아요. 건조한 날에는 덧발라야 해요.",
          },
          {
            id: "r4-2",
            author: "데일리바디",
            skinType: "복합성",
            concern: "건조",
            text: "흡수는 빠른 편이고 향이 은은해요. 공구 때 사면 가성비가 더 좋아 보여요.",
            trustScore: 74,
            adSuspicion: 46,
          },
        ],
      },
      {
        id: "p5",
        name: "카밍 시카 크림",
        category: "skincare",
        trueCertified: true,
        image: "images/products/p5-cica-cream.png",
        priceLabel: "2만 5천 원대",
        popularityScore: 90,
        controversyNote: "행사가 가격 편차",
        isControversialToday: false,
        marketingClaims: ["피부 진정", "장벽 케어", "저자극 테스트"],
        realUserThemes: {
          tagKeywords: ["진정", "밤보습"],
          positive: ["진정 체감", "밤에 레이어로 안정"],
          negative: ["무거운 제형은 호불호"],
          risks: ["여드름 피부에 과포함 우려(소수)"],
        },
        insightsBySkin: {
          지성: "양 조절이 중요하다는 후기가 많습니다.",
          건성: "밤 보습으로 만족한다는 평이 많습니다.",
          민감성: "패치 테스트 후 장기 사용 사례가 많습니다.",
          복합성: "부위별로 양을 나눠 바른다는 팁이 있습니다.",
        },
        reviews: [
          {
            id: "r5-1",
            author: "진정러",
            skinType: "민감성",
            concern: "트러블",
            text: "자극 적고 진정은 됩니다. 다만 제형이 무거워요.",
          },
          {
            id: "r5-2",
            author: "럭키체험",
            skinType: "복합성",
            concern: "모공",
            text: "체험단 최고 협찬 최고 인생템 각인 각인 추천 추천!",
            trustScore: 71,
            adSuspicion: 86,
          },
        ],
      },
    ],
  };
})();
