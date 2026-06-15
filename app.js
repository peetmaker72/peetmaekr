// ============================================================
// Rendering logic for the portfolio presentation
// ============================================================

function fmtBaht(n) {
  return Math.round(n).toLocaleString("th-TH") + " บาท";
}
function fmtPct(n, digits = 1) {
  if (n === null || n === undefined || isNaN(n)) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}
function pctClass(n) {
  if (n === null || n === undefined || isNaN(n)) return "";
  return n >= 0 ? "pos" : "neg";
}

// ---------- Portfolio derived metrics ----------
function computeWeightedRisk() {
  return PORTFOLIO.funds.reduce((s, f) => s + f.weight * f.riskLevel, 0);
}

function computeWeightedReturn(period) {
  return PORTFOLIO.funds.reduce((sum, f) => {
    const perf = FUND_PERFORMANCE[f.code];
    const r = perf ? perf[period] : 0;
    return sum + f.weight * (r || 0);
  }, 0);
}

// ---------- Slide 1: Cover ----------
function renderCover() {
  const weightedRisk = computeWeightedRisk();
  const ytd = computeWeightedReturn("YTD");
  const oneY = computeWeightedReturn("1Y");
  const badges = [
    { k: "เงินลงทุนตัวอย่าง", v: fmtBaht(TOTAL_INVESTMENT) },
    { k: "จำนวนกองทุน", v: PORTFOLIO.funds.length + " กองทุน" },
    { k: "ผลตอบแทน YTD (ถ่วงน้ำหนัก)", v: fmtPct(ytd) },
    { k: "ผลตอบแทน 1 ปี (ถ่วงน้ำหนัก)", v: fmtPct(oneY) },
    { k: "ระดับความเสี่ยงถ่วงน้ำหนัก", v: weightedRisk.toFixed(1) + " / 8" },
  ];
  document.getElementById("cover-badges").innerHTML = badges
    .map(b => `<div class="badge"><div class="k">${b.k}</div><div class="v">${b.v}</div></div>`)
    .join("");
}

// ---------- Slide 2: Allocation ----------
function renderAllocation() {
  const rows = PORTFOLIO.funds.map(f => `
    <tr>
      <td><strong>${f.code}</strong><br/><span style="font-size:0.85em;color:var(--grey)">${f.shortName}</span></td>
      <td>${(f.weight * 100).toFixed(0)}%</td>
      <td>${fmtBaht(f.weight * TOTAL_INVESTMENT)}</td>
      <td>${f.assetClass}</td>
    </tr>`).join("");
  document.getElementById("tbl-allocation").innerHTML = `
    <tr><th>กองทุน</th><th>สัดส่วน</th><th>มูลค่าเงินลงทุน</th><th>ประเภทสินทรัพย์</th></tr>
    ${rows}
    <tr style="font-weight:700;background:#eef2f8;"><td>รวม</td><td>100%</td><td>${fmtBaht(TOTAL_INVESTMENT)}</td><td>-</td></tr>
  `;

  new Chart(document.getElementById("chartAllocation"), {
    type: "doughnut",
    data: {
      labels: PORTFOLIO.funds.map(f => `${f.code} (${(f.weight*100).toFixed(0)}%)`),
      datasets: [{
        data: PORTFOLIO.funds.map(f => f.weight * 100),
        backgroundColor: PORTFOLIO.funds.map(f => f.color),
        borderWidth: 2,
        borderColor: "#fff",
      }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { font: { size: 12 } } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } },
      },
    },
  });
}

// ---------- Slide 3: Performance Summary ----------
function renderPerformanceSummary() {
  const weighted = {};
  PERIODS.forEach(p => weighted[p] = computeWeightedReturn(p));

  // Table: weighted return % and baht gain/loss
  const rows = PERIODS.map(p => {
    const ret = weighted[p];
    const gain = TOTAL_INVESTMENT * (ret / 100);
    return `<tr>
      <td>${p}</td>
      <td class="${pctClass(ret)}">${fmtPct(ret)}</td>
      <td class="${pctClass(gain)}">${gain >= 0 ? "+" : ""}${Math.round(gain).toLocaleString("th-TH")} บาท</td>
    </tr>`;
  }).join("");
  document.getElementById("tbl-perf").innerHTML = `
    <tr><th>ช่วงเวลา</th><th>ผลตอบแทนถ่วงน้ำหนัก</th><th>กำไร/ขาดทุนโดยประมาณ</th></tr>
    ${rows}
  `;
  document.getElementById("perf-note").innerHTML =
    "ผลตอบแทนถ่วงน้ำหนักคำนวณจากสัดส่วนการลงทุนของแต่ละกองทุน (35/15/10/15/25) " +
    "สำหรับ A-GRID ซึ่งเป็นกองทุนจัดตั้งใหม่ ใช้ผลตอบแทนของ GRID ETF (กองทุนหลักอ้างอิง) แทนข้อมูลย้อนหลัง " +
    "ตัวเลขทั้งหมดเป็นข้อมูลโดยประมาณ ณ วันที่ระบุ และไม่ได้รวมค่าธรรมเนียมการซื้อขายหน่วยลงทุน";

  new Chart(document.getElementById("chartPerf"), {
    type: "bar",
    data: {
      labels: PERIODS,
      datasets: [{
        label: "ผลตอบแทนถ่วงน้ำหนักของพอร์ต (%)",
        data: PERIODS.map(p => weighted[p]),
        backgroundColor: PERIODS.map(p => weighted[p] >= 0 ? "rgba(31,111,235,0.75)" : "rgba(192,57,43,0.75)"),
        borderRadius: 6,
      }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: (v) => v + "%" } },
      },
    },
  });
}

// ---------- Slide 4: Asset class & risk ----------
function renderAssetClassAndRisk() {
  new Chart(document.getElementById("chartAssetClass"), {
    type: "pie",
    data: {
      labels: PORTFOLIO.funds.map(f => f.assetClass),
      datasets: [{
        data: PORTFOLIO.funds.map(f => f.weight * 100),
        backgroundColor: PORTFOLIO.funds.map(f => f.color),
        borderWidth: 2,
        borderColor: "#fff",
      }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 14 } },
      },
    },
  });

  const weightedRisk = computeWeightedRisk();
  const equityPct = PORTFOLIO.funds.filter(f => f.assetClass.includes("หุ้น")).reduce((s, f) => s + f.weight, 0) * 100;
  const goldPct = PORTFOLIO.funds.filter(f => f.code === "SCBGOLDH").reduce((s, f) => s + f.weight, 0) * 100;
  const bondPct = PORTFOLIO.funds.filter(f => f.code === "K-GDBOND-A(A)").reduce((s, f) => s + f.weight, 0) * 100;
  const riskAssetPct = equityPct + goldPct;
  const kpis = [
    { label: "ระดับความเสี่ยงถ่วงน้ำหนัก", value: weightedRisk.toFixed(1) + " / 8", sub: "ระดับความเสี่ยงเฉลี่ยตามสัดส่วนเงินลงทุน" },
    { label: "สัดส่วนสินทรัพย์เสี่ยงสูง (หุ้น+ทอง)", value: riskAssetPct.toFixed(0) + "%", sub: `หุ้น ${equityPct.toFixed(0)}% + ทองคำ ${goldPct.toFixed(0)}%` },
    { label: "สัดส่วนตราสารหนี้", value: bondPct.toFixed(0) + "%", sub: "K-GDBOND-A(A)" },
    { label: "การกระจายภูมิภาค/ธีม", value: "5 ธีม", sub: "US Equity, Global Tech, Smart Grid, Gold, Global Bond" },
  ];
  document.getElementById("portfolio-kpis").innerHTML = `<div class="kpi-row">${
    kpis.map(k => `<div class="kpi"><div class="label">${k.label}</div><div class="value">${k.value}</div><div class="sub">${k.sub}</div></div>`).join("")
  }</div>`;

  document.getElementById("risk-note").innerHTML =
    `พอร์ตนี้เน้นการเติบโตของสินทรัพย์เสี่ยง (หุ้น ${equityPct.toFixed(0)}% และทองคำ ${goldPct.toFixed(0)}%) ผสมกับตราสารหนี้โลก ${bondPct.toFixed(0)}% เพื่อช่วยลดความผันผวนโดยรวม ` +
    "ความเสี่ยงหลักมาจากความผันผวนของตลาดหุ้นสหรัฐฯ/เทคโนโลยี อัตราแลกเปลี่ยน และราคาทองคำ";
}

// ---------- Fund detail slides ----------
function renderFundSlides() {
  const container = document.getElementById("fund-slides-container");
  let html = "";
  PORTFOLIO.funds.forEach((f, idx) => {
    const d = FUND_DETAILS[f.code] || {};
    const perf = FUND_PERFORMANCE[f.code] || {};
    const bench = perf.benchmark || {};

    const perfRows = PERIODS.map(p => `
      <tr>
        <td>${p}</td>
        <td class="${pctClass(perf[p])}">${fmtPct(perf[p])}</td>
        <td class="${pctClass(bench[p])}">${fmtPct(bench[p])}</td>
      </tr>`).join("");

    const newBadge = f.isNew
      ? `<span class="tag" style="background:#e07a5f;">กองทุนจัดตั้งใหม่ - ใช้ข้อมูลกองทุนหลักอ้างอิง</span>`
      : "";

    html += `
    <section>
      <div class="fund-header">
        <div>
          <div class="code">${f.code}</div>
          <div class="full">${f.fullNameTh}<br/>${f.amc} · ${newBadge}</div>
        </div>
        <div class="risk">
          <div class="num">${f.riskLevel}</div>
          <div class="lbl">ระดับความเสี่ยง / 8</div>
        </div>
      </div>
      <div class="fund-grid" style="display:grid;grid-template-columns:1.15fr 1fr;grid-template-rows:1fr 1fr;gap:14px;flex:1;min-height:0;">
        <div class="panel">
          <h3>นโยบายการลงทุน / กองทุนหลัก</h3>
          ${d.factsLine ? `<div class="note" style="margin:0 0 6px 0;padding-top:0;">${d.factsLine}</div>` : ""}
          <div class="scroll">${d.policyText || ""}</div>
        </div>
        <div class="panel">
          <h3>ผลตอบแทนย้อนหลัง${d.perfAsOf ? " (ข้อมูล ณ " + d.perfAsOf + ")" : ""}</h3>
          <div class="scroll">
            <table>
              <tr><th>ช่วงเวลา</th><th>${f.code}${f.isNew ? "*" : ""}</th><th>${d.benchmarkName || "Benchmark"}</th></tr>
              ${perfRows}
            </table>
          </div>
          ${f.isNew ? '<div class="note">*ใช้ผลตอบแทนของกองทุนหลัก/ETF อ้างอิง เนื่องจาก A-GRID เพิ่งจัดตั้ง</div>' : ''}
        </div>
        <div class="panel">
          <h3>Top 10 Holdings ${d.holdingsOf ? "(" + d.holdingsOf + ")" : ""}</h3>
          <div class="chart-wrap"><canvas id="chart-holdings-${idx}"></canvas></div>
        </div>
        <div class="panel">
          <h3>มุมมองและ Outlook</h3>
          <div class="scroll">${d.outlookText || ""}</div>
        </div>
      </div>
    </section>`;
  });
  // Replace the wrapper div itself so the generated <section> elements become
  // direct children of .slides (required by reveal.js's ".slides > section" selector)
  container.outerHTML = html;

  // Render holdings charts after DOM insertion
  PORTFOLIO.funds.forEach((f, idx) => {
    const d = FUND_DETAILS[f.code] || {};
    const holdings = d.topHoldings || [];
    if (!holdings.length) return;
    new Chart(document.getElementById(`chart-holdings-${idx}`), {
      type: "bar",
      data: {
        labels: holdings.map(h => h.name),
        datasets: [{
          data: holdings.map(h => h.weight || 0),
          backgroundColor: f.color,
          borderRadius: 4,
        }],
      },
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ctx.parsed.x + "%" } } },
        scales: { x: { ticks: { callback: (v) => v + "%" } } },
      },
    });
  });
}

// ---------- Summary slide ----------
function renderSummary() {
  const w = code => (PORTFOLIO.funds.find(f => f.code === code).weight * 100).toFixed(0);
  const points = [
    `พอร์ตกระจายการลงทุนใน 5 ธีมหลัก: หุ้นสหรัฐฯ (S&amp;P 500 Hedged) ${w("TLUS500-H")}%, หุ้นเทคโนโลยีโลก ${w("B-INNOTECH")}%, หุ้นธีม Smart Grid ${w("A-GRID")}%, ทองคำ (Hedged) ${w("SCBGOLDH")}%, และตราสารหนี้โลก ${w("K-GDBOND-A(A)")}%`,
    `ระดับความเสี่ยงถ่วงน้ำหนักของพอร์ตอยู่ที่ประมาณ ${computeWeightedRisk().toFixed(1)} จาก 8 ซึ่งจัดอยู่ในกลุ่มความเสี่ยงสูง เหมาะกับผู้ลงทุนที่รับความผันผวนได้และมีระยะเวลาลงทุนปานกลางถึงยาว`,
    `สัดส่วนทองคำ ${w("SCBGOLDH")}% และตราสารหนี้โลก ${w("K-GDBOND-A(A)")}% ช่วยกระจายความเสี่ยงจากความผันผวนของตลาดหุ้น`,
    `A-GRID เป็นกองทุนใหม่ที่ลงทุนตามธีม AI/Data Center และ Smart Grid ซึ่งเป็นเมกะเทรนด์ระยะยาว แต่ยังไม่มีผลการดำเนินงานจริงในระยะยาว`,
    `ควรติดตามมุมมองอัตราดอกเบี้ยสหรัฐฯ ทิศทางราคาทองคำ และผลประกอบการกลุ่มเทคโนโลยีอย่างใกล้ชิด เพื่อปรับสัดส่วนพอร์ตตามความเหมาะสม`,
  ];
  document.getElementById("summary-points").innerHTML = points.map(p => `<li>${p}</li>`).join("");
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  renderCover();
  renderAllocation();
  renderPerformanceSummary();
  renderAssetClassAndRisk();
  renderFundSlides();
  renderSummary();

  Reveal.initialize({
    width: 1280,
    height: 720,
    margin: 0.04,
    hash: true,
    controls: true,
    progress: true,
    transition: "slide",
  });
});
