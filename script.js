/**
 * TrueBeauty — UI 로직 (Vanilla JS)
 */
(function () {
  "use strict";

  const STORAGE_KEY = "truebeauty_profile_v2";
  const STORAGE_LEGACY = "truebeauty_profile_v1";
  const STORAGE_SAVED = "truebeauty_saved_v1";
  const STORAGE_RECENT = "truebeauty_recent_v1";

  const SKIN_OPTIONS = ["건성", "민감성", "지성", "복합성", "수부지", "잘 모르겠어요"];
  const CONCERN_OPTIONS = [
    "피부결/광채",
    "트러블/여드름",
    "주름/탄력",
    "기미/잡티",
    "모공",
    "유분/번들거림",
  ];
  const REACTION_OPTIONS = [
    "자주 피부가 예민하게 반응해요",
    "가끔 트러블이 생겨요",
    "문제 없이 잘 맞는 편이에요",
  ];

  const INSIGHT_SKIN_KEYS = ["지성", "건성", "민감성", "복합성"];

  /** 마이페이지에서 프로필 수정 시 true — 1단계에서 뒤로가기 시 앱으로 복귀 */
  let wizardOpenedFromApp = false;

  /** 카테고리 UI (첨부 구조도 기준) */
  const CATEGORY_MAIN = [
    { id: "reco", label: "추천" },
    { id: "skincare", label: "스킨케어" },
    { id: "face", label: "페이스" },
    { id: "lip", label: "립메이크업" },
    { id: "eye", label: "아이메이크업" },
  ];

  const RECO_TILES = [
    { id: "reco-rank", label: "랭킹", icon: "🏅" },
    { id: "reco-only", label: "트루Pick", icon: "✓" },
    { id: "reco-md", label: "MD추천", icon: "💎" },
  ];

  const SKINCARE_BLOCKS = [
    {
      title: "피부 고민별",
      rows: [
        { id: "scm-moist", label: "수분/보습" },
        { id: "scm-white", label: "미백" },
        { id: "scm-pore", label: "모공" },
        { id: "scm-trouble", label: "트러블" },
        { id: "scm-keratin", label: "각질" },
        { id: "scm-aging", label: "안티에이징" },
      ],
    },
    {
      title: "제품 유형별",
      rows: [
        { id: "sct-toner", label: "스킨/토너" },
        { id: "sct-ampoule", label: "앰플/세럼" },
        { id: "sct-lotion", label: "로션/에센스" },
        { id: "sct-cream", label: "크림" },
        { id: "sct-mask", label: "마스크/패드" },
        { id: "sct-sun", label: "선케어" },
      ],
    },
  ];

  const FACE_ROWS = [
    { id: "face-base", label: "베이스/프라이머" },
    { id: "face-cushion", label: "쿠션/파운데이션" },
    { id: "face-conceal", label: "컨실러/BB/CC" },
    { id: "face-pact", label: "팩트/파우더" },
    { id: "face-contour", label: "컨투어링/하이라이터" },
    { id: "face-blush", label: "블러셔" },
  ];

  const LIP_ROWS = [
    { id: "lip-stick", label: "립스틱" },
    { id: "lip-pencil", label: "립펜슬" },
    { id: "lip-tint", label: "틴트" },
    { id: "lip-gloss", label: "립글로스" },
    { id: "lip-care", label: "립케어" },
  ];

  const EYE_ROWS = [
    { id: "eye-shadow", label: "싱글 섀도우/아이팔레트" },
    { id: "eye-brow", label: "아이브로우" },
    { id: "eye-mascara", label: "마스카라 / 속눈썹" },
    { id: "eye-liner", label: "아이라이너" },
  ];

  let activeMainCat = "reco";
  let activeLeafId = "reco-rank";

  /** 리프 상세페이지 정렬 옵션 (디자인 첨부 기준) */
  const LEAF_SORT_OPTIONS = [
    { id: "recommend", label: "추천순" },
    { id: "ranking", label: "랭킹순" },
    { id: "reviews", label: "리뷰 많은 순" },
    { id: "rating", label: "평점 높은 순" },
    { id: "newest", label: "최신 등록 순" },
  ];

  /** 리프 상세페이지의 현재 정렬 / 현재 리프 / 카테고리 시트에서 펼쳐진 대분류 */
  let leafCurrentSort = "recommend";
  let currentLeafId = null;
  let leafSheetExpandedMain = null;
  /** 내 피부 맞춤 토글 — ON이면 정렬 결과에 피부 매칭 가산점을 적용합니다. (기본 ON) */
  let leafSkinAware = true;

  function defaultLeafForMain(main) {
    if (main === "reco") return "reco-rank";
    if (main === "skincare") return "scm-moist";
    if (main === "face") return "face-base";
    if (main === "lip") return "lip-stick";
    return "eye-shadow";
  }

  function renderCategorySidebar() {
    const el = document.getElementById("category-sidebar");
    el.innerHTML = CATEGORY_MAIN.map(
      (m) =>
        `<button type="button" class="cat-side-item${m.id === activeMainCat ? " is-active" : ""}" data-main="${m.id}">${escapeHtml(
          m.label
        )}</button>`
    ).join("");
  }

  function renderCategoryMain() {
    const el = document.getElementById("category-main");
    if (activeMainCat === "reco") {
      el.innerHTML = `
        <h3 class="cat-main__h">추천</h3>
        <div class="reco-grid">
          ${RECO_TILES.map(
            (t) =>
              `<button type="button" class="reco-tile${t.id === activeLeafId ? " is-active" : ""}" data-leaf="${t.id}">
                <span class="reco-tile__icon">${t.icon}</span>
                <span class="reco-tile__label">${escapeHtml(t.label)}</span>
              </button>`
          ).join("")}
        </div>`;
      return;
    }
    if (activeMainCat === "skincare") {
      el.innerHTML = SKINCARE_BLOCKS.map(
        (block) => `
        <div class="cat-subblock">
          <div class="cat-row-head"><span>${escapeHtml(block.title)}</span><span class="cat-row-head__chev" aria-hidden="true">›</span></div>
          <ul class="cat-link-rows">
            ${block.rows
              .map(
                (r) =>
                  `<li><button type="button" class="cat-link-btn${r.id === activeLeafId ? " is-active" : ""}" data-leaf="${r.id}">${escapeHtml(
                    r.label
                  )}</button></li>`
              )
              .join("")}
          </ul>
        </div>`
      ).join("");
      return;
    }
    const rows = activeMainCat === "face" ? FACE_ROWS : activeMainCat === "lip" ? LIP_ROWS : EYE_ROWS;
    const title = CATEGORY_MAIN.filter((m) => m.id === activeMainCat)[0];
    el.innerHTML = `
      <div class="cat-row-head"><span>${escapeHtml(title ? title.label : "")}</span><span class="cat-row-head__chev" aria-hidden="true">›</span></div>
      <ul class="cat-link-rows">
        ${rows
          .map(
            (r) =>
              `<li><button type="button" class="cat-link-btn${r.id === activeLeafId ? " is-active" : ""}" data-leaf="${r.id}">${escapeHtml(
                r.label
              )}</button></li>`
          )
          .join("")}
      </ul>`;
  }

  function renderCategory() {
    renderCategorySidebar();
    renderCategoryMain();
  }

  function initCategorySplit() {
    const root = document.getElementById("view-category");
    if (root.getAttribute("data-bound") === "1") return;
    root.setAttribute("data-bound", "1");
    root.addEventListener("click", (e) => {
      const mainBtn = e.target.closest("[data-main]");
      if (mainBtn) {
        activeMainCat = mainBtn.getAttribute("data-main");
        activeLeafId = defaultLeafForMain(activeMainCat);
        renderCategory();
        return;
      }
      const leafBtn = e.target.closest("[data-leaf]");
      if (leafBtn) {
        activeLeafId = leafBtn.getAttribute("data-leaf");
        renderCategoryMain();
        openCategoryLeafPage(activeLeafId);
      }
    });

    initCategoryLeafPage();
  }

  function initCategoryLeafPage() {
    const overlay = document.getElementById("category-leaf-detail");
    if (!overlay || overlay.getAttribute("data-bound") === "1") return;
    overlay.setAttribute("data-bound", "1");

    const closeBtn = document.getElementById("btn-close-cat-leaf");
    if (closeBtn) closeBtn.addEventListener("click", closeCategoryLeafPage);

    const parentBtn = document.getElementById("btn-cat-leaf-parent");
    if (parentBtn) parentBtn.addEventListener("click", openLeafCatSheet);

    const sortBtn = document.getElementById("btn-cat-leaf-sort");
    if (sortBtn) sortBtn.addEventListener("click", openLeafSortSheet);

    const skinToggleBtn = document.getElementById("btn-cat-leaf-skin-toggle");
    if (skinToggleBtn) {
      skinToggleBtn.addEventListener("click", () => {
        leafSkinAware = !leafSkinAware;
        renderLeafSkinToggle();
        const leaf = findLeafInfo(currentLeafId);
        if (leaf) renderLeafProducts(leaf);
      });
    }

    const tabsEl = document.getElementById("category-leaf-tabs");
    if (tabsEl) {
      tabsEl.addEventListener("click", (e) => {
        const t = e.target.closest("[data-leaf-tab]");
        if (!t) return;
        setActiveLeafInDetail(t.getAttribute("data-leaf-tab"));
      });
    }

    const catSheetBody = document.getElementById("leaf-cat-sheet-body");
    if (catSheetBody) {
      catSheetBody.addEventListener("click", (e) => {
        const head = e.target.closest("[data-cat-row-head]");
        if (head) {
          const id = head.getAttribute("data-cat-row-head");
          leafSheetExpandedMain = leafSheetExpandedMain === id ? null : id;
          renderLeafCatSheet();
          return;
        }
        const jump = e.target.closest("[data-leaf-jump]");
        if (jump) {
          const id = jump.getAttribute("data-leaf-jump");
          closeLeafCatSheet();
          setActiveLeafInDetail(id);
        }
      });
    }

    const sortSheetBody = document.getElementById("leaf-sort-sheet-body");
    if (sortSheetBody) {
      sortSheetBody.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-sort-pick]");
        if (!btn) return;
        leafCurrentSort = btn.getAttribute("data-sort-pick");
        renderLeafSortButton();
        closeLeafSortSheet();
        const leaf = findLeafInfo(currentLeafId);
        if (leaf) renderLeafProducts(leaf);
      });
    }

    overlay.querySelectorAll("[data-close-leaf-sheet]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-close-leaf-sheet");
        if (id === "leaf-cat-sheet") closeLeafCatSheet();
        if (id === "leaf-sort-sheet") closeLeafSortSheet();
      });
    });
  }

  /** 리프(말단) 카테고리 ID로 메타 정보(라벨, 상위 카테고리)를 찾습니다. */
  function findLeafInfo(leafId) {
    const sources = [
      { parentId: "reco", rows: RECO_TILES },
      { parentId: "skincare", rows: SKINCARE_BLOCKS.reduce((acc, b) => acc.concat(b.rows), []) },
      { parentId: "face", rows: FACE_ROWS },
      { parentId: "lip", rows: LIP_ROWS },
      { parentId: "eye", rows: EYE_ROWS },
    ];
    for (let i = 0; i < sources.length; i += 1) {
      const src = sources[i];
      const r = src.rows.find((x) => x.id === leafId);
      if (r) {
        const main = CATEGORY_MAIN.find((m) => m.id === src.parentId);
        return { id: r.id, label: r.label, parentId: src.parentId, parentLabel: main ? main.label : "" };
      }
    }
    return null;
  }

  /** 부모 대분류의 모든 리프(세부 카테고리)들을 평탄화하여 반환합니다. */
  function siblingLeavesOf(parentId) {
    if (parentId === "reco") return RECO_TILES;
    if (parentId === "skincare") return SKINCARE_BLOCKS.reduce((acc, b) => acc.concat(b.rows), []);
    if (parentId === "face") return FACE_ROWS;
    if (parentId === "lip") return LIP_ROWS;
    if (parentId === "eye") return EYE_ROWS;
    return [];
  }

  /** 리프의 부모 대분류를 데이터 카테고리(skincare/makeup 등)로 매핑합니다. */
  function dataCategoryForLeafParent(parentId) {
    if (parentId === "skincare") return "skincare";
    if (parentId === "face" || parentId === "lip" || parentId === "eye") return "makeup";
    return null;
  }

  /** 리프의 후보 제품 집합을 반환합니다(정렬 전). */
  function getLeafProductCandidates(leaf) {
    const all = getProducts();
    const cat = dataCategoryForLeafParent(leaf.parentId);
    return cat ? all.filter((p) => p.category === cat) : all.slice();
  }

  /** "추천순" 기본 정렬 — 리프별로 다르게 동작합니다. */
  function applyLeafRecommendSort(list, leaf) {
    if (leaf.id === "reco-rank") {
      return list.slice().sort((a, b) => b.popularityScore - a.popularityScore);
    }
    if (leaf.id === "reco-only") {
      return list.slice().sort((a, b) => aggregateProductTrust(b).trustScore - aggregateProductTrust(a).trustScore);
    }
    if (leaf.id === "reco-md") {
      const flagged = list.filter((p) => p.isControversialToday);
      const rest = list.filter((p) => !p.isControversialToday);
      return flagged.concat(rest);
    }
    return list.slice().sort((a, b) => b.popularityScore - a.popularityScore);
  }

  /** 정렬 옵션을 적용한 제품 목록을 반환합니다. */
  function getLeafProducts(leaf, sortId) {
    const candidates = getLeafProductCandidates(leaf);
    const s = sortId || leafCurrentSort || "recommend";

    let arr;
    if (s === "ranking") {
      arr = candidates.slice().sort((a, b) => b.popularityScore - a.popularityScore);
    } else if (s === "reviews") {
      arr = candidates.slice().sort((a, b) => ((b.reviews && b.reviews.length) || 0) - ((a.reviews && a.reviews.length) || 0));
    } else if (s === "rating") {
      arr = candidates.slice().sort((a, b) => aggregateProductTrust(b).trustScore - aggregateProductTrust(a).trustScore);
    } else if (s === "newest") {
      arr = candidates.slice().sort((a, b) => String(b.id || "").localeCompare(String(a.id || "")));
    } else {
      arr = applyLeafRecommendSort(candidates, leaf);
    }

    // 내피부 맞춤 ON — 피부 매칭 점수 높은 제품을 위로, 같은 점수는 기존 정렬 순서 유지
    if (leafSkinAware && profile && profile.skinType) {
      const baseRank = new Map(arr.map((p, i) => [p.id, i]));
      arr = arr.slice().sort((a, b) => {
        const sa = skinMatchScore(a, profile);
        const sb = skinMatchScore(b, profile);
        if (sa !== sb) return sb - sa;
        return (baseRank.get(a.id) || 0) - (baseRank.get(b.id) || 0);
      });
    }

    return arr;
  }

  /** 제품-프로필 피부 매칭 가산점 계산. */
  function skinMatchScore(product, prof) {
    if (!prof || !prof.skinType) return 0;
    const mapped = mapSkinForInsights(prof.skinType);
    let s = 0;
    if (product.insightsBySkin && product.insightsBySkin[mapped]) s += 30;
    const labels = (prof.concerns || []).map(mapConcernToReviewLabel);
    (product.reviews || []).forEach((r) => {
      if (r.skinType === mapped) s += 6;
      if (labels.includes(r.concern)) s += 4;
    });
    return s;
  }

  function renderLeafTitle(leaf) {
    const el = document.getElementById("category-leaf-parent");
    if (el) el.textContent = leaf.parentLabel;
  }

  function renderLeafTabs(leaf) {
    const tabsEl = document.getElementById("category-leaf-tabs");
    if (!tabsEl) return;
    const siblings = siblingLeavesOf(leaf.parentId);
    tabsEl.innerHTML = siblings
      .map(
        (s) =>
          `<button type="button" class="cat-leaf-tab${s.id === leaf.id ? " is-active" : ""}" data-leaf-tab="${s.id}">${escapeHtml(
            s.label
          )}</button>`
      )
      .join("");
    requestAnimationFrame(() => {
      const active = tabsEl.querySelector(".cat-leaf-tab.is-active");
      if (active && typeof active.scrollIntoView === "function") {
        try {
          active.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
        } catch (_) {
          // older browsers — fall back to manual scroll
          tabsEl.scrollLeft = Math.max(0, active.offsetLeft - tabsEl.clientWidth / 2 + active.clientWidth / 2);
        }
      }
    });
  }

  function renderLeafSortButton() {
    const labelEl = document.getElementById("category-leaf-sort-label");
    if (!labelEl) return;
    const opt = LEAF_SORT_OPTIONS.find((o) => o.id === leafCurrentSort) || LEAF_SORT_OPTIONS[0];
    labelEl.textContent = opt.label;
  }

  function renderLeafSkinToggle() {
    const btn = document.getElementById("btn-cat-leaf-skin-toggle");
    if (!btn) return;
    btn.setAttribute("aria-checked", leafSkinAware ? "true" : "false");
  }

  function renderLeafProducts(leaf) {
    const bodyEl = document.getElementById("category-leaf-body");
    if (!bodyEl) return;
    const list = getLeafProducts(leaf, leafCurrentSort);

    bodyEl.innerHTML = list.length
      ? `<section class="cat-leaf-section">
           <div class="card-grid cat-leaf-grid">${list.map((p) => taggedProductCardHtml(p)).join("")}</div>
         </section>`
      : `<div class="cat-leaf-empty">
           <span class="cat-leaf-empty__icon" aria-hidden="true">📦</span>
           <p class="cat-leaf-empty__title">아직 준비 중인 카테고리예요</p>
           <p class="cat-leaf-empty__caption">곧 다양한 제품을 만나보실 수 있어요.</p>
         </div>`;

    bindProductClicks(bodyEl);
    bodyEl.scrollTop = 0;
  }

  /** 리프 상세를 새로 열 때 — 페이지 자체를 띄웁니다. */
  function openCategoryLeafPage(leafId) {
    const leaf = findLeafInfo(leafId);
    if (!leaf) return;
    const overlay = document.getElementById("category-leaf-detail");
    if (!overlay) return;

    currentLeafId = leaf.id;
    leafSheetExpandedMain = leaf.parentId;
    leafCurrentSort = "recommend";
    leafSkinAware = true;

    renderLeafTitle(leaf);
    renderLeafTabs(leaf);
    renderLeafSortButton();
    renderLeafSkinToggle();
    renderLeafProducts(leaf);

    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
  }

  /** 이미 열려있는 리프 상세 내부에서 리프를 전환합니다(페이지 유지). */
  function setActiveLeafInDetail(leafId) {
    const leaf = findLeafInfo(leafId);
    if (!leaf) return;

    currentLeafId = leaf.id;
    activeLeafId = leaf.id;
    if (leaf.parentId !== activeMainCat) {
      activeMainCat = leaf.parentId;
    }
    leafSheetExpandedMain = leaf.parentId;
    renderCategory();

    renderLeafTitle(leaf);
    renderLeafTabs(leaf);
    renderLeafProducts(leaf);
  }

  function closeCategoryLeafPage() {
    closeLeafCatSheet();
    closeLeafSortSheet();
    const overlay = document.getElementById("category-leaf-detail");
    if (!overlay) return;
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
  }

  /* ----- 리프 상세 — 카테고리 / 정렬 바텀시트 ----- */

  function openLeafCatSheet() {
    const sheet = document.getElementById("leaf-cat-sheet");
    if (!sheet) return;
    renderLeafCatSheet();
    sheet.classList.remove("hidden");
    sheet.setAttribute("aria-hidden", "false");
    const trigger = document.getElementById("btn-cat-leaf-parent");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
  }

  function closeLeafCatSheet() {
    const sheet = document.getElementById("leaf-cat-sheet");
    if (!sheet) return;
    sheet.classList.add("hidden");
    sheet.setAttribute("aria-hidden", "true");
    const trigger = document.getElementById("btn-cat-leaf-parent");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function renderLeafCatSheet() {
    const bodyEl = document.getElementById("leaf-cat-sheet-body");
    if (!bodyEl) return;
    bodyEl.innerHTML = CATEGORY_MAIN.map((m) => {
      const expanded = m.id === leafSheetExpandedMain;
      const leaves = siblingLeavesOf(m.id);
      const leavesHtml = expanded
        ? `<div class="leaf-cat-row__leaves">${leaves
            .map(
              (l) =>
                `<button type="button" class="leaf-cat-row__leaf${
                  l.id === currentLeafId ? " is-active" : ""
                }" data-leaf-jump="${l.id}">${escapeHtml(l.label)}</button>`
            )
            .join("")}</div>`
        : "";
      return `
        <div class="leaf-cat-row${expanded ? " is-expanded" : ""}" data-cat-main="${m.id}">
          <button type="button" class="leaf-cat-row__head" data-cat-row-head="${m.id}" aria-expanded="${expanded ? "true" : "false"}">
            <span class="leaf-cat-row__name">${escapeHtml(m.label)}</span>
            <svg class="leaf-cat-row__chev" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          ${leavesHtml}
        </div>`;
    }).join("");
  }

  function openLeafSortSheet() {
    const sheet = document.getElementById("leaf-sort-sheet");
    if (!sheet) return;
    renderLeafSortSheet();
    sheet.classList.remove("hidden");
    sheet.setAttribute("aria-hidden", "false");
    const trigger = document.getElementById("btn-cat-leaf-sort");
    if (trigger) trigger.setAttribute("aria-expanded", "true");
  }

  function closeLeafSortSheet() {
    const sheet = document.getElementById("leaf-sort-sheet");
    if (!sheet) return;
    sheet.classList.add("hidden");
    sheet.setAttribute("aria-hidden", "true");
    const trigger = document.getElementById("btn-cat-leaf-sort");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function renderLeafSortSheet() {
    const bodyEl = document.getElementById("leaf-sort-sheet-body");
    if (!bodyEl) return;
    bodyEl.innerHTML = LEAF_SORT_OPTIONS.map((opt) => {
      const active = opt.id === leafCurrentSort;
      const check = active
        ? `<svg class="leaf-sort-option__check" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
             <path d="M5 12l5 5 9-11" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>`
        : "";
      return `<button type="button" class="leaf-sort-option${active ? " is-active" : ""}" data-sort-pick="${opt.id}">
                <span>${escapeHtml(opt.label)}</span>
                ${check}
              </button>`;
    }).join("");
  }

  const AD_KEYWORDS = [
    "협찬",
    "체험단",
    "인생템",
    "강추",
    "무조건",
    "최고",
    "대박",
    "리얼후기",
    "각인",
    "공구",
    "할인찬스",
    "재구매각",
    "무한리필",
    "찐후기",
    "레알",
    "미친",
    "개꿀",
  ];

  const NEGATIVE_HINTS = ["따가움", "자극", "트러블", "각질", "묻어남", "무너짐", "건조", "민감", "부족"];
  const POSITIVE_HINTS = ["만족", "좋아요", "촉촉", "산뜻", "부드", "흡수", "자연", "얇게"];

  /**
   * magazineArticles / products 로드 실패 시에도 논란 리포트 블록이 사라지지 않도록 동일 스키마 폴백.
   * (data/products.js와 내용 맞춤 — 데이터 있으면 그쪽이 우선)
   */
  const DEFAULT_MAG_TODAY_CONTROVERSY_ARTICLE = {
    id: "mag-today-controversy",
    tag: "논란 리포트",
    skinTypes: ["민감성", "복합성", "지성", "건성"],
    excerptTemplate: "%SUMMARY%을(를) 중심으로 사용자 반응과 성분 맥락을 짚었습니다.",
    titleTemplate: "오늘의 논란 제품 — %NAME%",
    paragraphs: [
      "「%NAME%」에 대한 관심이 커지면서 %SUMMARY%에 대한 의견이 엇갈리고 있습니다. 일부 후기에서는 자극·건조함이 언급되며 성분표를 다시 확인하자는 목소리가 있습니다.",
      "반면 피부 특성에 맞는 사용자에게는 산뜻한 사용감이 장점으로 꼽히기도 합니다. 최종 선택 전에는 소용량으로 테스트하고, 필요 시 패치 테스트를 병행하는 것을 권장합니다.",
    ],
  };

  const FALLBACK_TODAY_CONTROVERSY_PRODUCT = {
    id: "__fallback-controversy-product__",
    name: "오늘의 논란 제품",
    image: "images/product-placeholder.svg",
    controversyNote: "논란 포인트",
    marketingClaims: [],
    realUserThemes: { positive: [], negative: [], risks: [] },
    insightsBySkin: {},
    reviews: [],
    popularityScore: 80,
  };

  /** @type {{ skinType: string, concerns: string[], skinReaction: string, nickname: string, avatarDataUrl: string }} */
  let profile = loadProfile();

  let wizardStep = 1;
  /** @type {{ skinType: string|null, concerns: string[], skinReaction: string|null, nickname: string }} */
  let draft = { skinType: null, concerns: [], skinReaction: null, nickname: "" };

  /** @type {{ nickname: string, avatarDataUrl: string }} */
  let profileEditDraft = { nickname: "", avatarDataUrl: "" };

  /** @type {{ skinType: string|null, concerns: string[], skinReaction: string|null }} */
  let skinEditDraft = { skinType: null, concerns: [], skinReaction: null };

  function defaultProfile() {
    return {
      skinType: "복합성",
      concerns: ["모공"],
      skinReaction: "가끔 트러블이 생겨요",
      nickname: "",
      avatarDataUrl: "",
    };
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        return {
          skinType: p.skinType || defaultProfile().skinType,
          concerns: Array.isArray(p.concerns) && p.concerns.length ? p.concerns : defaultProfile().concerns,
          skinReaction: p.skinReaction || defaultProfile().skinReaction,
          nickname: typeof p.nickname === "string" ? p.nickname : defaultProfile().nickname,
          avatarDataUrl: typeof p.avatarDataUrl === "string" ? p.avatarDataUrl : "",
        };
      }
      const legacyRaw = localStorage.getItem(STORAGE_LEGACY);
      if (legacyRaw) {
        const p = JSON.parse(legacyRaw);
        const migrated = {
          skinType: p.skinType || defaultProfile().skinType,
          concerns: p.concern ? [p.concern] : defaultProfile().concerns,
          skinReaction: defaultProfile().skinReaction,
          nickname: defaultProfile().nickname,
          avatarDataUrl: "",
        };
        saveProfile(migrated);
        return migrated;
      }
    } catch {
      /* noop */
    }
    return defaultProfile();
  }

  function profileInitialChar(nickname) {
    const nick = (nickname || "").trim();
    return nick ? nick.slice(0, 1) : "회";
  }

  function syncProfileAvatarUi(imgEl, initialEl, data) {
    if (!imgEl || !initialEl) return;
    const url = data.avatarDataUrl || "";
    if (url) {
      imgEl.src = url;
      imgEl.classList.remove("hidden");
      initialEl.classList.add("hidden");
    } else {
      imgEl.removeAttribute("src");
      imgEl.classList.add("hidden");
      initialEl.textContent = profileInitialChar(data.nickname);
      initialEl.classList.remove("hidden");
    }
  }

  function saveProfile(p) {
    profile = p;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }

  function mapSkinForInsights(skin) {
    if (skin === "수부지" || skin === "잘 모르겠어요") return "복합성";
    return skin;
  }

  function mapConcernToReviewLabel(c) {
    if (!c) return "모공";
    if (c.includes("모공")) return "모공";
    if (c.includes("트러블") || c.includes("여드름") || c.includes("유분")) return "트러블";
    if (c.includes("건조")) return "건조";
    return "톤";
  }

  function loadIdList(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveIdList(key, ids) {
    localStorage.setItem(key, JSON.stringify(ids.slice(0, 24)));
  }

  function getProducts() {
    return window.TrueBeautyData?.products || [];
  }

  function getMagazine() {
    return window.TrueBeautyData?.magazineArticles || [];
  }

  function getTodayControversyProduct() {
    const products = getProducts();
    if (!products.length) return FALLBACK_TODAY_CONTROVERSY_PRODUCT;
    return products.find((p) => p.isControversialToday) || products[0];
  }

  function getMagazineArticleById(id) {
    const fromData = getMagazine().find((a) => a.id === id);
    if (fromData) return fromData;
    if (id === "mag-today-controversy") return DEFAULT_MAG_TODAY_CONTROVERSY_ARTICLE;
    return null;
  }

  function magazineCardMeta(a) {
    if (a.id === "mag-today-controversy") {
      const p = getTodayControversyProduct();
      const summary = p.controversyNote || "논란 포인트";
      const tplTitle = a.titleTemplate || "";
      const tplExcerpt = a.excerptTemplate || "";
      return {
        title: tplTitle.replace(/%NAME%/g, p.name).replace(/%SUMMARY%/g, summary),
        excerpt: tplExcerpt.replace(/%NAME%/g, p.name).replace(/%SUMMARY%/g, summary),
      };
    }
    return { title: a.title, excerpt: a.excerpt };
  }

  /** 홈 인사이트 캐러셀 — 커버 이미지 */
  function magazineInsightCoverImage(a) {
    const placeholder = "images/product-placeholder.svg";
    if (a.coverImage && a.coverImage !== placeholder) {
      return a.coverImage;
    }
    if (a.id === "mag-today-controversy") {
      return "images/insight-controversy.png";
    }
    return placeholder;
  }

  /** 레퍼런스형 2줄 헤드라인(요약) */
  function insightSlideHeadlines(meta, article) {
    const title = meta.title.trim();
    const sep = title.indexOf(" — ");
    if (sep >= 0) {
      return { line1: title.slice(0, sep).trim(), line2: title.slice(sep + 3).trim() };
    }
    const comma = title.search(/[,，]/);
    if (comma > 5 && comma < title.length - 4) {
      return {
        line1: title.slice(0, comma).trim(),
        line2: title
          .slice(comma + 1)
          .replace(/^[,，]\s*/, "")
          .trim(),
      };
    }
    const words = title.split(/\s+/).filter(Boolean);
    if (words.length >= 4) {
      const mid = Math.ceil(words.length / 2);
      return { line1: words.slice(0, mid).join(" "), line2: words.slice(mid).join(" ") };
    }
    if (title.length > 16) {
      let cut = title.lastIndexOf(" ", Math.floor(title.length / 2) + 6);
      if (cut < 8) cut = Math.floor(title.length / 2);
      return { line1: title.slice(0, cut).trim(), line2: title.slice(cut).trim() };
    }
    return { line1: title, line2: article.tag || "트루매거진" };
  }

  function getHomeInsightArticles() {
    const mapped = mapSkinForInsights(profile.skinType);
    return [...getMagazine()].sort((a, b) => {
      const ma = (a.skinTypes || []).includes(mapped) ? 1 : 0;
      const mb = (b.skinTypes || []).includes(mapped) ? 1 : 0;
      return mb - ma;
    });
  }

  const PRODUCT_CATEGORY_LABELS = {
    skincare: "스킨케어",
    makeup: "메이크업",
    body: "바디",
  };

  function productSearchHaystack(product) {
    const parts = [
      product.name,
      PRODUCT_CATEGORY_LABELS[product.category] || product.category,
      product.priceLabel,
      product.controversyNote,
      ...(product.marketingClaims || []),
      ...Object.values(product.insightsBySkin || {}),
      ...(product.reviews || []).map((r) => r.text),
    ];
    return parts.filter(Boolean).join(" ").toLowerCase();
  }

  function searchProducts(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return getProducts().filter((p) => productSearchHaystack(p).includes(q));
  }

  function renderHomeSearchResults(query) {
    const resultsEl = document.getElementById("home-search-results");
    const bodyEl = document.getElementById("home-search-body");
    const clearBtn = document.getElementById("home-search-clear");
    const q = query.trim();

    if (!resultsEl || !bodyEl) return;

    if (!q) {
      resultsEl.classList.add("hidden");
      resultsEl.innerHTML = "";
      bodyEl.classList.remove("hidden");
      if (clearBtn) clearBtn.classList.add("hidden");
      return;
    }

    if (clearBtn) clearBtn.classList.remove("hidden");
    bodyEl.classList.add("hidden");
    resultsEl.classList.remove("hidden");

    const matches = searchProducts(q);
    if (!matches.length) {
      resultsEl.innerHTML = `<div class="home-search-empty">"${escapeHtml(q)}"에 맞는 제품이 없습니다.</div>`;
      return;
    }

    resultsEl.innerHTML = `
      <p class="home-search-results__count">검색 결과 ${matches.length}개</p>
      <div class="card-grid">${matches.map((p) => taggedProductCardHtml(p)).join("")}</div>`;
    bindProductClicks(resultsEl);
  }

  function initHomeSearch() {
    const input = document.getElementById("home-search-input");
    const clearBtn = document.getElementById("home-search-clear");
    if (!input) return;

    let timer = 0;
    input.addEventListener("input", () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => renderHomeSearchResults(input.value), 120);
    });

    input.addEventListener("search", () => {
      renderHomeSearchResults(input.value);
    });

    clearBtn?.addEventListener("click", () => {
      input.value = "";
      renderHomeSearchResults("");
      input.focus();
    });
  }

  function renderHomePopularCarousel(mount, products) {
    if (!mount) return;
    const popular = [...products].sort((a, b) => b.popularityScore - a.popularityScore);
    if (!popular.length) {
      mount.innerHTML = "";
      return;
    }
    mount.innerHTML = `
    <div class="home-popular-carousel">
      <div class="home-popular-viewport" role="region" aria-roledescription="carousel" aria-label="인기 제품">
        ${popular
          .map(
            (p) =>
              `<div class="home-popular-slide">${popularProductCardHtml(p, { showTrueCert: true })}</div>`
          )
          .join("")}
      </div>
    </div>`;
  }

  function renderHomeInsightsCarousel(mount) {
    const articles = getHomeInsightArticles();
    const n = articles.length;
    if (!n) {
      mount.innerHTML = "";
      return;
    }

    mount.innerHTML = `
    <div class="home-insights-carousel">
      <div class="home-insights-viewport" role="region" aria-roledescription="carousel" aria-label="오늘의 인사이트">
        ${articles
          .map((a, i) => {
            const meta = magazineCardMeta(a);
            const img = magazineInsightCoverImage(a);
            const { line1, line2 } = insightSlideHeadlines(meta, a);
            const ctaRaw = meta.excerpt.trim();
            const cta = ctaRaw.length > 40 ? `${ctaRaw.slice(0, 38)}…` : ctaRaw;
            const controversyClass =
              a.id === "mag-today-controversy" ? " home-insights-slide--controversy" : "";
            return `
        <button type="button" class="home-insights-slide${controversyClass}" data-mag-article="${escapeHtml(a.id)}" aria-label="${escapeHtml(meta.title)} 기사 열기">
          <span class="home-insights-slide__media">
            <span class="home-insights-slide__glow" aria-hidden="true"></span>
            <img class="home-insights-slide__img" src="${escapeHtml(img)}" alt="" width="800" height="1000" loading="lazy" decoding="async" />
            <span class="home-insights-slide__scrim" aria-hidden="true"></span>
            <span class="home-insights-slide__badge">${i + 1}/${n} ›</span>
            <span class="home-insights-slide__content">
              <span class="home-insights-slide__line1">${escapeHtml(line1)}</span>
              <span class="home-insights-slide__line2">${escapeHtml(line2)}</span>
              <span class="home-insights-slide__cta">${escapeHtml(cta)}</span>
            </span>
          </span>
        </button>`;
          })
          .join("")}
      </div>
    </div>`;

    const viewport = mount.querySelector(".home-insights-viewport");
    initHomeInsightsInfiniteCarousel(viewport);
  }

  function initHomeInsightsInfiniteCarousel(viewport) {
    if (!viewport) return;

    const slides = [...viewport.querySelectorAll(".home-insights-slide")];
    const count = slides.length;
    if (count <= 1) return;

    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[count - 1].cloneNode(true);
    firstClone.classList.add("home-insights-slide--clone");
    lastClone.classList.add("home-insights-slide--clone");
    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");
    viewport.insertBefore(lastClone, slides[0]);
    viewport.appendChild(firstClone);

    let loopLock = false;
    let scrollTimer = 0;

    function allSlides() {
      return [...viewport.querySelectorAll(".home-insights-slide")];
    }

    function scrollLeftForSlide(slide) {
      return slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2;
    }

    function scrollToSlide(slide, behavior = "auto") {
      viewport.scrollTo({ left: scrollLeftForSlide(slide), behavior });
    }

    function activeSlideIndex(items) {
      const center = viewport.scrollLeft + viewport.clientWidth / 2;
      let active = 0;
      let minDist = Infinity;
      items.forEach((slide, index) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const dist = Math.abs(center - slideCenter);
        if (dist < minDist) {
          minDist = dist;
          active = index;
        }
      });
      return active;
    }

    function syncInfiniteLoop() {
      if (loopLock) return;
      const items = allSlides();
      const index = activeSlideIndex(items);
      if (index === 0) {
        loopLock = true;
        scrollToSlide(items[count], "auto");
        loopLock = false;
      } else if (index === count + 1) {
        loopLock = true;
        scrollToSlide(items[1], "auto");
        loopLock = false;
      }
    }

    requestAnimationFrame(() => {
      scrollToSlide(allSlides()[1], "auto");
    });

    viewport.addEventListener(
      "scroll",
      () => {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(syncInfiniteLoop, 90);
      },
      { passive: true }
    );

    if ("onscrollend" in viewport) {
      viewport.addEventListener("scrollend", syncInfiniteLoop, { passive: true });
    }

    viewport.addEventListener("click", (e) => {
      const btn = e.target.closest(".home-insights-slide[data-mag-article]");
      if (!btn) return;
      e.preventDefault();
      openMagArticleDetail(btn.getAttribute("data-mag-article"));
    });

    viewport.addEventListener("keydown", (e) => {
      const btn = e.target.closest(".home-insights-slide[data-mag-article]");
      if (!btn) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      openMagArticleDetail(btn.getAttribute("data-mag-article"));
    });
  }

  function fillMagArticlePlaceholders(str, product) {
    const summary = product.controversyNote || "논란 포인트";
    return str.replace(/%NAME%/g, product.name).replace(/%SUMMARY%/g, summary);
  }

  /** 오늘의 논란 제품 — 매거진 상세 오버레이 본문(분석 전체) */
  function buildMagTodayControversyDetailHtml(raw, p) {
    const agg = aggregateProductTrust(p);
    const paras =
      raw?.paragraphs
        ?.map((line) => `<p class="body-text">${escapeHtml(fillMagArticlePlaceholders(line, p))}</p>`)
        .join("") || "";

    const claims = (p.marketingClaims || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    const themesPos = (p.realUserThemes?.positive || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    const themesNeg = (p.realUserThemes?.negative || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    const themesRisk = (p.realUserThemes?.risks || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");

    const skinInsights = ["지성", "건성", "민감성", "복합성"]
      .map((skin) => {
        const text = p.insightsBySkin?.[skin];
        if (!text) return "";
        return `<p class="mag-ca-skin"><strong>${escapeHtml(skin)}</strong> — ${escapeHtml(text)}</p>`;
      })
      .join("");

    const detailPid = getProductById(p.id) ? p.id : getProducts()[0]?.id;
    const detailBtn = detailPid
      ? `<button type="button" class="btn btn--ghost btn--small" data-open-product="${escapeHtml(detailPid)}">제품 상세 보기</button>`
      : "";

    return `
      <div class="mag-article-tag">${escapeHtml(raw.tag)}</div>
      <div class="mag-ca-hero product-showcase">
        <div class="product-showcase__media">
          <img class="mag-ca-thumb" src="${escapeHtml(p.image)}" alt="" width="800" height="800" loading="lazy" decoding="async" />
        </div>
      </div>
      <div class="mag-ca-meta">
        <p class="mag-ca-name">${escapeHtml(p.name)}</p>
        <p class="caption muted">${escapeHtml(p.controversyNote || "논란 포인트")}</p>
      </div>
      ${trustMeterHtml(agg.trustScore, agg.adSuspicion)}
      <h4 class="mag-ca-h">논란 개요</h4>
      ${paras}
      <h4 class="mag-ca-h">마케팅에서 강조한 포인트</h4>
      <ul class="mag-ca-list">${claims || "<li>—</li>"}</ul>
      <h4 class="mag-ca-h">실사용 리뷰에서 반복된 테마</h4>
      <div class="mag-ca-two">
        <div>
          <span class="mag-ca-sub">긍정</span>
          <ul class="mag-ca-list">${themesPos || "<li>—</li>"}</ul>
        </div>
        <div>
          <span class="mag-ca-sub">부정·우려</span>
          <ul class="mag-ca-list">${themesNeg || "<li>—</li>"}</ul>
        </div>
      </div>
      ${
        themesRisk
          ? `<h4 class="mag-ca-h">주의 신호(리스크)</h4><ul class="mag-ca-list">${themesRisk}</ul>`
          : ""
      }
      <h4 class="mag-ca-h">피부 타입별 코멘트</h4>
      ${skinInsights || '<p class="body-text muted">데이터 없음</p>'}
      ${detailBtn}
    `;
  }

  function closeMagArticleDetail() {
    const overlay = document.getElementById("mag-article-detail");
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
  }

  function buildMagArticleBodyHtml(raw, meta) {
    let html = `<div class="mag-article-tag">${escapeHtml(raw.tag)}</div>`;
    html += `<p class="body-text mag-article-lead">${escapeHtml(meta.excerpt)}</p>`;

    if (raw.sections && raw.sections.length) {
      raw.sections.forEach((section) => {
        html += `<h3 class="mag-article-h">${escapeHtml(section.heading)}</h3>`;
        (section.paragraphs || []).forEach((paragraph) => {
          html += `<p class="body-text">${escapeHtml(paragraph)}</p>`;
        });
        if (section.list && section.list.length) {
          html += `<ul class="mag-article-list">${section.list
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}</ul>`;
        }
      });
      return html;
    }

    (raw.paragraphs || []).forEach((paragraph) => {
      html += `<p class="body-text">${escapeHtml(paragraph)}</p>`;
    });
    return html;
  }

  function openMagArticleDetail(articleId) {
    const raw = getMagazineArticleById(articleId);
    if (!raw) return;

    showTab("magazine");

    const meta = magazineCardMeta(raw);
    document.getElementById("mag-article-title").textContent = meta.title;

    const bodyEl = document.getElementById("mag-article-body");

    if (raw.id === "mag-today-controversy") {
      const p = getTodayControversyProduct();
      bodyEl.innerHTML = buildMagTodayControversyDetailHtml(raw, p);
      bindProductClicks(bodyEl);
    } else {
      bodyEl.innerHTML = buildMagArticleBodyHtml(raw, meta);
    }

    const overlay = document.getElementById("mag-article-detail");
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    document.getElementById("mag-article-body").scrollTop = 0;
  }

  function getProductById(id) {
    return getProducts().find((p) => p.id === id) || null;
  }

  function analyzeReviewText(text) {
    const t = text || "";
    let adHits = 0;
    AD_KEYWORDS.forEach((kw) => {
      if (t.includes(kw)) adHits += 1;
    });

    let adSuspicion = adHits * 16;
    if (t.length > 0 && t.length < 28) adSuspicion += 12;
    const hypeDensity = adHits / Math.max(1, t.split(/\s+/).length);
    adSuspicion += Math.round(hypeDensity * 120);

    const sentences = t
      .split(/[.!?。\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const seen = {};
    let repetitionPenalty = 0;
    sentences.forEach((s) => {
      const norm = s.replace(/\s+/g, "");
      if (norm.length > 5) {
        seen[norm] = (seen[norm] || 0) + 1;
      }
    });
    Object.values(seen).forEach((c) => {
      if (c > 1) repetitionPenalty += (c - 1) * 18;
    });

    const words = t.split(/\s+/).filter(Boolean);
    const wordCounts = {};
    words.forEach((w) => {
      const key = w.slice(0, 12);
      if (key.length > 1) wordCounts[key] = (wordCounts[key] || 0) + 1;
    });
    Object.values(wordCounts).forEach((c) => {
      if (c >= 3) repetitionPenalty += 10;
    });

    repetitionPenalty = Math.min(42, repetitionPenalty);
    adSuspicion = Math.min(100, Math.round(adSuspicion));

    let trustScore = 100 - Math.round(adSuspicion * 0.42) - repetitionPenalty;
    trustScore = Math.max(0, Math.min(100, Math.round(trustScore)));

    return { trustScore, adSuspicion };
  }

  function analyzeReview(review) {
    const computed = analyzeReviewText(review.text);
    return {
      trustScore:
        typeof review.trustScore === "number" ? review.trustScore : computed.trustScore,
      adSuspicion:
        typeof review.adSuspicion === "number" ? review.adSuspicion : computed.adSuspicion,
    };
  }

  function aggregateProductTrust(product) {
    const reviews = product.reviews || [];
    if (!reviews.length) return { trustScore: 72, adSuspicion: 22 };
    let ts = 0;
    let ad = 0;
    reviews.forEach((r) => {
      const a = analyzeReviewText(r.text);
      ts += a.trustScore;
      ad += a.adSuspicion;
    });
    return {
      trustScore: Math.round(ts / reviews.length),
      adSuspicion: Math.round(ad / reviews.length),
    };
  }

  function detectHints(text, hints) {
    const found = [];
    hints.forEach((h) => {
      if (text.includes(h)) found.push(h);
    });
    return found;
  }

  function buildMockAiSummary(product, mappedSkin) {
    const reviews = product.reviews || [];
    const bySkin = { 지성: [], 건성: [], 민감성: [], 복합성: [] };
    reviews.forEach((r) => {
      if (bySkin[r.skinType]) bySkin[r.skinType].push(r);
    });

    const themes = product.realUserThemes || {};
    const pros = (themes.positive || []).slice();
    const cons = (themes.negative || []).slice();
    const risks = (themes.risks || []).slice();

    reviews.forEach((r) => {
      const a = analyzeReviewText(r.text);
      const neg = detectHints(r.text, NEGATIVE_HINTS);
      const pos = detectHints(r.text, POSITIVE_HINTS);
      if (a.trustScore >= 68 && neg.length) {
        cons.push(`${r.skinType} 피부 언급: ${neg[0]} 관련 후기`);
      }
      if (a.trustScore >= 68 && pos.length && a.adSuspicion < 55) {
        pros.push(`${r.skinType} 피부에서 ${pos[0]} 체감 언급`);
      }
      if (a.adSuspicion >= 62) {
        cons.push("광고성 표현이 포착된 후기 포함(신뢰도 보정 적용)");
      }
    });

    const emphasisNeg = reviews.filter((r) => {
      const neg = detectHints(r.text, NEGATIVE_HINTS);
      return neg.length > 0;
    });

    const emphasisRisk = risks.length ? risks.map((x) => ({ text: x, skinType: "전체" })) : [];

    const userInsight =
      product.insightsBySkin?.[mappedSkin] || "선택한 피부 타입에 대한 요약 인사이트가 준비 중입니다.";

    const oneLine = `${product.name}은(는) ${mappedSkin} 기준으로 ${userInsight.replace(/\.$/, "")}.`;

    return {
      pros: dedupeStrings(pros).slice(0, 5),
      cons: dedupeStrings(cons).slice(0, 5),
      bySkin,
      emphasisNeg,
      emphasisRisk,
      oneLineSummary: oneLine.slice(0, 160),
    };
  }

  function dedupeStrings(arr) {
    const out = [];
    const seen = new Set();
    arr.forEach((s) => {
      const k = s.trim();
      if (!k || seen.has(k)) return;
      seen.add(k);
      out.push(k);
    });
    return out;
  }

  function trustMeterHtml(trust, ad, compact, grid) {
    if (grid) {
      return `
      <div class="trust-meter trust-meter--grid" role="group" aria-label="신뢰도 및 광고 의심 지표">
        <span class="trust-meter__label">신뢰도</span>
        <div class="trust-bar" aria-hidden="true">
          <div class="trust-bar__fill" style="width:${trust}%"></div>
        </div>
        <span class="trust-meter__value trust-meter__value--trust">${trust}%</span>
        <span class="trust-meter__label trust-meter__label--ad">광고</span>
        <div class="trust-bar trust-bar--ad" aria-hidden="true">
          <div class="trust-bar__fill trust-bar__fill--ad" style="width:${ad}%"></div>
        </div>
        <span class="trust-meter__value trust-meter__value--ad">${ad}%</span>
      </div>`;
    }
    const compactClass = compact ? " trust-meter--compact" : "";
    return `
      <div class="trust-meter${compactClass}" role="group" aria-label="신뢰도 및 광고 의심 지표">
        <div class="trust-meter__row">
          <div class="trust-bar" aria-hidden="true">
            <div class="trust-bar__fill" style="width:${trust}%"></div>
          </div>
          <span class="trust-meter__value trust-meter__value--trust">신뢰도 ${trust}%</span>
        </div>
        <div class="trust-meter__row trust-meter__row--ad">
          <div class="trust-bar trust-bar--ad" aria-hidden="true">
            <div class="trust-bar__fill trust-bar__fill--ad" style="width:${ad}%"></div>
          </div>
          <span class="trust-meter__value trust-meter__value--ad">광고 의심 ${ad}%</span>
        </div>
      </div>`;
  }

  function isProductTrueCertified(p) {
    return p?.trueCertified === true;
  }

  function productCardTrueCertBadgeHtml(p, show) {
    if (!show || !isProductTrueCertified(p)) return "";
    return `<span class="product-card__cert" aria-label="트루 인증">트루<br>인증</span>`;
  }

  function productCardMetersHtml(trust, ad) {
    return `<div class="product-card__meters">${trustMeterHtml(trust, ad, false, true)}</div>`;
  }

  function popularProductCardHtml(p, opts = {}) {
    const { trustScore, adSuspicion } = aggregateProductTrust(p);
    return `
      <button type="button" class="product-card product-card--popular" data-product-id="${p.id}">
        <div class="product-card__media">
          ${productCardTrueCertBadgeHtml(p, opts.showTrueCert)}
          <img class="product-card__img" src="${escapeHtml(p.image)}" alt="" width="400" height="400" loading="lazy" decoding="async" />
        </div>
        <div class="product-card__body">
          <p class="product-card__name">${escapeHtml(p.name)}</p>
          ${productCardMetersHtml(trustScore, adSuspicion)}
        </div>
      </button>`;
  }

  function stripThemeTail(text) {
    return String(text || "")
      .trim()
      .replace(/\s*(완화|개선|체감|발림|안정|속도|보정|자연스러움|적음|부담|호불호)\s*$/u, "")
      .trim();
  }

  function extractKeywordFromTheme(phrase) {
    const segments = String(phrase || "")
      .split(/[·,，/]/)
      .map((s) => stripThemeTail(s.trim()))
      .filter(Boolean);

    const skip = new Set(["없는", "있는", "끈적임", "없이", "전", "후", "밤에", "적은"]);

    for (const part of segments) {
      const adj = part.match(/([가-힣]{2,6}한|[가-힣]{2,6}함)/);
      if (adj && !skip.has(adj[1])) return adj[1];

      if (part.length <= 6 && !skip.has(part)) return part;

      const words = part.match(/[가-힣]{2,6}/g) || [];
      for (const w of words) {
        if (!skip.has(w)) return w;
      }
    }
    return "";
  }

  function getProductDisplayTags(p, limit = 2) {
    const explicit = p.realUserThemes?.tagKeywords;
    if (Array.isArray(explicit) && explicit.length) {
      return explicit.slice(0, limit);
    }
    const keywords = [];
    for (const phrase of p.realUserThemes?.positive || []) {
      if (keywords.length >= limit) break;
      const kw = extractKeywordFromTheme(phrase);
      if (kw && !keywords.includes(kw)) keywords.push(kw);
    }
    return keywords;
  }

  function taggedProductCardHtml(p, extraClass, opts = {}) {
    const { trustScore, adSuspicion } = aggregateProductTrust(p);
    const reviewCount = (p.reviews || []).length;
    const tags = getProductDisplayTags(p, 2).map(
      (label) => `<span class="product-card__tag">${escapeHtml(label)}</span>`
    );
    if (reviewCount) {
      tags.push(
        `<span class="product-card__tag product-card__tag--muted">${reviewCount}건</span>`
      );
    }
    const tagRow = tags.length
      ? `<div class="product-card__tags">${tags.join("")}</div>`
      : "";
    const ec = extraClass ? ` ${extraClass}` : "";

    return `
      <button type="button" class="product-card product-card--tagged${ec}" data-product-id="${p.id}">
        <div class="product-card__media">
          ${productCardTrueCertBadgeHtml(p, opts.showTrueCert)}
          <img class="product-card__img" src="${p.image}" alt="" width="72" height="72" loading="lazy" />
        </div>
        <div class="product-card__body">
          <p class="product-card__name">${escapeHtml(p.name)}</p>
          ${productCardMetersHtml(trustScore, adSuspicion)}
          ${tagRow}
        </div>
      </button>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ----- 스플래시 · 마법사 ----- */

  function showLayerSplash() {
    document.getElementById("splash-flow").classList.remove("hidden");
    document.getElementById("wizard-flow").classList.add("hidden");
    document.getElementById("app-shell").classList.add("hidden");
    document.getElementById("splash-flow").setAttribute("aria-hidden", "false");
    document.getElementById("wizard-flow").setAttribute("aria-hidden", "true");
    document.getElementById("app-shell").setAttribute("aria-hidden", "true");
  }

  function showLayerWizard() {
    document.getElementById("splash-flow").classList.add("hidden");
    document.getElementById("wizard-flow").classList.remove("hidden");
    document.getElementById("app-shell").classList.add("hidden");
    document.getElementById("splash-flow").setAttribute("aria-hidden", "true");
    document.getElementById("wizard-flow").setAttribute("aria-hidden", "false");
    document.getElementById("app-shell").setAttribute("aria-hidden", "true");
  }

  function showLayerApp() {
    document.getElementById("splash-flow").classList.add("hidden");
    document.getElementById("wizard-flow").classList.add("hidden");
    document.getElementById("app-shell").classList.remove("hidden");
    document.getElementById("splash-flow").setAttribute("aria-hidden", "true");
    document.getElementById("wizard-flow").setAttribute("aria-hidden", "true");
    document.getElementById("app-shell").setAttribute("aria-hidden", "false");
    refreshAll();
    requestAnimationFrame(() => syncNavLiquidOrb());
  }

  function resetWizardFromProfile() {
    wizardStep = 1;
    draft = {
      skinType: profile.skinType,
      concerns: (profile.concerns || []).slice(0, 3),
      skinReaction: profile.skinReaction,
      nickname: typeof profile.nickname === "string" ? profile.nickname : "",
    };
    renderWizardStepsVisibility();
    updateWizardProgress();
    syncWizardUiFromDraft();
    validateWizardStep();
  }

  function initWizardDom() {
    const gridSkin = document.getElementById("grid-skin-type");
    gridSkin.innerHTML = SKIN_OPTIONS.map(
      (s) =>
        `<button type="button" class="ob-option" data-kind="skin" data-value="${escapeHtml(s)}">${escapeHtml(s)}</button>`
    ).join("");

    const gridConcern = document.getElementById("grid-concerns");
    gridConcern.innerHTML = CONCERN_OPTIONS.map(
      (s) =>
        `<button type="button" class="ob-option" data-kind="concern" data-value="${escapeHtml(s)}">${escapeHtml(s)}</button>`
    ).join("");

    const listReaction = document.getElementById("list-reaction");
    listReaction.innerHTML = REACTION_OPTIONS.map(
      (s) =>
        `<button type="button" class="ob-option ob-option--row" data-kind="reaction" data-value="${escapeHtml(s)}">
          <span class="ob-option__label">${escapeHtml(s)}</span>
          <span class="ob-option__check" aria-hidden="true"></span>
        </button>`
    ).join("");

    gridSkin.addEventListener("click", (e) => {
      const btn = e.target.closest(".ob-option");
      if (!btn || btn.getAttribute("data-kind") !== "skin") return;
      draft.skinType = btn.getAttribute("data-value");
      validateWizardStep();
      refreshWizardOptionsVisual();
    });

    gridConcern.addEventListener("click", (e) => {
      const btn = e.target.closest(".ob-option");
      if (!btn || btn.getAttribute("data-kind") !== "concern") return;
      const val = btn.getAttribute("data-value");
      const idx = draft.concerns.indexOf(val);
      if (idx >= 0) draft.concerns.splice(idx, 1);
      else if (draft.concerns.length < 3) draft.concerns.push(val);
      validateWizardStep();
      refreshWizardOptionsVisual();
    });

    listReaction.addEventListener("click", (e) => {
      const btn = e.target.closest(".ob-option");
      if (!btn || btn.getAttribute("data-kind") !== "reaction") return;
      draft.skinReaction = btn.getAttribute("data-value");
      validateWizardStep();
      refreshWizardOptionsVisual();
    });

    document.getElementById("btn-wizard-next").addEventListener("click", onWizardNext);
    document.getElementById("btn-wizard-back").addEventListener("click", onWizardBack);

    document.getElementById("input-wizard-nickname").addEventListener("input", (e) => {
      draft.nickname = /** @type {HTMLInputElement} */ (e.target).value;
      validateWizardStep();
    });
  }

  function syncWizardUiFromDraft() {
    document.getElementById("grid-skin-type").querySelectorAll(".ob-option").forEach((b) => {
      b.classList.toggle("ob-option--selected", b.getAttribute("data-value") === draft.skinType);
    });
    document.getElementById("grid-concerns").querySelectorAll(".ob-option").forEach((b) => {
      const v = b.getAttribute("data-value");
      b.classList.toggle("ob-option--selected", draft.concerns.includes(v));
    });
    document.getElementById("list-reaction").querySelectorAll(".ob-option").forEach((b) => {
      b.classList.toggle("ob-option--selected", b.getAttribute("data-value") === draft.skinReaction);
    });
    const nickInput = document.getElementById("input-wizard-nickname");
    if (nickInput) nickInput.value = draft.nickname ?? "";
    refreshWizardOptionsVisual();
  }

  /** 선택/비선택 스타일(비선택 딤) 동기화 */
  function refreshWizardOptionsVisual() {
    const skin = document.getElementById("grid-skin-type");
    const concern = document.getElementById("grid-concerns");
    const reaction = document.getElementById("list-reaction");

    if (wizardStep === 1) {
      const has = !!draft.skinType;
      skin.querySelectorAll(".ob-option").forEach((b) => {
        const sel = b.getAttribute("data-value") === draft.skinType;
        b.classList.toggle("ob-option--selected", sel);
        b.classList.toggle("ob-option--dim", has && !sel);
      });
    } else {
      skin.querySelectorAll(".ob-option").forEach((b) => b.classList.remove("ob-option--dim"));
    }

    if (wizardStep === 2) {
      const has = draft.concerns.length > 0;
      concern.querySelectorAll(".ob-option").forEach((b) => {
        const sel = draft.concerns.includes(b.getAttribute("data-value"));
        b.classList.toggle("ob-option--selected", sel);
        b.classList.toggle("ob-option--dim", has && !sel);
      });
    } else {
      concern.querySelectorAll(".ob-option").forEach((b) => b.classList.remove("ob-option--dim"));
    }

    if (wizardStep === 3) {
      const has = !!draft.skinReaction;
      reaction.querySelectorAll(".ob-option").forEach((b) => {
        const sel = b.getAttribute("data-value") === draft.skinReaction;
        b.classList.toggle("ob-option--selected", sel);
        b.classList.toggle("ob-option--dim", has && !sel);
      });
    } else {
      reaction.querySelectorAll(".ob-option").forEach((b) => b.classList.remove("ob-option--dim"));
    }
  }

  function renderWizardStepsVisibility() {
    document.querySelectorAll(".wizard-step").forEach((el) => {
      const step = Number(el.getAttribute("data-step"));
      el.classList.toggle("hidden", step !== wizardStep);
    });
    const nextBtn = document.getElementById("btn-wizard-next");
    nextBtn.textContent = wizardStep === 4 ? "시작하기" : "다음";
    const backBtn = document.getElementById("btn-wizard-back");
    backBtn.style.visibility = "visible";
    backBtn.disabled = false;
    refreshWizardOptionsVisual();
    if (wizardStep === 4) {
      const nickEl = document.getElementById("input-wizard-nickname");
      if (nickEl) nickEl.value = draft.nickname ?? "";
    }
  }

  function updateWizardProgress() {
    const fill = document.getElementById("wizard-progress-fill");
    const bar = document.getElementById("wizard-progress-bar");
    const stepEl = document.getElementById("wizard-progress-step");
    const pct = (100 * wizardStep) / 4;
    fill.style.width = `${pct}%`;
    bar.setAttribute("aria-valuenow", String(wizardStep));
    if (stepEl) stepEl.textContent = `${wizardStep} / 4`;
  }

  function validateWizardStep() {
    const nextBtn = document.getElementById("btn-wizard-next");
    let ok = false;
    if (wizardStep === 1) ok = !!draft.skinType;
    else if (wizardStep === 2) ok = draft.concerns.length >= 1 && draft.concerns.length <= 3;
    else if (wizardStep === 3) ok = !!draft.skinReaction;
    else ok = (draft.nickname || "").trim().length > 0;
    nextBtn.disabled = !ok;
  }

  function onWizardNext() {
    if (wizardStep < 4) {
      wizardStep += 1;
      renderWizardStepsVisibility();
      updateWizardProgress();
      validateWizardStep();
      document.getElementById("wizard-body").scrollTop = 0;
      return;
    }
    const nickname = (document.getElementById("input-wizard-nickname").value || "").trim();
    profile = {
      skinType: draft.skinType || profile.skinType,
      concerns: draft.concerns.length ? draft.concerns : profile.concerns,
      skinReaction: draft.skinReaction || profile.skinReaction,
      nickname,
      avatarDataUrl: profile.avatarDataUrl || "",
    };
    saveProfile(profile);
    wizardOpenedFromApp = false;
    showLayerApp();
  }

  function onWizardBack() {
    if (wizardStep === 1) {
      if (wizardOpenedFromApp) {
        wizardOpenedFromApp = false;
        showLayerApp();
      } else {
        showLayerSplash();
      }
      return;
    }
    wizardStep -= 1;
    renderWizardStepsVisibility();
    updateWizardProgress();
    validateWizardStep();
    document.getElementById("wizard-body").scrollTop = 0;
  }

  function initSplash() {
    document.getElementById("btn-splash-start").addEventListener("click", () => {
      draft = { skinType: null, concerns: [], skinReaction: null, nickname: "" };
      wizardStep = 1;
      renderWizardStepsVisibility();
      updateWizardProgress();
      syncWizardUiFromDraft();
      validateWizardStep();
      showLayerWizard();
    });
    document.getElementById("btn-login-hint").addEventListener("click", () => {
      /* 로그인은 과제 범위 외 — 클릭만 가능하도록 유지 */
    });
  }

  function openProfileEdit() {
    const overlay = document.getElementById("profile-edit-overlay");
    if (!overlay) return;

    document.getElementById("wizard-flow")?.classList.add("hidden");
    document.getElementById("wizard-flow")?.setAttribute("aria-hidden", "true");
    document.getElementById("splash-flow")?.classList.add("hidden");
    document.getElementById("splash-flow")?.setAttribute("aria-hidden", "true");
    document.getElementById("app-shell")?.classList.remove("hidden");
    document.getElementById("app-shell")?.setAttribute("aria-hidden", "false");

    profileEditDraft = {
      nickname: typeof profile.nickname === "string" ? profile.nickname : "",
      avatarDataUrl: profile.avatarDataUrl || "",
    };
    const nickInput = document.getElementById("input-profile-nickname");
    if (nickInput) nickInput.value = profileEditDraft.nickname;
    syncProfileAvatarUi(
      document.getElementById("profile-edit-avatar-img"),
      document.getElementById("profile-edit-avatar-initial"),
      profileEditDraft
    );
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    const saveBtn = document.getElementById("btn-save-profile-edit");
    if (saveBtn) saveBtn.disabled = !profileEditDraft.nickname.trim();
    nickInput?.focus();
  }

  function closeProfileEdit() {
    const overlay = document.getElementById("profile-edit-overlay");
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    const fileInput = document.getElementById("input-profile-avatar");
    if (fileInput) fileInput.value = "";
  }

  function saveProfileEdit() {
    const nickname = (document.getElementById("input-profile-nickname").value || "").trim();
    if (!nickname) return;
    profile = {
      ...profile,
      nickname,
      avatarDataUrl: profileEditDraft.avatarDataUrl || "",
    };
    saveProfile(profile);
    updateProfilePills();
    closeProfileEdit();
  }

  function initProfileEdit() {
    const btn = document.getElementById("btn-edit-profile");
    const overlay = document.getElementById("profile-edit-overlay");
    const closeBtn = document.getElementById("btn-close-profile-edit");
    const saveBtn = document.getElementById("btn-save-profile-edit");
    const changeAvatarBtn = document.getElementById("btn-change-avatar");
    const fileInput = document.getElementById("input-profile-avatar");
    const nickInput = document.getElementById("input-profile-nickname");

    if (!btn || !overlay || !closeBtn || !saveBtn || !changeAvatarBtn || !fileInput || !nickInput) {
      console.warn("프로필 수정 UI가 없어 연결하지 못했습니다.");
      return;
    }

    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openProfileEdit();
    });
    closeBtn.addEventListener("click", closeProfileEdit);
    saveBtn.addEventListener("click", saveProfileEdit);
    changeAvatarBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const file = /** @type {HTMLInputElement} */ (e.target).files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      if (file.size > 2 * 1024 * 1024) {
        alert("2MB 이하 이미지를 선택해 주세요.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        profileEditDraft.avatarDataUrl = typeof reader.result === "string" ? reader.result : "";
        syncProfileAvatarUi(
          document.getElementById("profile-edit-avatar-img"),
          document.getElementById("profile-edit-avatar-initial"),
          profileEditDraft
        );
      };
      reader.readAsDataURL(file);
    });
    overlay.addEventListener("click", (e) => {
      if (e.target.id === "profile-edit-overlay") closeProfileEdit();
    });
    nickInput.addEventListener("input", (e) => {
      profileEditDraft.nickname = /** @type {HTMLInputElement} */ (e.target).value;
      syncProfileAvatarUi(
        document.getElementById("profile-edit-avatar-img"),
        document.getElementById("profile-edit-avatar-initial"),
        profileEditDraft
      );
      saveBtn.disabled = !(profileEditDraft.nickname || "").trim();
    });
  }

  function refreshSkinEditVisual() {
    const gridSkin = document.getElementById("skin-edit-grid-type");
    const gridConcern = document.getElementById("skin-edit-grid-concerns");
    const listReaction = document.getElementById("skin-edit-list-reaction");
    if (!gridSkin || !gridConcern || !listReaction) return;

    const hasSkin = !!skinEditDraft.skinType;
    gridSkin.querySelectorAll(".ob-option").forEach((b) => {
      const sel = b.getAttribute("data-value") === skinEditDraft.skinType;
      b.classList.toggle("ob-option--selected", sel);
      b.classList.toggle("ob-option--dim", hasSkin && !sel);
    });

    const hasConcern = skinEditDraft.concerns.length > 0;
    gridConcern.querySelectorAll(".ob-option").forEach((b) => {
      const v = b.getAttribute("data-value");
      const sel = skinEditDraft.concerns.includes(v);
      b.classList.toggle("ob-option--selected", sel);
      b.classList.toggle("ob-option--dim", hasConcern && !sel);
    });

    const hasReaction = !!skinEditDraft.skinReaction;
    listReaction.querySelectorAll(".ob-option").forEach((b) => {
      const sel = b.getAttribute("data-value") === skinEditDraft.skinReaction;
      b.classList.toggle("ob-option--selected", sel);
      b.classList.toggle("ob-option--dim", hasReaction && !sel);
    });
  }

  function validateSkinEdit() {
    const saveBtn = document.getElementById("btn-save-skin-edit");
    if (!saveBtn) return;
    const ok =
      !!skinEditDraft.skinType &&
      skinEditDraft.concerns.length >= 1 &&
      skinEditDraft.concerns.length <= 3 &&
      !!skinEditDraft.skinReaction;
    saveBtn.disabled = !ok;
  }

  function initSkinEditDom() {
    const gridSkin = document.getElementById("skin-edit-grid-type");
    const gridConcern = document.getElementById("skin-edit-grid-concerns");
    const listReaction = document.getElementById("skin-edit-list-reaction");
    if (!gridSkin || !gridConcern || !listReaction) return;

    gridSkin.innerHTML = SKIN_OPTIONS.map(
      (s) =>
        `<button type="button" class="ob-option" data-kind="skin" data-value="${escapeHtml(s)}">${escapeHtml(s)}</button>`
    ).join("");

    gridConcern.innerHTML = CONCERN_OPTIONS.map(
      (s) =>
        `<button type="button" class="ob-option" data-kind="concern" data-value="${escapeHtml(s)}">${escapeHtml(s)}</button>`
    ).join("");

    listReaction.innerHTML = REACTION_OPTIONS.map(
      (s) =>
        `<button type="button" class="ob-option ob-option--row" data-kind="reaction" data-value="${escapeHtml(s)}">
          <span class="ob-option__label">${escapeHtml(s)}</span>
          <span class="ob-option__check" aria-hidden="true"></span>
        </button>`
    ).join("");

    gridSkin.addEventListener("click", (e) => {
      const btn = e.target.closest(".ob-option");
      if (!btn || btn.getAttribute("data-kind") !== "skin") return;
      skinEditDraft.skinType = btn.getAttribute("data-value");
      refreshSkinEditVisual();
      validateSkinEdit();
    });

    gridConcern.addEventListener("click", (e) => {
      const btn = e.target.closest(".ob-option");
      if (!btn || btn.getAttribute("data-kind") !== "concern") return;
      const val = btn.getAttribute("data-value");
      const idx = skinEditDraft.concerns.indexOf(val);
      if (idx >= 0) skinEditDraft.concerns.splice(idx, 1);
      else if (skinEditDraft.concerns.length < 3) skinEditDraft.concerns.push(val);
      refreshSkinEditVisual();
      validateSkinEdit();
    });

    listReaction.addEventListener("click", (e) => {
      const btn = e.target.closest(".ob-option");
      if (!btn || btn.getAttribute("data-kind") !== "reaction") return;
      skinEditDraft.skinReaction = btn.getAttribute("data-value");
      refreshSkinEditVisual();
      validateSkinEdit();
    });
  }

  function openSkinEdit() {
    const overlay = document.getElementById("skin-edit-overlay");
    if (!overlay) return;

    document.getElementById("wizard-flow")?.classList.add("hidden");
    document.getElementById("wizard-flow")?.setAttribute("aria-hidden", "true");
    document.getElementById("splash-flow")?.classList.add("hidden");
    document.getElementById("splash-flow")?.setAttribute("aria-hidden", "true");
    document.getElementById("app-shell")?.classList.remove("hidden");
    document.getElementById("app-shell")?.setAttribute("aria-hidden", "false");

    skinEditDraft = {
      skinType: profile.skinType || null,
      concerns: Array.isArray(profile.concerns) ? [...profile.concerns] : [],
      skinReaction: profile.skinReaction || null,
    };
    refreshSkinEditVisual();
    validateSkinEdit();
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeSkinEdit() {
    const overlay = document.getElementById("skin-edit-overlay");
    if (!overlay) return;
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
  }

  function saveSkinEdit() {
    if (
      !skinEditDraft.skinType ||
      skinEditDraft.concerns.length < 1 ||
      skinEditDraft.concerns.length > 3 ||
      !skinEditDraft.skinReaction
    ) {
      return;
    }
    profile = {
      ...profile,
      skinType: skinEditDraft.skinType,
      concerns: [...skinEditDraft.concerns],
      skinReaction: skinEditDraft.skinReaction,
    };
    saveProfile(profile);
    refreshAll();
    closeSkinEdit();
  }

  function initSkinEdit() {
    const btn = document.getElementById("btn-edit-skin");
    const overlay = document.getElementById("skin-edit-overlay");
    const closeBtn = document.getElementById("btn-close-skin-edit");
    const saveBtn = document.getElementById("btn-save-skin-edit");

    if (!btn || !overlay || !closeBtn || !saveBtn) {
      console.warn("피부 정보 수정 UI가 없어 연결하지 못했습니다.");
      return;
    }

    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    initSkinEditDom();
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSkinEdit();
    });
    closeBtn.addEventListener("click", closeSkinEdit);
    saveBtn.addEventListener("click", saveSkinEdit);
    overlay.addEventListener("click", (e) => {
      if (e.target.id === "skin-edit-overlay") closeSkinEdit();
    });
  }

  function refreshAll() {
    updateProfilePills();
    renderHome();
    renderCategory();
    renderReviewsFeed();
    renderMagazine();
    renderMyPage();
  }

  function updateProfilePills() {
    const skinEl = document.getElementById("mypage-skin");
    const concernEl = document.getElementById("mypage-concern");
    const reactionEl = document.getElementById("mypage-reaction");
    const nickEl = document.getElementById("mypage-nickname");
    if (!skinEl || !concernEl || !reactionEl || !nickEl) return;

    skinEl.textContent = profile.skinType;
    concernEl.textContent = (profile.concerns || []).join(", ") || "—";
    reactionEl.textContent = profile.skinReaction || "—";
    const nick = (profile.nickname || "").trim();
    nickEl.textContent = nick || "회원";
    syncProfileAvatarUi(
      document.getElementById("mypage-avatar-img"),
      document.getElementById("mypage-avatar-initial"),
      profile
    );
  }

  function homeRecommendHeadingHtml(skinType) {
    const label = (skinType || "").trim();
    if (!label || label === "잘 모르겠어요") {
      return `<span class="home-recommend-skin">비슷한 피부 타입</span>에게 신뢰도가 높은 제품`;
    }
    return `<span class="home-recommend-skin">${escapeHtml(label)}</span> 피부에게 신뢰도가 높은 제품`;
  }

  function productsForSkinRecommend(products, prof) {
    const mapped = mapSkinForInsights(prof.skinType);
    const withSkinReview = products.filter((p) =>
      (p.reviews || []).some((r) => r.skinType === mapped)
    );
    const withInsightOnly = products.filter(
      (p) => !withSkinReview.includes(p) && Boolean(p.insightsBySkin?.[mapped])
    );
    const pool = withSkinReview.length
      ? [...withSkinReview, ...withInsightOnly]
      : products;
    return pool
      .map((p) => ({ p, score: recommendScore(p, prof) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.p);
  }

  function renderHome() {
    const products = getProducts();
    const mount = document.getElementById("home-controversy");
    renderHomeInsightsCarousel(mount);

    const recommendTitle = document.getElementById("home-recommend-title");
    if (recommendTitle) {
      recommendTitle.innerHTML = homeRecommendHeadingHtml(profile.skinType);
    }

    const recommend = document.getElementById("home-recommend");
    const scored = productsForSkinRecommend(products, profile);
    recommend.innerHTML = scored
      .map((p) => taggedProductCardHtml(p, "", { showTrueCert: true }))
      .join("");

    renderHomePopularCarousel(document.getElementById("home-popular"), products);

    bindProductClicks(document.getElementById("view-home"));
  }

  function recommendScore(product, prof) {
    let s = product.popularityScore * 0.12;
    const mapped = mapSkinForInsights(prof.skinType);
    const insight = product.insightsBySkin?.[mapped] || "";
    if (insight) s += 18;
    const labels = (prof.concerns || []).map(mapConcernToReviewLabel);
    (product.reviews || []).forEach((r) => {
      if (r.skinType === mapped) s += 6;
      if (labels.includes(r.concern)) s += 8;
    });
    return s;
  }

  function reviewWrittenDate(review) {
    if (review.date) return review.date;
    const seed = [...String(review.id || "")].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const month = (seed % 5) + 1;
    const day = (seed % 27) + 1;
    return `2026.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
  }

  function adSuspicionColor(ad) {
    const t = Math.max(0, Math.min(1, ad / 100));
    let r;
    let g;
    let b;
    if (t <= 0.5) {
      const u = t / 0.5;
      r = Math.round(20 + u * (245 - 20));
      g = Math.round(150 + u * (168 - 150));
      b = Math.round(225 + u * (50 - 225));
    } else {
      const u = (t - 0.5) / 0.5;
      r = Math.round(245 + u * (214 - 245));
      g = Math.round(168 - u * 118);
      b = Math.round(50 - u * 50);
    }
    return `rgb(${r}, ${g}, ${b})`;
  }

  function reviewAdMeterHtml(ad) {
    const color = adSuspicionColor(ad);
    return `
      <div class="review-ad-meter" role="img" aria-label="광고 의심 ${ad}%">
        <span class="review-ad-meter__label">광고 의심</span>
        <div class="review-ad-meter__track" aria-hidden="true">
          <span class="review-ad-meter__fill" style="width:${ad}%;background:${color}"></span>
        </div>
        <span class="review-ad-meter__value" style="color:${color}">${ad}%</span>
      </div>`;
  }

  function reviewProConHtml(product, hintsPos, hintsNeg) {
    const themes = product.realUserThemes || {};
    const proItems = hintsPos.length
      ? hintsPos.slice(0, 2).map((h) => `${h} 관련 표현이 리뷰에서 반복 확인됨`)
      : (themes.positive || []).slice(0, 2);
    const conItems = hintsNeg.length
      ? hintsNeg.slice(0, 2).map((h) => `${h} 관련 우려가 함께 언급됨`)
      : (themes.negative || []).slice(0, 2);
    if (!proItems.length) proItems.push("명확한 긍정 키워드는 적지만 사용감 언급은 전반적으로 긍정적");
    if (!conItems.length) conItems.push("부정 힌트는 낮으나 피부 타입별 편차는 있을 수 있음");

    const proLis = proItems.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
    const conLis = conItems.map((line) => `<li>${escapeHtml(line)}</li>`).join("");

    return `
      <div class="procon review-card__procon">
        <div class="procon__col procon__col--pro">
          <div class="procon__label">장점 추출</div>
          <ul class="procon__list">${proLis}</ul>
        </div>
        <div class="procon__col procon__col--con">
          <div class="procon__label">단점 추출</div>
          <ul class="procon__list">${conLis}</ul>
        </div>
      </div>`;
  }

  function renderReviewsFeed() {
    const feed = document.getElementById("reviews-feed");
    const items = [];
    getProducts().forEach((p) => {
      (p.reviews || []).forEach((r) => {
        const a = analyzeReview(r);
        if (a.trustScore >= 70) {
          items.push({ product: p, review: r, analysis: a });
        }
      });
    });
    items.sort((a, b) => b.analysis.trustScore - a.analysis.trustScore);

    feed.innerHTML = items
      .map(({ product, review, analysis }) => {
        const hintsNeg = detectHints(review.text, NEGATIVE_HINTS);
        const hintsPos = detectHints(review.text, POSITIVE_HINTS);
        const tags = [
          review.skinType,
          review.concern,
          ...hintsPos,
          ...hintsNeg.map((h) => `${h} 이슈`),
        ].filter(Boolean);
        const tagHtml = tags
          .map((label) => `<span class="tag${String(label).includes("이슈") ? " tag--risk" : ""}">${escapeHtml(label)}</span>`)
          .join("");
        return `
        <article class="review-card glass-panel" data-open-product="${product.id}" role="link" tabindex="0">
          <div class="review-card__top">
            <div class="review-card__media">
              <img src="${escapeHtml(product.image)}" alt="" width="144" height="144" loading="lazy" decoding="async" />
            </div>
            <div class="review-card__head">
              <p class="review-card__product">${escapeHtml(product.name)}</p>
              ${reviewAdMeterHtml(analysis.adSuspicion)}
            </div>
          </div>
          <div class="review-card__comment">
            <p class="review-card__text">${escapeHtml(review.text)}</p>
            <time class="review-card__date" datetime="${reviewWrittenDate(review)}">${reviewWrittenDate(review)}</time>
          </div>
          <div class="tag-row review-card__tags">${tagHtml}</div>
          ${reviewProConHtml(product, hintsPos, hintsNeg)}
        </article>`;
      })
      .join("");

    bindProductClicks(feed);
    feed.querySelectorAll(".review-card[data-open-product]").forEach((card) => {
      card.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        openProductDetail(card.getAttribute("data-open-product"));
      });
    });
  }

  function renderMagazine() {
    const grid = document.getElementById("magazine-grid");
    const mapped = mapSkinForInsights(profile.skinType);
    const articles = [...getMagazine()]
      .filter((a) => a.id !== "mag-today-controversy")
      .sort((a, b) => {
        const ma = a.skinTypes.includes(mapped) ? 1 : 0;
        const mb = b.skinTypes.includes(mapped) ? 1 : 0;
        return mb - ma;
      });
    grid.innerHTML = articles
      .map((a) => {
        const meta = magazineCardMeta(a);
        const skins = a.skinTypes.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("");
        return `
        <article class="mag-card glass-panel mag-card--clickable" data-mag-article="${escapeHtml(a.id)}" role="button" tabindex="0">
          <div class="mag-card__tag">${escapeHtml(a.tag)}</div>
          <h3 class="mag-card__title">${escapeHtml(meta.title)}</h3>
          <p class="body-text muted" style="margin:0 0 10px">${escapeHtml(meta.excerpt)}</p>
          <div class="tag-row">${skins}</div>
        </article>`;
      })
      .join("");
    renderMagazineControversyAnalysis();
  }

  function renderMagazineControversyAnalysis() {
    const mount = document.getElementById("mag-controversy-analysis");
    if (!mount) return;

    const raw = getMagazineArticleById("mag-today-controversy");

    const meta = magazineCardMeta(raw);
    const skins = (raw.skinTypes || []).map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("");

    mount.innerHTML = `
    <article class="mag-card glass-panel mag-card--clickable" data-mag-article="mag-today-controversy" role="button" tabindex="0">
      <div class="mag-card__tag">${escapeHtml(raw.tag)}</div>
      <h3 class="mag-card__title">${escapeHtml(meta.title)}</h3>
      <p class="body-text muted" style="margin:0 0 10px">${escapeHtml(meta.excerpt)}</p>
      <div class="tag-row">${skins}</div>
    </article>`;
  }

  function renderMyPage() {
    const savedIds = loadIdList(STORAGE_SAVED);
    const recentIds = loadIdList(STORAGE_RECENT);

    const savedEl = document.getElementById("saved-list");
    if (!savedIds.length) {
      savedEl.innerHTML = `<div class="empty-state">저장한 제품이 없습니다. 상세 화면에서 ♡를 눌러 저장해 보세요.</div>`;
    } else {
      savedEl.innerHTML = savedIds
        .map((id) => getProductById(id))
        .filter(Boolean)
        .map((p) => taggedProductCardHtml(p))
        .join("");
      bindProductClicks(savedEl);
    }

    const recentEl = document.getElementById("recent-list");
    if (!recentIds.length) {
      recentEl.innerHTML = `<div class="empty-state">최근 본 제품이 없습니다.</div>`;
    } else {
      recentEl.innerHTML = recentIds
        .map((id) => getProductById(id))
        .filter(Boolean)
        .map((p) => taggedProductCardHtml(p))
        .join("");
      bindProductClicks(recentEl);
    }
  }

  function bindProductClicks(root) {
    if (!root) return;
    root.querySelectorAll("[data-open-product]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (e.target.closest("button, a")) return;
        openProductDetail(btn.getAttribute("data-open-product"));
      });
    });
    root.querySelectorAll(".product-card[data-product-id]").forEach((btn) => {
      btn.addEventListener("click", () => openProductPreview(btn.getAttribute("data-product-id")));
    });
  }

  function pushRecent(id) {
    let ids = loadIdList(STORAGE_RECENT).filter((x) => x !== id);
    ids.unshift(id);
    saveIdList(STORAGE_RECENT, ids);
  }

  function toggleSaved(id) {
    let ids = loadIdList(STORAGE_SAVED);
    if (ids.includes(id)) ids = ids.filter((x) => x !== id);
    else ids.unshift(id);
    saveIdList(STORAGE_SAVED, ids);
    return ids.includes(id);
  }

  /* ---------- 제품 상세 ---------- */

  const SHOP_NAMES = ["지그재그", "무신사", "쿠팡", "올리브영"];
  const PD_SKIN_TABS = ["지성", "건성", "민감성", "복합성"];

  /** 결정적 mock 가격: popularityScore 기반 */
  function buildMockShops(p) {
    const seed = (p.popularityScore || 80) + (p.id ? p.id.charCodeAt(p.id.length - 1) : 0);
    const base = 38000 + (seed % 20) * 80;
    const offsets = [0, 2830, 2620, 12000];
    const list = SHOP_NAMES.map((name, i) => ({
      name,
      price: base + offsets[i],
      lowest: i === 0,
    }));
    return list;
  }

  /** 결정적 mock 가격 추이: 7포인트 */
  function buildMockTrend(p) {
    const seed = (p.popularityScore || 80) + (p.id ? p.id.length : 1);
    const base = 19010;
    const points = [];
    for (let i = 0; i < 7; i += 1) {
      const wave = Math.sin((seed + i * 1.3) * 0.9) * 1200;
      points.push(Math.round(base + wave));
    }
    return points;
  }

  function brandFromName(name) {
    return (name || "").split(" ")[0] || "트루뷰티";
  }

  function productNameWithoutBrand(name) {
    const brand = brandFromName(name);
    const rest = (name || "").slice(brand.length).trim();
    return rest || name || "";
  }

  function getProductsByBrand(brand) {
    return getProducts().filter((p) => brandFromName(p.name) === brand);
  }

  function openBrandShop(brand) {
    const products = getProductsByBrand(brand);
    const titleEl = document.getElementById("brand-shop-title");
    const content = document.getElementById("brand-shop-content");
    if (!titleEl || !content) return;

    titleEl.textContent = `${brand} 브랜드관`;
    content.innerHTML = `
      <article class="brand-shop">
        <div class="pd-brand brand-shop__hero">
          <div class="pd-brand__logo" aria-hidden="true">${escapeHtml(brand.slice(0, 2))}</div>
          <div class="pd-brand__info">
            <p class="pd-brand__name">${escapeHtml(brand)}</p>
            <p class="pd-brand__desc">피부학적 진정성을 담은 메디 뷰티</p>
          </div>
          <div class="pd-brand__like" aria-label="좋아요 수">
            <span class="pd-brand__heart" aria-hidden="true">♡</span>
            <span>1,405</span>
          </div>
        </div>
        <section class="brand-shop__section">
          <header class="brand-shop__head">
            <h3>브랜드 제품</h3>
            <span class="brand-shop__count">${products.length}개</span>
          </header>
          <div class="card-grid brand-shop__grid">
            ${products.map((p) => taggedProductCardHtml(p)).join("") || `<div class="empty-state">등록된 제품이 없습니다.</div>`}
          </div>
        </section>
      </article>`;

    bindProductClicks(content);

    const overlay = document.getElementById("brand-shop");
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    content.scrollTop = 0;
  }

  function closeBrandShop() {
    const overlay = document.getElementById("brand-shop");
    if (!overlay) return;
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
  }

  function bindBrandShopClicks(root) {
    if (!root) return;
    root.querySelectorAll("[data-open-brand]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const brand = btn.getAttribute("data-open-brand");
        if (brand) openBrandShop(brand);
      });
    });
  }

  function fmtPrice(n) {
    return n.toLocaleString("ko-KR") + "원";
  }

  /** SVG 라인 차트 (price trend) */
  function trendChartSvg(points) {
    if (!points.length) return "";
    const W = 312;
    const H = 130;
    const padX = 16;
    const padY = 24;
    const min = Math.min.apply(null, points);
    const max = Math.max.apply(null, points);
    const span = Math.max(1, max - min);
    const stepX = (W - padX * 2) / (points.length - 1);
    const coords = points.map((v, i) => {
      const x = padX + i * stepX;
      const y = padY + (1 - (v - min) / span) * (H - padY * 2);
      return { x, y, v };
    });
    const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)} ${H - padY} L${coords[0].x.toFixed(1)} ${H - padY} Z`;
    const peak = coords[Math.floor(coords.length / 2)];
    const dots = coords
      .map((c) => `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="3" fill="#1496e1"/>`)
      .join("");
    return `
      <svg class="pd-chart" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="최저가 추이">
        <defs>
          <linearGradient id="pdChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7ed4ff" stop-opacity="0.38"/>
            <stop offset="100%" stop-color="#afe4fe" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#pdChartFill)"/>
        <path d="${linePath}" fill="none" stroke="#5cb4f5" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        ${dots}
        <g class="pd-chart__peak">
          <rect x="${(peak.x - 30).toFixed(1)}" y="${(peak.y - 26).toFixed(1)}" width="60" height="20" rx="10" fill="#1496e1"/>
          <text x="${peak.x.toFixed(1)}" y="${(peak.y - 12).toFixed(1)}" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700">${fmtPrice(peak.v)}</text>
        </g>
      </svg>`;
  }

  /** 결정적 mock — 제품 5축 속성 점수 (보습/진정/저자극/발림성/지속력) */
  function productAttributeScores(p) {
    const baseSeed = (p.popularityScore || 80) + (p.id ? p.id.charCodeAt(p.id.length - 1) : 0);
    const pos = (p.realUserThemes?.positive || []).join(" ");
    const neg = (p.realUserThemes?.negative || []).join(" ");
    const claims = (p.marketingClaims || []).join(" ");
    const allPos = pos + " " + claims;

    function score(boost, penalty, offset) {
      let v = 56 + (baseSeed % 14);
      boost.forEach((h) => {
        if (allPos.includes(h)) v += 11;
      });
      penalty.forEach((h) => {
        if (neg.includes(h)) v -= 13;
      });
      v += offset;
      return Math.max(22, Math.min(95, Math.round(v)));
    }

    return [
      { axis: "보습", value: score(["보습", "촉촉", "히알루"], ["건조"], 0) },
      { axis: "진정", value: score(["진정", "저자극", "순함"], ["따가움", "자극"], -2) },
      { axis: "저자극", value: score(["저자극", "순함", "민감"], ["따가움", "자극", "건조"], 0) },
      { axis: "발림성", value: score(["가벼움", "발림", "얇게", "산뜻"], ["무거움", "뻑뻑"], 4) },
      { axis: "지속력", value: score(["지속", "24시간", "오래"], ["묻어남", "무너짐"], 2) },
    ];
  }

  /** 5축 레이더 차트 */
  function radarChartSvg(data) {
    const W = 280;
    const H = 224;
    const cx = W / 2;
    const cy = H / 2 + 4;
    const radius = 78;
    const N = data.length;
    const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / N;

    const ringPolys = [0.25, 0.5, 0.75, 1]
      .map((r) => {
        const pts = data
          .map((_, i) => {
            const a = angle(i);
            return `${(cx + Math.cos(a) * radius * r).toFixed(1)},${(cy + Math.sin(a) * radius * r).toFixed(1)}`;
          })
          .join(" ");
        const stroke = r === 1 ? "#cfdce6" : "#e8eef3";
        return `<polygon points="${pts}" fill="${r === 0.25 ? "#f8fbfd" : "none"}" stroke="${stroke}" stroke-width="1"/>`;
      })
      .join("");

    const axisLines = data
      .map((_, i) => {
        const a = angle(i);
        return `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * radius).toFixed(1)}" y2="${(cy + Math.sin(a) * radius).toFixed(1)}" stroke="#e3eaf0" stroke-width="1"/>`;
      })
      .join("");

    const dataPts = data.map((d, i) => {
      const a = angle(i);
      const r = (Math.max(0, Math.min(100, d.value)) / 100) * radius;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
    });
    const polyPts = dataPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const dots = dataPts
      .map(
        (p) =>
          `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#1496e1" stroke="#ffffff" stroke-width="1.5"/>`
      )
      .join("");

    const labels = data
      .map((d, i) => {
        const a = angle(i);
        const lr = radius + 18;
        const x = cx + Math.cos(a) * lr;
        const y = cy + Math.sin(a) * lr + 4;
        return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#444">${escapeHtml(d.axis)}</text>`;
      })
      .join("");

    return `
      <svg class="pd-radar" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="제품 속성 레이더 차트">
        ${ringPolys}
        ${axisLines}
        <polygon points="${polyPts}" fill="rgba(20,150,225,0.22)" stroke="#1496e1" stroke-width="2" stroke-linejoin="round"/>
        ${dots}
        ${labels}
      </svg>`;
  }

  /** 도넛 차트 — 피부 타입 분포 */
  function donutChartSvg(slices, total) {
    const W = 140;
    const H = 140;
    const cx = W / 2;
    const cy = H / 2;
    const r = 50;
    const c = 2 * Math.PI * r;
    let cumulative = 0;
    const segs = slices
      .map((s) => {
        const frac = total ? s.value / total : 0;
        const len = c * frac;
        const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="14"
          stroke-dasharray="${len.toFixed(2)} ${(c - len).toFixed(2)}"
          stroke-dashoffset="${(-cumulative).toFixed(2)}"
          transform="rotate(-90 ${cx} ${cy})"/>`;
        cumulative += len;
        return seg;
      })
      .join("");
    const totalLabel = total > 0 ? total : "—";
    return `
      <svg class="pd-donut" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="피부 타입별 리뷰 분포">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f1f4f7" stroke-width="14"/>
        ${segs}
        <text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="20" font-weight="800" fill="#111">${totalLabel}</text>
        <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="9" fill="#888">총 리뷰</text>
      </svg>`;
  }

  /** 피부 타입별 리뷰 분포 + 만족도 (스택 바) */
  function buildSkinDistribution(p) {
    const colors = {
      지성: "#1496e1",
      건성: "#7bc6e9",
      민감성: "#ff7b7b",
      복합성: "#9ad59a",
    };
    const types = ["지성", "건성", "민감성", "복합성"];
    const reviews = p.reviews || [];
    const counts = {};
    types.forEach((t) => (counts[t] = 0));
    reviews.forEach((r) => {
      if (counts[r.skinType] != null) counts[r.skinType] += 1;
    });

    const realTotal = types.reduce((a, t) => a + counts[t], 0);
    if (realTotal === 0) {
      const seed = (p.popularityScore || 80) + (p.id ? p.id.length : 1);
      const mocks = [
        Math.max(8, (seed * 3) % 26 + 14),
        Math.max(6, (seed * 5) % 22 + 10),
        Math.max(4, (seed * 7) % 18 + 6),
        Math.max(8, (seed * 11) % 24 + 12),
      ];
      types.forEach((t, i) => (counts[t] = mocks[i]));
    }
    const total = types.reduce((a, t) => a + counts[t], 0);

    const slices = types.map((t) => ({
      label: t,
      value: counts[t],
      color: colors[t],
    }));

    const sentiment = types.map((t) => {
      const rs = reviews.filter((r) => r.skinType === t);
      let pos;
      if (rs.length) {
        let acc = 0;
        rs.forEach((r) => {
          acc += analyzeReviewText(r.text).trustScore;
        });
        pos = Math.round(acc / rs.length);
      } else {
        const seed = (p.popularityScore || 80) + t.length;
        pos = 60 + (seed % 26);
      }
      pos = Math.max(20, Math.min(95, pos));
      return { skin: t, color: colors[t], pos, neg: 100 - pos, count: counts[t] };
    });

    return { slices, total, sentiment };
  }

  /** 신뢰 점수 원형 게이지 (90% 스타일) */
  function trustGaugeSvg(score) {
    const r = 40;
    const c = 2 * Math.PI * r;
    const filled = (Math.max(0, Math.min(100, score)) / 100) * c;
    return `
      <svg class="pd-gauge" viewBox="0 0 100 100" width="96" height="96" role="img" aria-label="신뢰도 ${score}%">
        <defs>
          <linearGradient id="pdGaugeStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#afe4fe"/>
            <stop offset="50%" stop-color="#7ed4ff"/>
            <stop offset="100%" stop-color="#5cb4f5"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="#e6f4fc" stroke-width="10"/>
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="url(#pdGaugeStroke)" stroke-width="10"
                stroke-linecap="round" stroke-dasharray="${filled.toFixed(2)} ${c.toFixed(2)}"
                transform="rotate(-90 50 50)"/>
        <text x="50" y="48" text-anchor="middle" font-size="22" font-weight="800" fill="#1496e1">${score}%</text>
        <text x="50" y="66" text-anchor="middle" font-size="9" fill="#888888">신뢰</text>
      </svg>`;
  }

  function buildBarRow(label, pct, neg) {
    const cls = neg ? "pd-bar pd-bar--neg" : "pd-bar";
    return `
      <div class="${cls}">
        <span class="pd-bar__label">${escapeHtml(label)}</span>
        <div class="pd-bar__track"><div class="pd-bar__fill" style="width:${pct}%"></div></div>
        <span class="pd-bar__value">${pct}%</span>
      </div>`;
  }

  function buildProsCons(p) {
    const themes = p.realUserThemes || {};
    const posList = (themes.positive || []).slice(0, 3);
    const negList = (themes.negative || []).concat(themes.risks || []).slice(0, 3);
    const posPcts = [44, 33, 16];
    const negPcts = [14, 12, 7];
    while (posList.length < 3) posList.push("긍정 키워드 데이터 수집 중");
    while (negList.length < 3) negList.push("부정 키워드 데이터 수집 중");
    return {
      pros: posList.map((t, i) => buildBarRow(t, posPcts[i], false)).join(""),
      cons: negList.map((t, i) => buildBarRow(t, negPcts[i], true)).join(""),
    };
  }

  function buildSkinInsightCase(p, skin) {
    const txt = p.insightsBySkin?.[skin] || "해당 피부 타입 후기 샘플이 적습니다.";
    const negHints = (p.realUserThemes?.negative || []).slice(0, 1);
    return {
      summary: txt,
      risk: negHints[0] || "특이 부정 리스크는 낮은 편입니다.",
    };
  }

  function renderPdSkinInsight(p, skin) {
    const wrap = document.getElementById("pd-skin-content");
    if (!wrap) return;
    const data = buildSkinInsightCase(p, skin);
    wrap.innerHTML = `
      <p class="pd-skin__h">${escapeHtml(skin)} 케이스 요약</p>
      <p class="pd-skin__body">${escapeHtml(data.summary)}</p>
      <div class="pd-warning">
        <strong>⚠ 부정 리스크 강조</strong>
        <p>${escapeHtml(data.risk)}</p>
      </div>`;
    document.querySelectorAll("#pd-skin-tabs .pd-chip").forEach((b) => {
      b.classList.toggle("pd-chip--active", b.getAttribute("data-skin") === skin);
    });
  }

  /** 상세 — 실제 사용자 경험: 긍정/부정 테마 구분 */
  function buildPdRealUserThemesHtml(p) {
    const pos = p.realUserThemes?.positive || [];
    const neg = p.realUserThemes?.negative || [];
    const posLis = pos.length
      ? pos.map((t) => `<li>${escapeHtml(t)}</li>`).join("")
      : "<li>수집된 긍정 테마가 없습니다</li>";
    const negLis = neg.length
      ? neg.map((t) => `<li>${escapeHtml(t)}</li>`).join("")
      : "<li>수집된 부정 테마가 없습니다</li>";
    return `
      <div class="pd-theme-block">
        <p class="pd-theme-block__title">긍정 테마</p>
        <ul class="pd-theme-list">${posLis}</ul>
      </div>
      <div class="pd-theme-block pd-theme-block--neg">
        <p class="pd-theme-block__title">부정 테마</p>
        <ul class="pd-theme-list">${negLis}</ul>
      </div>`;
  }

  /* ---------- 제품 미리보기 (Bottom Sheet) ---------- */

  let previewCurrentId = null;

  function buildProductPreviewHtml(p) {
    const mappedSkin = mapSkinForInsights(profile.skinType);
    const insight =
      p.insightsBySkin?.[mappedSkin] ||
      p.insightsBySkin?.["복합성"] ||
      "선택한 피부 타입에 대한 요약 인사이트가 준비 중입니다.";

    const pos = (p.realUserThemes?.positive || []).slice(0, 2);
    const risks = [
      ...(p.realUserThemes?.negative || []).slice(0, 2),
      ...(p.realUserThemes?.risks || []).slice(0, 1),
    ].slice(0, 2);

    const posLis = pos.length
      ? pos.map((t) => `<li>${escapeHtml(t)}</li>`).join("")
      : "<li>수집된 장점 없음</li>";
    const riskLis = risks.length
      ? risks.map((t) => `<li>${escapeHtml(t)}</li>`).join("")
      : "<li>수집된 리스크 없음</li>";

    return `
      <article class="preview-card">
        <header class="preview-hero">
          <div class="preview-hero__media">
            <img src="${escapeHtml(p.image)}" alt="" width="160" height="160" loading="lazy" decoding="async" />
          </div>
          <h3 class="preview-name" id="preview-name">${escapeHtml(p.name)}</h3>
        </header>

        <section class="preview-section preview-section--insight" aria-label="인사이트">
          <h4 class="preview-section__title">인사이트</h4>
          <p class="preview-section__text">${escapeHtml(insight)}</p>
        </section>

        <div class="preview-facts">
          <section class="preview-section preview-section--pros" aria-label="장점">
            <h4 class="preview-section__title">장점</h4>
            <ul class="preview-section__list">${posLis}</ul>
          </section>
          <section class="preview-section preview-section--risks" aria-label="리스크">
            <h4 class="preview-section__title">리스크</h4>
            <ul class="preview-section__list">${riskLis}</ul>
          </section>
        </div>
      </article>
    `;
  }

  function openProductPreview(id) {
    const p = getProductById(id);
    if (!p) return;

    previewCurrentId = id;

    const content = document.getElementById("preview-content");
    if (content) {
      content.innerHTML = buildProductPreviewHtml(p);
      content.scrollTop = 0;
    }

    const overlay = document.getElementById("product-preview");
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeProductPreview() {
    const overlay = document.getElementById("product-preview");
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    previewCurrentId = null;
  }

  function openProductDetail(id) {
    const p = getProductById(id);
    if (!p) return;
    closeBrandShop();
    pushRecent(id);

    const mappedSkin = mapSkinForInsights(profile.skinType);
    const agg = aggregateProductTrust(p);
    const brand = brandFromName(p.name);
    const shops = buildMockShops(p);
    const trend = buildMockTrend(p);
    const procons = buildProsCons(p);
    const decisionAnswer = matchDecision(p, profile);
    const attrs = productAttributeScores(p);
    const dist = buildSkinDistribution(p);
    const reviewCount = (p.reviews || []).length || dist.total;
    const popularity = p.popularityScore || 80;
    const trustHeadline =
      p.trustHeadline ||
      "저자극·보습 관련 사용자 서술이 구체적이고 일관되어 신뢰도가 높습니다.";
    const trustWarning =
      p.trustWarning || "무거운 레이어링은 지성에게 부담될 수 있습니다.";

    document.getElementById("pd-topbar-title").textContent = productNameWithoutBrand(p.name);

    const kpiItems = [
      { label: "신뢰도", value: `${agg.trustScore}%`, hint: "높을수록 신뢰", tone: "pos", pct: agg.trustScore },
      { label: "광고 의심", value: `${agg.adSuspicion}%`, hint: "낮을수록 안전", tone: "neg", pct: agg.adSuspicion },
      { label: "리뷰 수", value: `${reviewCount}건`, hint: "분석 대상", tone: "info", pct: Math.min(100, reviewCount * 4 + 28) },
      { label: "인기도", value: `${popularity}점`, hint: "카테고리 내", tone: "accent", pct: popularity },
    ];
    const kpiHtml = `
      <div class="pd-kpi-grid">
        ${kpiItems
          .map(
            (it) => `
          <div class="pd-kpi pd-kpi--${it.tone}">
            <span class="pd-kpi__label">${escapeHtml(it.label)}</span>
            <span class="pd-kpi__value">${escapeHtml(it.value)}</span>
            <div class="pd-kpi__bar"><span style="width:${it.pct}%"></span></div>
            <span class="pd-kpi__hint">${escapeHtml(it.hint)}</span>
          </div>`
          )
          .join("")}
      </div>`;

    const radarLegendHtml = `
      <ul class="pd-radar-legend">
        ${attrs
          .map(
            (a) =>
              `<li><span class="pd-radar-legend__dot" aria-hidden="true"></span><span class="pd-radar-legend__label">${escapeHtml(a.axis)}</span><strong>${a.value}</strong></li>`
          )
          .join("")}
      </ul>`;

    const donutLegendHtml = `
      <ul class="pd-donut-legend">
        ${dist.slices
          .map((s) => {
            const pct = dist.total ? Math.round((s.value / dist.total) * 100) : 0;
            return `
              <li>
                <span class="pd-donut-legend__dot" style="background:${s.color}"></span>
                <span class="pd-donut-legend__label">${escapeHtml(s.label)}</span>
                <span class="pd-donut-legend__pct">${pct}%</span>
                <span class="pd-donut-legend__count">${s.value}건</span>
              </li>`;
          })
          .join("")}
      </ul>`;

    const stackBarsHtml = `
      <ul class="pd-stack-list">
        ${dist.sentiment
          .map(
            (row) => `
          <li class="pd-stack-row">
            <span class="pd-stack-row__label" style="--pd-skin-color:${row.color}">${escapeHtml(row.skin)}</span>
            <div class="pd-stack-row__track" role="img" aria-label="${escapeHtml(row.skin)} 만족도 ${row.pos}%">
              <span class="pd-stack-row__pos" style="width:${row.pos}%"></span>
              <span class="pd-stack-row__neg" style="width:${row.neg}%"></span>
            </div>
            <span class="pd-stack-row__value">${row.pos}%</span>
          </li>`
          )
          .join("")}
      </ul>`;

    const trueCertRibbon = isProductTrueCertified(p)
      ? `<div class="pd-ribbon" aria-hidden="true"><span class="pd-ribbon__inner">트루<br/>인증</span></div>`
      : "";

    const html = `
      <article class="pd">
        <section class="pd-hero">
          ${trueCertRibbon}
          <div class="pd-hero__photo product-showcase__media">
            <img src="${p.image}" alt="${escapeHtml(p.name)} 제품 사진" loading="lazy" decoding="async" />
          </div>
        </section>

        <section class="pd-naming">
          <button type="button" class="pd-naming__brand" data-open-brand="${escapeHtml(brand)}">
            ${escapeHtml(brand)} <span class="pd-naming__brand-chevron" aria-hidden="true">&gt;</span>
          </button>
          <h3 class="pd-naming__product">${escapeHtml(productNameWithoutBrand(p.name))}</h3>
          <div class="pd-trustbanner">
            <span class="pd-trustbanner__icon" aria-hidden="true">✓</span>
            <div class="pd-trustbanner__body">
              <p>${escapeHtml(trustHeadline)}</p>
              <p class="pd-trustbanner__warn">${escapeHtml(trustWarning)}</p>
            </div>
          </div>
          ${kpiHtml}
        </section>

        <section class="pd-section">
          <header class="pd-section__head">
            <h3>판매처</h3>
            <span class="pd-section__sub">최저가순</span>
          </header>
          <ul class="pd-shop-list">
            ${shops
              .map(
                (s) => `
              <li class="pd-shop-row">
                <span class="pd-shop-row__name">${escapeHtml(s.name)}</span>
                <span class="pd-shop-row__price ${s.lowest ? "is-lowest" : ""}">${
                  s.lowest ? '<span class="pd-shop-row__tag">최저</span>' : ""
                }${fmtPrice(s.price)}</span>
              </li>`
              )
              .join("")}
          </ul>
        </section>

        <section class="pd-section">
          <header class="pd-section__head">
            <h3>쇼핑 인사이트</h3>
          </header>
          <div class="pd-pill-tabs" role="tablist">
            <button type="button" class="pd-pill pd-pill--active" role="tab" aria-selected="true">최저가 추이</button>
            <button type="button" class="pd-pill" role="tab" aria-selected="false">연령·성별 인기도</button>
          </div>
          <div class="pd-range-tabs">
            <button type="button" class="pd-range pd-range--active">2주</button>
            <button type="button" class="pd-range">1개월</button>
            <button type="button" class="pd-range">3개월</button>
            <button type="button" class="pd-range">6개월</button>
          </div>
          <div class="pd-chart-wrap">
            ${trendChartSvg(trend)}
            <div class="pd-chart-axis">
              <span>4.30</span><span>5.2</span><span>5.4</span><span>5.6</span><span>5.8</span><span>5.10</span><span>5.12</span>
            </div>
            <p class="pd-chart-note">2026.01.08. 이후 데이터를 제공합니다. <span aria-hidden="true">ⓘ</span></p>
          </div>
        </section>

        <section class="pd-section pd-analytics">
          <header class="pd-section__head">
            <h3>AI 리뷰 요약</h3>
          </header>

          <div class="pd-card pd-card--soft">
            <p class="pd-card__eyebrow">나에게 적합할까요?</p>
            <p class="pd-decision">${escapeHtml(decisionAnswer)}</p>
            <ul class="pd-decision-list">
              <li>피부에 잘 맞는 성분 비중: <strong>${agg.trustScore}%</strong></li>
              <li>같은 피부 타입 사용자 후기 보유: <strong>${Math.max(36, agg.trustScore - 4)}건 (양호)</strong></li>
              <li>핀 픽업 신호 데이터 기반 분석 결과: <strong>${Math.max(40, 100 - agg.adSuspicion)}점 (우수)</strong></li>
            </ul>
          </div>

          <div class="pd-card">
            <p class="pd-card__eyebrow">제품 속성 분석</p>
            <p class="pd-card__sub">사용자 후기 키워드와 마케팅 주장을 5축으로 정량화했습니다.</p>
            <div class="pd-radar-grid">
              <div class="pd-radar-wrap">${radarChartSvg(attrs)}</div>
              ${radarLegendHtml}
            </div>
          </div>

          <div class="pd-card">
            <p class="pd-card__eyebrow">피부 타입별 리뷰 분포 & 만족도</p>
            <p class="pd-card__sub">분석 대상 후기를 피부 타입별로 분리해 분포와 만족도를 함께 보여줍니다.</p>
            <div class="pd-dist-grid">
              <div class="pd-dist-grid__chart">${donutChartSvg(dist.slices, dist.total)}</div>
              ${donutLegendHtml}
            </div>
            <p class="pd-card__divider" aria-hidden="true"></p>
            <p class="pd-card__minihead">피부 타입별 만족도</p>
            ${stackBarsHtml}
          </div>

          <div class="pd-card">
            <p class="pd-card__eyebrow">AI 요약</p>
            <div class="pd-bars-group">
              <header class="pd-bars-group__head pd-bars-group__head--pos">사용자 경험에서 반복 확인된 장점</header>
              ${procons.pros}
            </div>
            <div class="pd-bars-group">
              <header class="pd-bars-group__head pd-bars-group__head--neg">부정 리뷰에서 반복된 단점·리스크</header>
              ${procons.cons}
            </div>
          </div>

          <div class="pd-card">
            <p class="pd-card__eyebrow">피부 타입별 리뷰 인사이트</p>
            <p class="pd-card__sub">선택한 타입의 핵심 후기 그룹 데이터를 확인하세요.</p>
            <div class="pd-chip-row" id="pd-skin-tabs" role="tablist">
              ${PD_SKIN_TABS.map(
                (s) =>
                  `<button type="button" class="pd-chip ${s === mappedSkin ? "pd-chip--active" : ""}" data-skin="${s}">${s}</button>`
              ).join("")}
            </div>
            <div class="pd-skin-content" id="pd-skin-content"></div>
          </div>

          <div class="pd-card">
            <p class="pd-card__eyebrow">비교 정보</p>
            <div class="pd-claim-grid">
              <div class="pd-claim-col">
                <header>마케팅 문구</header>
                <ul>
                  ${(p.marketingClaims || []).map((c) => `<li>${escapeHtml(c)} 가능</li>`).join("") || "<li>주장 데이터 없음</li>"}
                </ul>
              </div>
              <div class="pd-claim-col pd-claim-col--alt">
                <header>실제 사용자 경험 데이터</header>
                ${buildPdRealUserThemesHtml(p)}
              </div>
            </div>
            <p class="pd-claim-note">결과는 신호 점수, 정성 데이터, 사용자 후기 통계 결과를 토대로 산출한 분석값입니다.</p>
          </div>

          <div class="pd-card pd-trust-card">
            <p class="pd-card__eyebrow">신뢰도·광고 의심 교차 카드</p>
            <div class="pd-trust-card__top">
              ${trustGaugeSvg(agg.trustScore)}
              <div class="pd-trust-card__metrics">
                <p class="pd-trust-card__h">광고 의심 1차 평가</p>
                <ul class="pd-trust-metrics">
                  <li><span>반복 카피 강도</span><strong>${Math.min(99, Math.round(agg.adSuspicion * 0.18))}%</strong></li>
                  <li><span>광고 카피 등장 빈도</span><strong>${Math.min(99, Math.round(agg.adSuspicion * 0.12))}%</strong></li>
                  <li><span>광고 강도 평균</span><strong>${Math.min(99, Math.round(agg.adSuspicion * 0.06))}%</strong></li>
                </ul>
              </div>
            </div>
            <div class="pd-trust-card__pattern">
              <p class="pd-trust-card__patternLabel">문구 표현 패턴</p>
              <p class="pd-trust-card__patternValue">2,140<span>개</span></p>
              <ul class="pd-trust-tags">
                <li>광고성 안티에 따라 신뢰 피부타입에 안전하게 추천</li>
                <li>과장된 형용 키워드 ${Math.min(99, agg.adSuspicion)}% 제거</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="pd-section" id="pd-brand-section">
          <header class="pd-section__head">
            <h3>브랜드관</h3>
          </header>
          <button type="button" class="pd-brand" data-open-brand="${escapeHtml(brand)}">
            <div class="pd-brand__logo" aria-hidden="true">${escapeHtml(brand.slice(0, 2))}</div>
            <div class="pd-brand__info">
              <p class="pd-brand__name">${escapeHtml(brand)} <span aria-hidden="true">›</span></p>
              <p class="pd-brand__desc">피부학적 진정성을 담은 메디 뷰티</p>
            </div>
            <div class="pd-brand__like" aria-label="좋아요 수">
              <span class="pd-brand__heart" aria-hidden="true">♡</span>
              <span>1,405</span>
            </div>
          </button>
        </section>

        <p class="pd-footer-brand">TrueBeauty 트루뷰티 · 과장 표현 없이 사용자 경험을 분석한 신뢰 큐레이션</p>
      </article>
    `;

    const content = document.getElementById("detail-content");
    content.innerHTML = html;
    content.scrollTop = 0;

    renderPdSkinInsight(p, mappedSkin);
    document.getElementById("pd-skin-tabs").addEventListener("click", (e) => {
      const btn = e.target.closest(".pd-chip");
      if (!btn) return;
      renderPdSkinInsight(p, btn.getAttribute("data-skin"));
    });
    bindBrandShopClicks(content);

    const overlay = document.getElementById("product-detail");
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");

    const saveBtn = document.getElementById("btn-save-product");
    syncSaveBtn(saveBtn, loadIdList(STORAGE_SAVED).includes(id));
    saveBtn.onclick = () => {
      const on = toggleSaved(id);
      syncSaveBtn(saveBtn, on);
      renderMyPage();
    };
  }

  function syncSaveBtn(btn, on) {
    btn.setAttribute("aria-label", on ? "저장됨" : "저장");
    const path = btn.querySelector("path");
    if (path) {
      path.setAttribute("fill", on ? "#1496e1" : "none");
      path.setAttribute("stroke", on ? "#1496e1" : "#222");
    }
  }

  function matchDecision(product, prof) {
    const mapped = mapSkinForInsights(prof.skinType);
    const insight = product.insightsBySkin?.[mapped] || "";
    const reviews = product.reviews || [];
    const labels = (prof.concerns || []).map(mapConcernToReviewLabel);
    const mine = reviews.filter((r) => r.skinType === mapped && labels.includes(r.concern));
    const themeNeg = (product.realUserThemes?.negative || []).join(" ");
    if (mine.length) {
      return `${prof.skinType}·고민 조합에 가까운 후기가 있어 참고 가치가 있습니다. 다만 ${insight}`;
    }
    if (themeNeg.includes("민감") && prof.skinType === "민감성") {
      return "민감 피부 관련 부정 테마가 일부 보입니다. 패치 테스트와 성분 확인을 권장합니다.";
    }
    return `${prof.skinType} 기준 요약은 다음과 같습니다. ${insight} 최종적으로는 개인 편차가 크므로 소용량 테스트를 권장합니다.`;
  }

  function closeProductDetail() {
    const overlay = document.getElementById("product-detail");
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
  }

  let navBubbleRaf = null;

  function clearNavBubbleAnim() {
    if (navBubbleRaf) {
      cancelAnimationFrame(navBubbleRaf);
      navBubbleRaf = null;
    }
  }

  function navEaseInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function lerpNavMetrics(a, b, t) {
    return {
      left: a.left + (b.left - a.left) * t,
      top: a.top + (b.top - a.top) * t,
      width: a.width + (b.width - a.width) * t,
      height: a.height + (b.height - a.height) * t,
    };
  }

  function getNavBubbleMetrics(btn) {
    const nav = document.querySelector(".bottom-nav");
    const rail = nav ? nav.querySelector(".bottom-nav__rail") : null;
    if (!nav || !rail || !btn) return null;

    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const railRect = rail.getBoundingClientRect();
    const padX = 6;
    const width = btnRect.width + padX * 2;
    const height = railRect.height - 6;
    const left = btnRect.left - navRect.left + btnRect.width / 2 - width / 2;
    const top = railRect.top - navRect.top + (railRect.height - height) / 2;

    return { left, top, width, height };
  }

  function applyNavBubbleMetrics(el, metrics) {
    if (!el || !metrics) return;
    el.style.setProperty("--bubble-x", `${metrics.left}px`);
    el.style.setProperty("--bubble-y", `${metrics.top}px`);
    el.style.setProperty("--bubble-w", `${metrics.width}px`);
    el.style.setProperty("--bubble-h", `${metrics.height}px`);
  }

  function getNavTrailMetrics(baseMetrics) {
    const size = baseMetrics.height;
    return {
      left: baseMetrics.left + (baseMetrics.width - size) / 2,
      top: baseMetrics.top + (baseMetrics.height - size) / 2,
      width: size,
      height: size,
    };
  }

  function navTrailProgress(t) {
    return navEaseInOut(Math.pow(t, 1.35));
  }

  function setNavBubblePosition(btn) {
    const bubble = document.getElementById("nav-liquid-bubble");
    const metrics = getNavBubbleMetrics(btn);
    applyNavBubbleMetrics(bubble, metrics);
  }

  function finishNavBubbleAnim(nav, trail, lead, toM) {
    navBubbleRaf = null;
    nav.classList.remove("bottom-nav--goo-active");
    trail.hidden = true;
    applyNavBubbleMetrics(lead, toM);
  }

  function animateNavBubble(fromBtn, toBtn) {
    const nav = document.querySelector(".bottom-nav");
    const trail = document.getElementById("nav-goo-trail");
    const lead = document.getElementById("nav-liquid-bubble");
    if (!nav || !trail || !lead || !fromBtn || !toBtn) return;

    const fromM = getNavBubbleMetrics(fromBtn);
    const toM = getNavBubbleMetrics(toBtn);
    if (!fromM || !toM) return;

    const fromTrail = getNavTrailMetrics(fromM);
    const toTrail = getNavTrailMetrics(toM);
    const duration = 340;

    clearNavBubbleAnim();
    nav.classList.remove("bottom-nav--goo-active");

    applyNavBubbleMetrics(lead, fromM);
    applyNavBubbleMetrics(trail, fromTrail);
    trail.hidden = false;
    nav.classList.add("bottom-nav--goo-active");

    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const leadT = navEaseInOut(t);
      const trailT = navTrailProgress(t);

      applyNavBubbleMetrics(lead, lerpNavMetrics(fromM, toM, leadT));
      applyNavBubbleMetrics(trail, lerpNavMetrics(fromTrail, toTrail, trailT));

      if (t < 1) {
        navBubbleRaf = requestAnimationFrame(frame);
      } else {
        finishNavBubbleAnim(nav, trail, lead, toM);
      }
    }

    navBubbleRaf = requestAnimationFrame(frame);
  }

  function syncNavLiquidOrb() {
    const nav = document.querySelector(".bottom-nav");
    const trail = document.getElementById("nav-goo-trail");
    const btn = document.querySelector(".nav-btn.nav-btn--active");
    clearNavBubbleAnim();
    if (nav) nav.classList.remove("bottom-nav--goo-active");
    if (trail) trail.hidden = true;
    if (btn) setNavBubblePosition(btn);
  }

  function initNavLiquidOrb() {
    syncNavLiquidOrb();
    window.addEventListener("resize", syncNavLiquidOrb);
  }

  function showTab(name) {
    closeReviewsInfoPopover();
    const prevBtn = document.querySelector(".nav-btn.nav-btn--active");
    const prevTab = prevBtn ? prevBtn.getAttribute("data-tab") : null;

    const views = document.querySelectorAll(".view");
    views.forEach((v) => {
      const match = v.getAttribute("data-view") === name;
      v.toggleAttribute("hidden", !match);
      v.classList.toggle("view--active", match);
    });

    document.querySelectorAll(".nav-btn").forEach((b) => {
      const on = b.getAttribute("data-tab") === name;
      b.classList.toggle("nav-btn--active", on);
      if (on) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });

    const nextBtn = document.querySelector(`.nav-btn[data-tab="${name}"]`);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion && prevTab !== name && prevBtn && nextBtn) {
      animateNavBubble(prevBtn, nextBtn);
    } else {
      syncNavLiquidOrb();
    }

    syncHomeAiCareFab(name);

    if (name === "mypage") updateProfilePills();

    if (name !== "category") closeCategoryLeafPage();

    document.getElementById("main-scroll").scrollTop = 0;
  }

  function syncHomeAiCareFab(activeTab) {
    const root = document.getElementById("home-ai-care-root");
    if (!root) return;
    const onHome = activeTab === "home";
    root.classList.toggle("hidden", !onHome);
    root.setAttribute("aria-hidden", onHome ? "false" : "true");
    if (!onHome) closeAiAgentPage();
  }

  function closeAiAgentPage() {
    const overlay = document.getElementById("ai-agent-overlay");
    const btn = document.getElementById("btn-home-ai-care");
    if (!overlay || !btn) return;
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
    btn.classList.remove("home-ai-fab-btn--aura");
  }

  function openAiAgentPage() {
    const overlay = document.getElementById("ai-agent-overlay");
    const btn = document.getElementById("btn-home-ai-care");
    if (!overlay || !btn) return;
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
    btn.classList.add("home-ai-fab-btn--aura");
    const input = document.getElementById("ai-agent-input");
    if (input) requestAnimationFrame(() => input.focus());
  }

  function pulseHomeAiFabAura() {
    const btn = document.getElementById("btn-home-ai-care");
    if (!btn) return;
    btn.classList.remove("home-ai-fab-btn--aura");
    void btn.offsetWidth;
    btn.classList.add("home-ai-fab-btn--aura");
  }

  function initHomeAiCareFab() {
    const btn = document.getElementById("btn-home-ai-care");
    const root = document.getElementById("home-ai-care-root");
    const closeBtn = document.getElementById("btn-close-ai-agent");
    if (!btn || !root) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      pulseHomeAiFabAura();
      openAiAgentPage();
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", closeAiAgentPage);
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAiAgentPage();
    });
  }

  function closeReviewsInfoPopover() {
    const popover = document.getElementById("reviews-info-popover");
    const btn = document.getElementById("btn-reviews-info");
    if (!popover) return;
    popover.classList.add("hidden");
    popover.setAttribute("aria-hidden", "true");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function toggleReviewsInfoPopover() {
    const popover = document.getElementById("reviews-info-popover");
    const btn = document.getElementById("btn-reviews-info");
    if (!popover || !btn) return;
    const open = popover.classList.contains("hidden");
    if (!open) {
      closeReviewsInfoPopover();
      return;
    }
    popover.classList.remove("hidden");
    popover.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
  }

  function initReviewsInfo() {
    const btn = document.getElementById("btn-reviews-info");
    const wrap = document.querySelector(".reviews-info-wrap");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleReviewsInfoPopover();
      });
    }
    document.addEventListener("click", () => closeReviewsInfoPopover());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeReviewsInfoPopover();
    });
    if (wrap) {
      wrap.addEventListener("click", (e) => e.stopPropagation());
    }
  }

  function initNav() {
    initNavLiquidOrb();
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => showTab(btn.getAttribute("data-tab")));
    });
    document.getElementById("btn-close-detail").addEventListener("click", closeProductDetail);
    document.getElementById("product-detail").addEventListener("click", (e) => {
      if (e.target.id === "product-detail") closeProductDetail();
    });

    document.getElementById("btn-close-brand-shop").addEventListener("click", closeBrandShop);

    document.getElementById("btn-close-preview").addEventListener("click", closeProductPreview);
    document.getElementById("preview-backdrop").addEventListener("click", closeProductPreview);
    document.getElementById("btn-preview-detail").addEventListener("click", () => {
      const id = previewCurrentId;
      if (!id) return;
      closeProductPreview();
      openProductDetail(id);
    });

    document.getElementById("btn-close-mag-article").addEventListener("click", closeMagArticleDetail);
    document.getElementById("mag-article-detail").addEventListener("click", (e) => {
      if (e.target.id === "mag-article-detail") closeMagArticleDetail();
    });

    document.getElementById("magazine-grid").addEventListener("click", (e) => {
      const t = e.target.closest("[data-mag-article]");
      if (!t) return;
      openMagArticleDetail(t.getAttribute("data-mag-article"));
    });

    document.getElementById("magazine-grid").addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest("[data-mag-article]");
      if (!card) return;
      e.preventDefault();
      openMagArticleDetail(card.getAttribute("data-mag-article"));
    });

    const magControversyMount = document.getElementById("mag-controversy-analysis");
    if (magControversyMount) {
      magControversyMount.addEventListener("click", (e) => {
        const t = e.target.closest("[data-mag-article]");
        if (!t) return;
        openMagArticleDetail(t.getAttribute("data-mag-article"));
      });
      magControversyMount.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        const card = e.target.closest("[data-mag-article]");
        if (!card) return;
        e.preventDefault();
        openMagArticleDetail(card.getAttribute("data-mag-article"));
      });
    }

    document.getElementById("pd-tabs").addEventListener("click", (e) => {
      const btn = e.target.closest(".pd-tab");
      if (!btn) return;
      document.querySelectorAll("#pd-tabs .pd-tab").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("pd-tab--active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
    });

    document.getElementById("detail-content").addEventListener("click", (e) => {
      const pill = e.target.closest(".pd-pill");
      if (pill) {
        const row = pill.parentElement;
        row.querySelectorAll(".pd-pill").forEach((b) => {
          const on = b === pill;
          b.classList.toggle("pd-pill--active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
      }
      const range = e.target.closest(".pd-range");
      if (range) {
        const row = range.parentElement;
        row.querySelectorAll(".pd-range").forEach((b) => {
          b.classList.toggle("pd-range--active", b === range);
        });
      }
    });
  }

  function initPhoneStatusBar() {
    const timeEl = document.getElementById("phone-status-time");
    if (!timeEl) return;

    const tick = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const pad = (n) => String(n).padStart(2, "0");
      timeEl.textContent = `${h}:${pad(m)}`;
      timeEl.setAttribute("datetime", now.toISOString());
    };

    tick();
    window.setInterval(tick, 15000);
  }

  function boot() {
    if (!window.TrueBeautyData) {
      console.error("TrueBeautyData 로드 실패");
      return;
    }

    initPhoneStatusBar();
    initWizardDom();
    initSplash();
    initNav();
    initReviewsInfo();
    initHomeAiCareFab();
    initHomeSearch();
    initCategorySplit();
    initProfileEdit();
    initSkinEdit();

    profile = loadProfile();
    updateProfilePills();

    showLayerSplash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
