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
    { id: "reco-award", label: "어워드", icon: "🏆" },
    { id: "reco-sample", label: "샘플체험", icon: "🧪" },
    { id: "reco-only", label: "트루Pick", icon: "✓" },
    { id: "reco-sale", label: "특가상품", icon: "🏷" },
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

  function defaultLeafForMain(main) {
    if (main === "reco") return "reco-rank";
    if (main === "skincare") return "scm-moist";
    if (main === "face") return "face-base";
    if (main === "lip") return "lip-stick";
    return "eye-shadow";
  }

  function findLeafLabel(leafId) {
    for (let i = 0; i < RECO_TILES.length; i += 1) {
      if (RECO_TILES[i].id === leafId) return RECO_TILES[i].label;
    }
    for (let b = 0; b < SKINCARE_BLOCKS.length; b += 1) {
      const rows = SKINCARE_BLOCKS[b].rows;
      for (let r = 0; r < rows.length; r += 1) {
        if (rows[r].id === leafId) return rows[r].label;
      }
    }
    const scan = [FACE_ROWS, LIP_ROWS, EYE_ROWS];
    for (let s = 0; s < scan.length; s += 1) {
      const rows = scan[s];
      for (let r = 0; r < rows.length; r += 1) {
        if (rows[r].id === leafId) return rows[r].label;
      }
    }
    return "전체";
  }

  function productsForLeaf(leafId) {
    const all = getProducts();
    if (leafId.indexOf("reco-") === 0) {
      const sorted = all.slice().sort((a, b) => b.popularityScore - a.popularityScore);
      if (leafId === "reco-rank") return sorted;
      if (leafId === "reco-sale") {
        return sorted.filter((p) => p.priceLabel && p.priceLabel.indexOf("만") >= 0);
      }
      return sorted;
    }
    if (leafId.indexOf("scm-") === 0 || leafId.indexOf("sct-") === 0) {
      return all.filter((p) => p.category === "skincare");
    }
    if (leafId.indexOf("face-") === 0 || leafId.indexOf("lip-") === 0 || leafId.indexOf("eye-") === 0) {
      return all.filter((p) => p.category === "makeup");
    }
    return all;
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

  function renderCategoryProducts() {
    const holder = document.getElementById("category-product-list");
    const list = productsForLeaf(activeLeafId);
    const label = findLeafLabel(activeLeafId);
    if (!list.length) {
      holder.innerHTML = `<p class="cat-product-head">${escapeHtml(label)}</p><div class="empty-state">표시할 제품이 없습니다.</div>`;
      bindProductClicks(holder);
      return;
    }
    holder.innerHTML = `<p class="cat-product-head">${escapeHtml(label)} · 신뢰도 표시</p>${list.map((p) => productCardHtml(p)).join("")}`;
    bindProductClicks(holder);
  }

  function renderCategory() {
    renderCategorySidebar();
    renderCategoryMain();
    renderCategoryProducts();
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
        renderCategoryProducts();
      }
    });
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

  /** @type {{ skinType: string, concerns: string[], skinReaction: string }} */
  let profile = loadProfile();

  let wizardStep = 1;
  /** @type {{ skinType: string|null, concerns: string[], skinReaction: string|null }} */
  let draft = { skinType: null, concerns: [], skinReaction: null };

  function defaultProfile() {
    return {
      skinType: "복합성",
      concerns: ["모공"],
      skinReaction: "가끔 트러블이 생겨요",
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
        };
      }
      const legacyRaw = localStorage.getItem(STORAGE_LEGACY);
      if (legacyRaw) {
        const p = JSON.parse(legacyRaw);
        const migrated = {
          skinType: p.skinType || defaultProfile().skinType,
          concerns: p.concern ? [p.concern] : defaultProfile().concerns,
          skinReaction: defaultProfile().skinReaction,
        };
        saveProfile(migrated);
        return migrated;
      }
    } catch {
      /* noop */
    }
    return defaultProfile();
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

  function trustMeterHtml(trust, ad) {
    return `
      <div class="trust-meter" role="group" aria-label="신뢰도 지표">
        <div class="trust-bar" aria-hidden="true">
          <div class="trust-bar__fill" style="width:${trust}%"></div>
        </div>
        <span class="trust-meter__value">신뢰도 ${trust}%</span>
        <span class="caption">광고 의심 ${ad}%</span>
      </div>`;
  }

  function productCardHtml(p, extraClass) {
    const { trustScore, adSuspicion } = aggregateProductTrust(p);
    const ec = extraClass ? ` ${extraClass}` : "";
    return `
      <button type="button" class="product-card${ec}" data-product-id="${p.id}">
        <img class="product-card__img" src="${p.image}" alt="" width="72" height="72" loading="lazy" />
        <div class="product-card__body">
          <p class="product-card__name">${escapeHtml(p.name)}</p>
          ${trustMeterHtml(trustScore, adSuspicion)}
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
    document.getElementById("wizard-flow").setAttribute("aria-hidden", "true");
    document.getElementById("app-shell").setAttribute("aria-hidden", "true");
  }

  function showLayerWizard() {
    document.getElementById("splash-flow").classList.add("hidden");
    document.getElementById("wizard-flow").classList.remove("hidden");
    document.getElementById("app-shell").classList.add("hidden");
    document.getElementById("wizard-flow").setAttribute("aria-hidden", "false");
    document.getElementById("app-shell").setAttribute("aria-hidden", "true");
  }

  function showLayerApp() {
    document.getElementById("splash-flow").classList.add("hidden");
    document.getElementById("wizard-flow").classList.add("hidden");
    document.getElementById("app-shell").classList.remove("hidden");
    document.getElementById("wizard-flow").setAttribute("aria-hidden", "true");
    document.getElementById("app-shell").setAttribute("aria-hidden", "false");
  }

  function resetWizardFromProfile() {
    wizardStep = 1;
    draft = {
      skinType: profile.skinType,
      concerns: (profile.concerns || []).slice(0, 3),
      skinReaction: profile.skinReaction,
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
      gridSkin.querySelectorAll(".ob-option").forEach((b) => {
        b.classList.toggle("ob-option--selected", b.getAttribute("data-value") === draft.skinType);
      });
      validateWizardStep();
    });

    gridConcern.addEventListener("click", (e) => {
      const btn = e.target.closest(".ob-option");
      if (!btn || btn.getAttribute("data-kind") !== "concern") return;
      const val = btn.getAttribute("data-value");
      const idx = draft.concerns.indexOf(val);
      if (idx >= 0) draft.concerns.splice(idx, 1);
      else if (draft.concerns.length < 3) draft.concerns.push(val);
      gridConcern.querySelectorAll(".ob-option").forEach((b) => {
        const v = b.getAttribute("data-value");
        b.classList.toggle("ob-option--selected", draft.concerns.includes(v));
      });
      validateWizardStep();
    });

    listReaction.addEventListener("click", (e) => {
      const btn = e.target.closest(".ob-option");
      if (!btn || btn.getAttribute("data-kind") !== "reaction") return;
      draft.skinReaction = btn.getAttribute("data-value");
      listReaction.querySelectorAll(".ob-option").forEach((b) => {
        b.classList.toggle("ob-option--selected", b.getAttribute("data-value") === draft.skinReaction);
      });
      validateWizardStep();
    });

    document.getElementById("btn-wizard-next").addEventListener("click", onWizardNext);
    document.getElementById("btn-wizard-back").addEventListener("click", onWizardBack);
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
  }

  function renderWizardStepsVisibility() {
    document.querySelectorAll(".wizard-step").forEach((el) => {
      const step = Number(el.getAttribute("data-step"));
      el.classList.toggle("hidden", step !== wizardStep);
    });
    const nextBtn = document.getElementById("btn-wizard-next");
    nextBtn.textContent = wizardStep === 3 ? "시작하기" : "다음";
    const backBtn = document.getElementById("btn-wizard-back");
    const hideBack = wizardStep === 1 && !wizardOpenedFromApp;
    backBtn.style.visibility = hideBack ? "hidden" : "visible";
    backBtn.disabled = hideBack;
  }

  function updateWizardProgress() {
    const fill = document.getElementById("wizard-progress-fill");
    const bar = document.getElementById("wizard-progress-bar");
    const pct = wizardStep === 1 ? 33.333 : wizardStep === 2 ? 66.666 : 100;
    fill.style.width = `${pct}%`;
    bar.setAttribute("aria-valuenow", String(wizardStep));
  }

  function validateWizardStep() {
    const nextBtn = document.getElementById("btn-wizard-next");
    let ok = false;
    if (wizardStep === 1) ok = !!draft.skinType;
    else if (wizardStep === 2) ok = draft.concerns.length >= 1 && draft.concerns.length <= 3;
    else ok = !!draft.skinReaction;
    nextBtn.disabled = !ok;
  }

  function onWizardNext() {
    if (wizardStep < 3) {
      wizardStep += 1;
      renderWizardStepsVisibility();
      updateWizardProgress();
      validateWizardStep();
      document.getElementById("wizard-body").scrollTop = 0;
      return;
    }
    profile = {
      skinType: draft.skinType || profile.skinType,
      concerns: draft.concerns.length ? draft.concerns : profile.concerns,
      skinReaction: draft.skinReaction || profile.skinReaction,
    };
    saveProfile(profile);
    wizardOpenedFromApp = false;
    showLayerApp();
    refreshAll();
  }

  function onWizardBack() {
    if (wizardStep === 1) {
      if (wizardOpenedFromApp) {
        wizardOpenedFromApp = false;
        showLayerApp();
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
      draft = { skinType: null, concerns: [], skinReaction: null };
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

  function showOnboardingForEdit() {
    wizardOpenedFromApp = true;
    resetWizardFromProfile();
    showLayerWizard();
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
    const pill = document.getElementById("home-profile-pill");
    const concernStr = (profile.concerns || []).join(" · ") || "—";
    if (pill) pill.textContent = `${profile.skinType} · ${concernStr}`;
    document.getElementById("mypage-skin").textContent = profile.skinType;
    document.getElementById("mypage-concern").textContent = (profile.concerns || []).join(", ") || "—";
    document.getElementById("mypage-reaction").textContent = profile.skinReaction || "—";
  }

  function renderHome() {
    const products = getProducts();
    const controversy = products.find((p) => p.isControversialToday) || products[0];
    const box = document.getElementById("home-controversy-body");
    const agg = aggregateProductTrust(controversy);
    box.innerHTML = `
      <h3 class="card__title">${escapeHtml(controversy.name)}</h3>
      <p class="card__meta">${escapeHtml(controversy.controversyNote || "논란 포인트 확인 중")}</p>
      ${trustMeterHtml(agg.trustScore, agg.adSuspicion)}
      <div class="tag-row">
        <span class="tag">마케팅 vs 실사용</span>
        <span class="tag tag--risk">위험 정보 점검</span>
      </div>
      <button type="button" class="btn btn--ghost btn--small" data-open-product="${controversy.id}">상세 분석 보기</button>
    `;

    const recommend = document.getElementById("home-recommend");
    const scored = products
      .map((p) => ({ p, score: recommendScore(p, profile) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.p);
    recommend.innerHTML = scored.map((p) => productCardHtml(p)).join("");

    const popular = [...products].sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 4);
    document.getElementById("home-popular").innerHTML = popular.map((p) => productCardHtml(p, "product-card--compact")).join("");

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

  function renderReviewsFeed() {
    const feed = document.getElementById("reviews-feed");
    const items = [];
    getProducts().forEach((p) => {
      (p.reviews || []).forEach((r) => {
        const a = analyzeReviewText(r.text);
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
        return `
        <article class="review-card glass-panel">
          <div class="review-card__top">
            <div>
              <strong>${escapeHtml(product.name)}</strong>
              <div class="caption">${escapeHtml(review.author)} · 신뢰도 ${analysis.trustScore}%</div>
            </div>
            <span class="pill pill--soft">광고 의심 ${analysis.adSuspicion}%</span>
          </div>
          <p class="review-quote">“${escapeHtml(review.text)}”</p>
          <div class="tag-row">
            <span class="tag">${escapeHtml(review.skinType)}</span>
            <span class="tag">${escapeHtml(review.concern)}</span>
            ${hintsNeg.map((h) => `<span class="tag tag--risk">${escapeHtml(h)} 이슈</span>`).join("")}
            ${hintsPos.map((h) => `<span class="tag">${escapeHtml(h)}</span>`).join("")}
          </div>
          <div class="procon">
            <div class="procon__col">
              <div class="procon__label">장점 추출</div>
              ${hintsPos.length ? escapeHtml(hintsPos[0]) + " 언급" : "명확한 긍정 키워드 소수"}
            </div>
            <div class="procon__col">
              <div class="procon__label">단점 추출</div>
              ${hintsNeg.length ? escapeHtml(hintsNeg[0]) + " 우려" : "부정 힌트 낮음"}
            </div>
          </div>
          <button type="button" class="btn btn--ghost btn--small" data-open-product="${product.id}">제품 상세에서 맥락 보기</button>
        </article>`;
      })
      .join("");

    bindProductClicks(feed);
  }

  function renderMagazine() {
    const grid = document.getElementById("magazine-grid");
    const mapped = mapSkinForInsights(profile.skinType);
    const articles = [...getMagazine()].sort((a, b) => {
      const ma = a.skinTypes.includes(mapped) ? 1 : 0;
      const mb = b.skinTypes.includes(mapped) ? 1 : 0;
      return mb - ma;
    });
    grid.innerHTML = articles
      .map((a) => {
        const skins = a.skinTypes.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("");
        return `
        <article class="mag-card glass-panel">
          <div class="mag-card__tag">${escapeHtml(a.tag)}</div>
          <h3 class="mag-card__title">${escapeHtml(a.title)}</h3>
          <p class="body-text muted" style="margin:0 0 10px">${escapeHtml(a.excerpt)}</p>
          <div class="tag-row">${skins}</div>
        </article>`;
      })
      .join("");
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
        .map((p) => productCardHtml(p))
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
        .map((p) => productCardHtml(p))
        .join("");
      bindProductClicks(recentEl);
    }
  }

  function bindProductClicks(root) {
    if (!root) return;
    root.querySelectorAll("[data-open-product]").forEach((btn) => {
      btn.addEventListener("click", () => openProductDetail(btn.getAttribute("data-open-product")));
    });
    root.querySelectorAll(".product-card[data-product-id]").forEach((btn) => {
      btn.addEventListener("click", () => openProductDetail(btn.getAttribute("data-product-id")));
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

  function openProductDetail(id) {
    const p = getProductById(id);
    if (!p) return;
    pushRecent(id);

    const mappedSkin = mapSkinForInsights(profile.skinType);
    const agg = aggregateProductTrust(p);
    const summary = buildMockAiSummary(p, mappedSkin);
    const marketing = (p.marketingClaims || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    const realPos = (p.realUserThemes?.positive || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    const realNeg = (p.realUserThemes?.negative || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    const risks = (p.realUserThemes?.risks || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");

    const skinBlocks = INSIGHT_SKIN_KEYS.map((st) => {
      const list = summary.bySkin[st] || [];
      const short = list.length ? `${list.length}개의 후기 텍스트를 묶었습니다.` : "해당 타입 후기 샘플이 적습니다.";
      return `<div class="compare-card"><h4>${escapeHtml(st)}</h4>${escapeHtml(short)}</div>`;
    }).join("");

    const negHighlight =
      summary.emphasisNeg.length > 0
        ? summary.emphasisNeg
            .map((r) => `<li><span class="caption">${escapeHtml(r.skinType)}</span> — ${escapeHtml(r.text)}</li>`)
            .join("")
        : "<li>부정 힌트가 낮은 편입니다. 개인차를 확인하세요.</li>";

    const riskBlock =
      risks ||
      (summary.emphasisRisk.length
        ? summary.emphasisRisk.map((r) => `<li>${escapeHtml(r.text)}</li>`).join("")
        : "<li>등록된 주의 정보가 없습니다.</li>");

    const decisionAnswer = matchDecision(p, profile);

    const html = `
      <div class="detail-hero">
        <img src="${p.image}" alt="${escapeHtml(p.name)} 제품 이미지" width="240" height="240" loading="lazy" />
        <h2 class="detail-title">${escapeHtml(p.name)}</h2>
        <p class="body-text" style="margin-top:0">${escapeHtml(summary.oneLineSummary)}</p>
      </div>

      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-card__label">리뷰 신뢰도</div>
          <div class="metric-card__value">${agg.trustScore}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-card__label">광고 의심도</div>
          <div class="metric-card__value">${agg.adSuspicion}%</div>
        </div>
      </div>
      ${trustMeterHtml(agg.trustScore, agg.adSuspicion)}

      <div class="decision-panel">
        <p class="decision-panel__q">나에게 맞는 제품인가?</p>
        <p class="decision-panel__a">${escapeHtml(decisionAnswer)}</p>
      </div>

      <div class="review-block">
        <h3 class="subheading">모의 AI 요약</h3>
        <div class="procon">
          <div class="procon__col">
            <div class="procon__label">장점</div>
            <ul class="list-dots">${summary.pros.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
          </div>
          <div class="procon__col">
            <div class="procon__label">단점 · 보정</div>
            <ul class="list-dots">${summary.cons.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
          </div>
        </div>
      </div>

      <div class="review-block">
        <h3 class="subheading">부정 리뷰 · 위험 정보 강조</h3>
        <ul class="list-dots">${negHighlight}</ul>
        <h3 class="subheading" style="margin-top:12px">위험 정보</h3>
        <ul class="list-dots">${riskBlock}</ul>
      </div>

      <div class="review-block">
        <h3 class="subheading">${escapeHtml(profile.skinType)} 맞춤 인사이트</h3>
        <div class="skin-insight">${escapeHtml(p.insightsBySkin?.[mappedSkin] || "")}</div>
      </div>

      <div class="review-block">
        <h3 class="subheading">피부 타입별 리뷰 묶음</h3>
        <div class="compare-grid">${skinBlocks}</div>
      </div>

      <div class="review-block">
        <h3 class="subheading">비교 정보</h3>
        <div class="compare-grid">
          <div class="compare-card">
            <h4>마케팅 문구</h4>
            <ul class="list-dots">${marketing || "<li>등록된 문구가 없습니다.</li>"}</ul>
          </div>
          <div class="compare-card">
            <h4>실제 사용자 경험 데이터</h4>
            <p class="caption" style="margin:0 0 8px">긍정 테마</p>
            <ul class="list-dots">${realPos || "<li>데이터 수집 중</li>"}</ul>
            <p class="caption" style="margin:12px 0 8px">부정 테마</p>
            <ul class="list-dots">${realNeg || "<li>특이 부정 테마 없음</li>"}</ul>
          </div>
        </div>
      </div>
    `;

    document.getElementById("detail-content").innerHTML = html;
    const overlay = document.getElementById("product-detail");
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");

    const saveBtn = document.getElementById("btn-save-product");
    const saved = loadIdList(STORAGE_SAVED).includes(id);
    saveBtn.textContent = saved ? "♥" : "♡";
    saveBtn.setAttribute("aria-label", saved ? "저장됨" : "저장");

    saveBtn.onclick = () => {
      const on = toggleSaved(id);
      saveBtn.textContent = on ? "♥" : "♡";
      saveBtn.setAttribute("aria-label", on ? "저장됨" : "저장");
      renderMyPage();
    };
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

  function showTab(name) {
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

    document.getElementById("main-scroll").scrollTop = 0;
  }

  function initNav() {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => showTab(btn.getAttribute("data-tab")));
    });
    document.getElementById("btn-close-detail").addEventListener("click", closeProductDetail);
    document.getElementById("product-detail").addEventListener("click", (e) => {
      if (e.target.id === "product-detail") closeProductDetail();
    });
    document.getElementById("btn-edit-profile").addEventListener("click", showOnboardingForEdit);
  }

  function boot() {
    if (!window.TrueBeautyData) {
      console.error("TrueBeautyData 로드 실패");
      return;
    }

    initWizardDom();
    initSplash();
    initNav();
    initCategorySplit();

    profile = loadProfile();
    const hasProfile = !!localStorage.getItem(STORAGE_KEY) || !!localStorage.getItem(STORAGE_LEGACY);

    if (hasProfile) {
      showLayerApp();
      refreshAll();
      showTab("home");
    } else {
      draft = { skinType: null, concerns: [], skinReaction: null };
      wizardStep = 1;
      wizardOpenedFromApp = false;
      renderWizardStepsVisibility();
      updateWizardProgress();
      syncWizardUiFromDraft();
      validateWizardStep();
      showLayerWizard();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
