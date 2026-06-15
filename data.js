// ============================================================
// Portfolio & Fund Data
// ข้อมูล ณ วันที่ 15 มิถุนายน 2569 (15 June 2026)
// รวบรวมจากแหล่งข้อมูลสาธารณะ (Finnomena, WealthMagik, SettTrade,
// เว็บไซต์ บลจ. เจ้าของกองทุน) ตัวเลขผลตอบแทนเป็นข้อมูลโดยประมาณ
// เพื่อการนำเสนอ ควรตรวจสอบกับ Fund Fact Sheet ฉบับล่าสุดก่อนใช้งานจริง
// ============================================================

const TOTAL_INVESTMENT = 1000000; // ตัวอย่างเงินลงทุน 1,000,000 บาท

const PORTFOLIO = {
  asOf: "15 มิถุนายน 2569 (2026)",
  funds: [
    {
      code: "TLUS500-H",
      shortName: "Talis หุ้นยูเอส 500-Hedge",
      fullNameTh: "กองทุนเปิดทาลิส หุ้นยูเอส 500-HEDGE",
      fullNameEn: "Talis US Equity 500 Hedge Fund",
      amc: "บลจ. ทาลิส (Talis Asset Management)",
      weight: 0.30,
      color: "#1f6feb",
      assetClass: "หุ้นสหรัฐฯ ขนาดใหญ่ (US Large Cap Equity, Hedged)",
      riskLevel: 6,
      isNew: false,
    },
    {
      code: "B-INNOTECH",
      shortName: "BBLAM Global Innovation & Technology",
      fullNameTh: "กองทุนเปิดบัวหลวงโกลบอลอินโนเวชั่นและเทคโนโลยี",
      fullNameEn: "Bualuang Global Innovation and Technology Fund",
      amc: "บลจ. บัวหลวง (BBLAM)",
      weight: 0.20,
      color: "#2ca58d",
      assetClass: "หุ้นเทคโนโลยีและนวัตกรรมโลก (Global Technology Equity)",
      riskLevel: 7,
      isNew: false,
    },
    {
      code: "A-GRID",
      shortName: "Asset Plus Smart Grid",
      fullNameTh: "กองทุนเปิดเอแทรคเกอร์ส สมาร์ท กริด",
      fullNameEn: "Atrackers Smart Grid Fund",
      amc: "บลจ. แอสเซท พลัส (Asset Plus AM)",
      weight: 0.10,
      color: "#e07a5f",
      assetClass: "หุ้นธีม Smart Grid / โครงข่ายไฟฟ้าโลก (Thematic Equity)",
      riskLevel: 6,
      isNew: true,
    },
    {
      code: "SCBGOLDH",
      shortName: "SCB Gold THB Hedged",
      fullNameTh: "กองทุนเปิดไทยพาณิชย์โกลด์ THB เฮดจ์ (ชนิดสะสมมูลค่า)",
      fullNameEn: "SCB Gold THB Hedged Open End Fund",
      amc: "บลจ. ไทยพาณิชย์ (SCBAM)",
      weight: 0.20,
      color: "#f2b134",
      assetClass: "ทองคำ (Gold, THB Hedged)",
      riskLevel: 8,
      isNew: false,
    },
    {
      code: "K-GDBOND-A(A)",
      shortName: "K Global Dynamic Bond-A Acc",
      fullNameTh: "กองทุนเปิดเค โกลบอล ไดนามิก บอนด์-A ชนิดสะสมมูลค่า",
      fullNameEn: "K Global Dynamic Bond Fund-A (Accumulation)",
      amc: "บลจ. กสิกรไทย (KAsset)",
      weight: 0.20,
      color: "#7c3aed",
      assetClass: "ตราสารหนี้โลก (Global Bond)",
      riskLevel: 5,
      isNew: false,
    },
  ],
};

// Performance periods used across the deck
const PERIODS = ["YTD", "3M", "6M", "1Y", "3Y", "5Y"];

// Performance data (%, 3Y/5Y annualized)
// หมายเหตุ: YTD ของหลายกองทุนใช้ค่าประมาณจากผลตอบแทน 6 เดือนล่าสุด
// (trailing 6M ใกล้เคียงช่วงต้นปีถึงปัจจุบัน) เนื่องจากไม่พบตัวเลข YTD ที่ระบุชัดเจน
const FUND_PERFORMANCE = {
  "TLUS500-H": {
    YTD: 7.8, "3M": 5.33, "6M": 7.77, "1Y": 27.25, "3Y": null, "5Y": null,
    benchmark: { YTD: 8.3, "3M": 5.8, "6M": 8.3, "1Y": 28.5, "3Y": 18.0, "5Y": 17.5 },
  },
  "B-INNOTECH": {
    YTD: 19.7, "3M": 16.74, "6M": 19.74, "1Y": 36.47, "3Y": 15.85, "5Y": 9.43,
    benchmark: { YTD: 20.0, "3M": 17.0, "6M": 20.0, "1Y": 38.0, "3Y": 20.0, "5Y": 22.0 },
  },
  "A-GRID": {
    // ใช้ผลตอบแทนของ GRID ETF (กองทุนหลักอ้างอิง) เนื่องจาก A-GRID จัดตั้งใหม่ (IPO ก.พ. 2569)
    YTD: 27.6, "3M": 14.0, "6M": 22.0, "1Y": 43.32, "3Y": 18.7, "5Y": 16.1,
    benchmark: { YTD: 27.9, "3M": 14.2, "6M": 22.3, "1Y": 43.6, "3Y": 19.0, "5Y": 16.4 },
  },
  "SCBGOLDH": {
    YTD: 42.0, "3M": 21.33, "6M": 42.07, "1Y": 68.66, "3Y": 34.78, "5Y": 20.74,
    benchmark: { YTD: 41.0, "3M": 20.8, "6M": 41.0, "1Y": 67.5, "3Y": 34.0, "5Y": 20.2 },
  },
  "K-GDBOND-A(A)": {
    YTD: 0.33, "3M": -0.35, "6M": 0.33, "1Y": 3.80, "3Y": 4.0, "5Y": 3.0,
    benchmark: { YTD: 1.0, "3M": 0.0, "6M": 1.0, "1Y": 4.0, "3Y": 2.0, "5Y": 1.0 },
  },
};

// Fund detail content
const FUND_DETAILS = {
  "TLUS500-H": {
    factsLine: "จัดตั้ง: 12 มี.ค. 2568 (2025) &nbsp;|&nbsp; ขนาดกองทุน: ~144.7 ล้านบาท &nbsp;|&nbsp; ไม่มีนโยบายจ่ายเงินปันผล (สะสมมูลค่า)",
    perfAsOf: "มิ.ย. 2569 (โดยประมาณ)",
    benchmarkName: "S&P 500 TR (USD, Hedged)",
    holdingsOf: "iShares Core S&P 500 ETF",
    policyText: `
      กองทุนรวมฟีดเดอร์ (Feeder Fund) ลงทุนในหน่วยลงทุนของ <strong>iShares Core S&amp;P 500 ETF</strong>
      (บริหารโดย BlackRock) เฉลี่ยไม่น้อยกว่า 80% ของ NAV ต่อปี ซึ่งลงทุนในหุ้นบริษัทขนาดใหญ่ของสหรัฐฯ
      ที่เป็นส่วนประกอบของดัชนี S&amp;P 500 ครอบคลุมทุกกลุ่มอุตสาหกรรม นำโดยกลุ่มเทคโนโลยี<br/><br/>
      มีนโยบาย<strong>ป้องกันความเสี่ยงอัตราแลกเปลี่ยนไม่น้อยกว่า 90%</strong> ของมูลค่าเงินลงทุนในต่างประเทศ (Hedged)
      ช่วยลดผลกระทบจากความผันผวนของค่าเงินบาท/ดอลลาร์สหรัฐฯ<br/><br/>
      เหมาะสำหรับผู้ลงทุนที่ต้องการสร้างผลตอบแทนระยะยาวตามการเติบโตของเศรษฐกิจและตลาดหุ้นสหรัฐฯ
      ซึ่งเป็นตลาดหุ้นที่มีขนาดใหญ่และมีสภาพคล่องสูงที่สุดของโลก
    `,
    outlookText: `
      มุมมองต่อตลาดหุ้นสหรัฐฯ ปี 2569 ยังเป็นเชิงบวกอย่างมีเหตุผล (Constructive) แม้ระดับมูลค่า (Valuation) อยู่ในระดับสูง:
      <ul class="tight">
        <li>Goldman Sachs คาดกำไรบริษัทใน S&amp;P 500 (EPS) เติบโตราว <strong>12%</strong> ในปี 2569 หนุนดัชนีปรับขึ้นต่อ</li>
        <li>Morgan Stanley: "Constructive, Not Complacent" - เชิงบวกแต่เตือนความเสี่ยงด้าน Valuation ที่ตึงตัว</li>
        <li>J.P. Morgan Private Bank: คงมุมมองเชิงบวกแม้ตลาดอาจเผชิญความผันผวนระยะสั้น</li>
        <li>กลุ่มเทคโนโลยีและการลงทุนด้าน AI ยังเป็นแรงขับเคลื่อนหลักของดัชนี S&amp;P 500</li>
      </ul>
    `,
    topHoldings: [
      { name: "NVIDIA Corp", weight: 7.31 },
      { name: "Apple Inc", weight: 6.63 },
      { name: "Microsoft Corp", weight: 4.96 },
      { name: "Amazon.com Inc", weight: 3.47 },
      { name: "Alphabet Inc Class A", weight: 3.08 },
      { name: "Broadcom Inc", weight: 2.56 },
      { name: "Alphabet Inc Class C", weight: 2.46 },
      { name: "Meta Platforms Inc", weight: 2.40 },
      { name: "Tesla Inc", weight: 1.92 },
      { name: "Berkshire Hathaway Class B", weight: 1.57 },
    ],
  },

  "B-INNOTECH": {
    factsLine: "จัดตั้ง: 10 มี.ค. 2560 (2017) &nbsp;|&nbsp; ค่าธรรมเนียมจัดการ ~1.07% ต่อปี (TER ~1.42%) &nbsp;|&nbsp; ไม่มีนโยบายจ่ายเงินปันผล",
    perfAsOf: "มิ.ย. 2569 (โดยประมาณ)",
    benchmarkName: "MSCI ACWI Information Technology",
    holdingsOf: "Fidelity Funds - Global Technology Fund",
    policyText: `
      กองทุนรวมฟีดเดอร์ ลงทุนในหน่วยลงทุนของ <strong>Fidelity Funds - Global Technology Fund
      (Class Y-ACC-USD)</strong> เฉลี่ยไม่น้อยกว่า 80% ของ NAV ต่อปี<br/><br/>
      กองทุนหลักใช้แนวทาง Bottom-up เลือกหุ้นบริษัทเทคโนโลยีและนวัตกรรมทั่วโลก ที่คาดว่าจะได้รับประโยชน์จาก
      ความก้าวหน้าทางเทคโนโลยี ครอบคลุม Semiconductor, Software, Hardware, Internet Services, Fintech
      และ AI Value Chain ทั่วโลก ไม่กระจุกตัวเฉพาะหุ้นเทคโนโลยีขนาดใหญ่กลุ่มเดียว (แนวทาง "AI-basket")<br/><br/>
      นโยบายป้องกันความเสี่ยงอัตราแลกเปลี่ยนเป็นไปตาม<strong>ดุลยพินิจของผู้จัดการกองทุน</strong> (Discretionary)
      จึงอาจมีความเสี่ยงจากอัตราแลกเปลี่ยนบางส่วน
    `,
    outlookText: `
      BBLAM จัดให้ B-INNOTECH เป็นหนึ่งในกองทุนแนะนำ (B-SELECT) สำหรับครึ่งปีหลังปี 2569
      จากแนวโน้มการลงทุนด้าน AI Infrastructure ที่ยังขยายตัวต่อเนื่อง:
      <ul class="tight">
        <li>Fidelity (ผู้จัดการกองทุนหลัก) คาดการลงทุนด้าน AI Infrastructure จาก Hyperscaler
        และภาคธุรกิจจะเติบโตต่อเนื่องในปี 2569 โดยกลุ่ม Semiconductor เป็นพระเอกหลัก</li>
        <li>ใช้แนวทาง "AI-basket" กระจายความเสี่ยงในหุ้นกลุ่ม Semiconductor, Hardware, Software และ Services</li>
        <li>ตลาดยังแบ่งขั้วระหว่างหุ้น "AI Winners" และ "AI Losers" โดยเฉพาะกลุ่ม Application Software
        ที่เผชิญแรงกดดันจาก AI Disruption</li>
      </ul>
    `,
    topHoldings: [
      { name: "Taiwan Semiconductor (TSMC)", weight: 7.10 },
      { name: "Microsoft Corp", weight: 5.65 },
      { name: "Apple Inc", weight: 4.17 },
      { name: "Telefonaktiebolaget LM Ericsson", weight: 3.24 },
      { name: "Amazon.com Inc", weight: 3.05 },
      { name: "Alphabet Inc", weight: 2.91 },
      { name: "Workday Inc", weight: 2.14 },
      { name: "Meta Platforms Inc", weight: 1.77 },
    ],
  },

  "A-GRID": {
    factsLine: "IPO: 5-12 ก.พ. 2569 (2026) &nbsp;|&nbsp; ขนาดกองทุน (เป้าหมาย) 1,000 ลบ. &nbsp;|&nbsp; ค่าธรรมเนียมจัดการ 1.61% ต่อปี, Front-end 1.25% &nbsp;|&nbsp; ไม่มีนโยบายจ่ายเงินปันผล",
    perfAsOf: "ข้อมูล GRID ETF ณ ปลายปี 2568 - มิ.ย. 2569 (Proxy)",
    benchmarkName: "Nasdaq Clean Edge Smart Grid Infra Index",
    holdingsOf: "First Trust NASDAQ Clean Edge Smart Grid Infrastructure Index Fund (GRID ETF)",
    policyText: `
      กองทุนรวมฟีดเดอร์จัดตั้งใหม่ (IPO 5-12 ก.พ. 2569) ลงทุนในหน่วยลงทุนของ
      <strong>First Trust NASDAQ Clean Edge Smart Grid Infrastructure Index Fund (GRID ETF)</strong>
      ซึ่งเป็น ETF เชิง Passive ลงทุนในหุ้นบริษัททั่วโลก (~114-128 บริษัท เน้นสหรัฐฯ และยุโรป)
      ที่มีรายได้หลัก (≥50%) จากธุรกิจ Smart Grid และโครงสร้างพื้นฐานไฟฟ้า ครอบคลุม Grid Infrastructure,
      ระบบกักเก็บพลังงาน (Energy Storage), มิเตอร์ไฟฟ้าอัจฉริยะ และซอฟต์แวร์บริหารจัดการโครงข่ายไฟฟ้า<br/><br/>
      <strong>แนวคิดการลงทุน:</strong> ไฟฟ้าเป็น 1 ใน 4 เสาหลักของ AI Data Center -
      "AI จะเติบโตได้ ต้องมีไฟฟ้าเพียงพอ" การขยายตัวของ AI/Data Center ผลักดันความต้องการใช้ไฟฟ้า
      และการลงทุนปรับปรุงโครงข่ายไฟฟ้าทั่วโลก (Grid Modernization, Electrification, EV)<br/><br/>
      GRID ETF จัดตั้งมาตั้งแต่ปี 2009 ขนาดสินทรัพย์ ~5.9 พันล้านดอลลาร์ ได้ Morningstar 5 ดาว
      (ข้อมูล ณ 31 ธ.ค. 2568)
    `,
    outlookText: `
      Asset Plus มองว่าธีม Smart Grid เป็น Mega Trend ระยะยาวที่ได้รับแรงหนุนจาก:
      <ul class="tight">
        <li>ความต้องการไฟฟ้าจาก Data Center และ AI ที่เพิ่มขึ้นอย่างก้าวกระโดด</li>
        <li>การลงทุนปรับปรุงโครงข่ายไฟฟ้าเก่าในสหรัฐฯ และยุโรป (Grid Modernization)</li>
        <li>การเปลี่ยนผ่านสู่พลังงานสะอาดและการขยายตัวของยานยนต์ไฟฟ้า (Electrification)</li>
      </ul>
      เหมาะเป็นส่วนเสริมพอร์ตเพื่อกระจายความเสี่ยงจากหุ้นเทคโนโลยีกลุ่มเดิม
      และรับโอกาสจากธีม AI ในมุมโครงสร้างพื้นฐานพลังงาน
    `,
    topHoldings: [
      { name: "ABB Ltd", weight: 8.37 },
      { name: "Eaton Corporation", weight: 7.89 },
      { name: "Johnson Controls Intl", weight: 7.63 },
      { name: "Schneider Electric S.E.", weight: 7.12 },
      { name: "National Grid plc", weight: 6.76 },
      { name: "Quanta Services", weight: 4.35 },
      { name: "E.ON SE", weight: 4.10 },
      { name: "Prysmian S.p.A.", weight: 3.97 },
      { name: "Hubbell Inc.", weight: 2.88 },
      { name: "nVent Electric", weight: 2.13 },
    ],
  },

  "SCBGOLDH": {
    factsLine: "ค่าธรรมเนียมจัดการ ~0.436% ต่อปี (TER ~0.54%) &nbsp;|&nbsp; ไม่มีนโยบายจ่ายเงินปันผล (ชนิดสะสมมูลค่า)",
    perfAsOf: "มิ.ย. 2569 (โดยประมาณ)",
    benchmarkName: "ราคาทองคำโลก (LBMA Gold, THB Hedged)",
    holdingsOf: "SPDR Gold Shares (SPDR Gold Trust)",
    policyText: `
      กองทุนรวมฟีดเดอร์ ลงทุนในกองทุน <strong>SPDR Gold Shares (SPDR Gold Trust)</strong>
      ประมาณ 99-100% ของ NAV ซึ่งถือทองคำแท่ง (Physical Gold Bullion) เป็นสินทรัพย์หลัก<br/><br/>
      มีนโยบาย<strong>ป้องกันความเสี่ยงอัตราแลกเปลี่ยนไม่น้อยกว่า 90%</strong> ของมูลค่าเงินลงทุนต่างประเทศ
      (THB Hedged) ทำให้ผลตอบแทนสะท้อนการเปลี่ยนแปลงของราคาทองคำในตลาดโลก (USD)
      โดยลดผลกระทบจากความผันผวนค่าเงินบาท/ดอลลาร์สหรัฐฯ<br/><br/>
      เป็นชนิดสะสมมูลค่า (ไม่จ่ายเงินปันผล) เหมาะใช้เป็นส่วนหนึ่งของพอร์ตเพื่อกระจายความเสี่ยง
      ป้องกันเงินเฟ้อ และถือครองสินทรัพย์ปลอดภัย (Safe Haven) ในภาวะตลาดผันผวน
    `,
    outlookText: `
      ราคาทองคำยังอยู่ในแนวโน้มขาขึ้นเชิงโครงสร้าง (Structural Bull Market) จากปัจจัยสนับสนุน:
      <ul class="tight">
        <li><strong>ธนาคารกลางซื้อทองต่อเนื่อง:</strong> จีน โปแลนด์ อินเดีย ตุรกี เป็นผู้ซื้อหลัก
        จีนซื้อต่อเนื่อง 15 เดือน (ถึง ม.ค. 2569) ธนาคารกลางทั่วโลกซื้อสุทธิ 244 ตัน ใน Q1/2569</li>
        <li><strong>เป้าราคาทองปี 2569:</strong> Goldman Sachs $5,400 / JPMorgan ~$6,000 /
        Morgan Stanley $5,200 / UBS $5,500 / Wells Fargo $6,100-6,300 (ราคาปัจจุบัน ~$4,290)</li>
        <li><strong>ความเสี่ยงระยะสั้น:</strong> ทองคำพักฐานราว 9% ในช่วง 1 เดือนที่ผ่านมาหลังปรับขึ้นแรง
        แต่แนวโน้มหลักยังเป็นบวกจากความต้องการสินทรัพย์ปลอดภัยและการกระจายเงินสำรองออกจากดอลลาร์</li>
      </ul>
    `,
    topHoldings: [
      { name: "SPDR Gold Shares (Gold Bullion ETF)", weight: 99.0 },
      { name: "เงินสดและรายการเทียบเท่าเงินสด", weight: 1.0 },
    ],
  },

  "K-GDBOND-A(A)": {
    factsLine: "เปิด IPO: ก.ย.-ต.ค. 2564 (2021) &nbsp;|&nbsp; ขนาดกองทุน ~12,504 ล้านบาท &nbsp;|&nbsp; ค่าธรรมเนียมจัดการ ~0.80% ต่อปี, Front-end ~0.50% &nbsp;|&nbsp; ไม่มีนโยบายจ่ายเงินปันผล",
    perfAsOf: "มิ.ย. 2569 (โดยประมาณ)",
    benchmarkName: "Bloomberg Global Aggregate Bond Index (Hedged)",
    holdingsOf: "PIMCO GIS Income Fund (โดยประมาณ)",
    policyText: `
      กองทุนรวมฟีดเดอร์ ลงทุนในหน่วยลงทุนของ <strong>PIMCO GIS Income Fund (Class INST USD Acc)</strong>
      ไม่น้อยกว่า 80% ของ NAV ซึ่งเป็นกองทุนตราสารหนี้ Global Multi-Sector ที่กระจายลงทุนในตราสารหนี้ทั่วโลก
      อย่างหลากหลาย ทั้งพันธบัตรรัฐบาล ตราสารหนี้ภาคเอกชนระดับ Investment Grade
      และตราสารหนี้ที่มีสินทรัพย์ค้ำประกัน (MBS/ABS/Securitized) ซึ่งเป็นสัดส่วนหลักของพอร์ต<br/><br/>
      กองทุนหลักสามารถลงทุนในตราสารหนี้ <strong>High Yield ได้สูงสุด 50%</strong> ของสินทรัพย์
      และมี Duration โดยทั่วไปอยู่ระหว่าง 0-8 ปี<br/><br/>
      จัดอยู่ในกลุ่ม "Global Bond Discretionary FX Hedge or Unhedge" หมายความว่า บลจ. กสิกรไทย
      มีดุลยพินิจในการป้องกันความเสี่ยงอัตราแลกเปลี่ยนตามมุมมองตลาด
    `,
    outlookText: `
      มุมมองตลาดตราสารหนี้โลกปี 2569:
      <ul class="tight">
        <li><strong>PIMCO ("Rupture and Resilience"):</strong> คาด Fed ลดดอกเบี้ยในปี 2569
        โดยเฉพาะช่วงครึ่งปีหลัง แนะนำลงทุนใน Duration ระดับกลาง (5-10 ปี) เพื่อ Lock-in
        ผลตอบแทนที่น่าสนใจก่อนดอกเบี้ยลด</li>
        <li><strong>มุมมองด้าน Credit:</strong> ระมัดระวัง Spread ของตราสารหนี้ภาคเอกชนที่อยู่ในระดับแคบ
        และคาดว่าวงจรการผิดนัดชำระหนี้ (Credit Loss Cycle) เริ่มปรากฏในกลุ่มเครดิตคุณภาพต่ำ</li>
        <li><strong>มุมมอง KAsset:</strong> อัตราผลตอบแทนพันธบัตรโลกปรับตัวขึ้นจากปัจจัยเงินเฟ้อและการคลัง
        เป็นโอกาสทยอยสะสมตราสารหนี้ต่างประเทศระยะยาว</li>
      </ul>
      เหมาะเป็นส่วนลดความผันผวนของพอร์ตและสร้างกระแสรายได้สม่ำเสมอในระยะยาว
    `,
    topHoldings: [
      { name: "Securitized (MBS/ABS/CMBS)", weight: 45 },
      { name: "ตราสารหนี้ภาครัฐ (Government Bonds)", weight: 25 },
      { name: "ตราสารหนี้ภาคเอกชน (Corporate Bonds)", weight: 25 },
      { name: "เงินสดและอื่นๆ", weight: 5 },
    ],
  },
};
