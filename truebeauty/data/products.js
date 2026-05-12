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
        id: "mag-1",
        title: "민감 피부를 위한 성분 체크리스트",
        excerpt: "자극 가능 성분을 빠르게 걸러내는 방법과 패치 테스트 팁.",
        skinTypes: ["민감성"],
        tag: "성분 해석",
      },
      {
        id: "mag-2",
        title: "동일 라인 세럼 vs 크림, 무엇을 먼저?",
        excerpt: "텍스처와 배합 순서를 데이터 관점에서 비교했습니다.",
        skinTypes: ["복합성", "지성"],
        tag: "제품 비교",
      },
      {
        id: "mag-3",
        title: "건조 계절에 믿을 수 있는 보습 루틴",
        excerpt: "실제 사용자 경험에서 반복 언급된 보습 유지 포인트.",
        skinTypes: ["건성"],
        tag: "피부 타입별 추천",
      },
    ],

    products: [
      {
        id: "p1",
        name: "아쿠아 베리어 히알루 세럼",
        category: "skincare",
        image: "images/product-placeholder.svg",
        priceLabel: "3만 원대",
        popularityScore: 94,
        controversyNote: "알코올 성분 논란",
        isControversialToday: true,
        marketingClaims: [
          "72시간 지속 보습",
          "저자극 임상 완료",
          "흡수 즉시 광채",
        ],
        realUserThemes: {
          positive: ["가벼운 제형", "메이크업 밀착 개선"],
          negative: ["건조할 때는 부족함"],
          risks: ["민감 시 따가움(소수)"],
        },
        insightsBySkin: {
          지성: "유분과 밸런스가 맞으면 산뜻하게 마무리된다는 평이 많습니다.",
          건성: "보습 지속력은 계절에 따라 의견이 갈립니다.",
          민감성: "패치 테스트 후 사용을 권장하는 후기가 있습니다.",
          복합성: "T존과 볼의 체감 차이가 후기에서 자주 언급됩니다.",
        },
        reviews: [
          {
            id: "r1-1",
            author: "유저_민트",
            skinType: "복합성",
            concern: "모공",
            text: "가벼워서 좋아요 가벼워서 좋아요 촉촉함은 보통이에요.",
          },
          {
            id: "r1-2",
            author: "체험단_소라",
            skinType: "지성",
            concern: "트러블",
            text: "협찬 받았지만 진짜 인생템이에요 무조건 강추 최고예요 대박!",
          },
          {
            id: "r1-3",
            author: "데이터러버",
            skinType: "민감성",
            concern: "트러블",
            text: "첫날은 괜찮았는데 이틀째부터 따가움이 있었어요. 성분표를 다시 봤습니다.",
          },
        ],
      },
      {
        id: "p2",
        name: "벨벳 핏 쿠션 글로우",
        category: "makeup",
        image: "images/product-placeholder.svg",
        priceLabel: "4만 원대",
        popularityScore: 88,
        controversyNote: "묻어남 이슈",
        isControversialToday: false,
        marketingClaims: ["24시간 지속", "자연스러운 광", "피부 표현 균일"],
        realUserThemes: {
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
        ],
      },
      {
        id: "p3",
        name: "실크 리페어 헤어 에센스",
        category: "hair",
        image: "images/product-placeholder.svg",
        priceLabel: "2만 원대",
        popularityScore: 91,
        controversyNote: null,
        isControversialToday: false,
        marketingClaims: ["손상 케어", "은은한 광택", "비건 성분"],
        realUserThemes: {
          positive: ["끝 마무리 부드러움", "향 지속"],
          negative: ["머리 많으면 소모 빠름"],
          risks: [],
        },
        insightsBySkin: {
          지성: "두피 유분과는 별개로 모발 끝 케어로 만족한다는 평이 많습니다.",
          건성: "건조한 모발에서 차이를 느낀다는 후기가 많습니다.",
          민감성: "향료에 민감하면 주의가 필요합니다.",
          복합성: "모발 상태에 따라 차이가 크다는 의견입니다.",
        },
        reviews: [
          {
            id: "r3-1",
            author: "샴푸킹",
            skinType: "복합성",
            concern: "건조",
            text: "끝이 부드러워져요. 향이 은은하게 오래 가요.",
          },
          {
            id: "r3-2",
            author: "미니멀샤",
            skinType: "민감성",
            concern: "트러블",
            text: "향이 강하지 않아서 좋아요. 재구매 고민 중이에요.",
          },
        ],
      },
      {
        id: "p4",
        name: "세라 바디 로션 딥 모이스처",
        category: "body",
        image: "images/product-placeholder.svg",
        priceLabel: "1만 원대",
        popularityScore: 85,
        controversyNote: null,
        isControversialToday: false,
        marketingClaims: ["세라마이드 함유", "끈적임 최소", "대용량"],
        realUserThemes: {
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
        ],
      },
      {
        id: "p5",
        name: "카밍 시카 크림",
        category: "skincare",
        image: "images/product-placeholder.svg",
        priceLabel: "2만 5천 원대",
        popularityScore: 90,
        controversyNote: "행사가 가격 편차",
        isControversialToday: false,
        marketingClaims: ["피부 진정", "장벽 케어", "저자극 테스트"],
        realUserThemes: {
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
          },
        ],
      },
    ],
  };
})();
