-- ============================================================
-- Hospital Medication Database Schema
-- อ้างอิง: บัญชียาหลักแห่งชาติ (NDLT), WHO Essential Medicines,
--          DailyMed (NIH/FDA), MIMS Thailand, BNF (NICE)
-- ============================================================

-- -----------------------------------------------
-- 1. หมวดหมู่ยา (Drug Categories / ATC Classification)
-- -----------------------------------------------
CREATE TABLE drug_categories (
    id              SERIAL PRIMARY KEY,
    atc_code        VARCHAR(10) UNIQUE,          -- WHO ATC code เช่น J01CA04
    atc_level1      VARCHAR(100) NOT NULL,        -- ระดับ 1: Anatomical main group
    atc_level2      VARCHAR(100),                 -- ระดับ 2: Therapeutic main group
    atc_level3      VARCHAR(100),                 -- ระดับ 3: Therapeutic/pharmacological subgroup
    atc_level4      VARCHAR(100),                 -- ระดับ 4: Chemical/therapeutic/pharmacological
    name_th         VARCHAR(200),                 -- ชื่อหมวดหมู่ภาษาไทย
    name_en         VARCHAR(200) NOT NULL,        -- ชื่อหมวดหมู่ภาษาอังกฤษ
    ndlt_list       VARCHAR(10),                  -- บัญชียาหลักแห่งชาติ: ก, ข, ค, ง, จ
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 2. รูปแบบยา (Dosage Forms)
-- -----------------------------------------------
CREATE TABLE dosage_forms (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(20) UNIQUE NOT NULL,  -- รหัสรูปแบบ เช่น TAB, CAP, INJ
    name_th         VARCHAR(100) NOT NULL,        -- ชื่อภาษาไทย เช่น เม็ด, แคปซูล
    name_en         VARCHAR(100) NOT NULL,        -- ชื่อภาษาอังกฤษ
    route           VARCHAR(100)                  -- เส้นทางให้ยา เช่น Oral, Intravenous
);

-- -----------------------------------------------
-- 3. หน่วยความเข้มข้น (Units)
-- -----------------------------------------------
CREATE TABLE units (
    id              SERIAL PRIMARY KEY,
    symbol          VARCHAR(20) UNIQUE NOT NULL,  -- เช่น mg, mcg, g, mL, IU
    name_th         VARCHAR(50),
    name_en         VARCHAR(50) NOT NULL
);

-- -----------------------------------------------
-- 4. ข้อมูลยาหลัก (Drugs)
-- -----------------------------------------------
CREATE TABLE drugs (
    id                      SERIAL PRIMARY KEY,
    drug_code               VARCHAR(20) UNIQUE NOT NULL,     -- รหัสยาภายในโรงพยาบาล
    generic_name_th         VARCHAR(300) NOT NULL,           -- ชื่อสามัญภาษาไทย
    generic_name_en         VARCHAR(300) NOT NULL,           -- ชื่อสามัญภาษาอังกฤษ (INN)
    brand_names             TEXT[],                          -- ชื่อการค้า (array)
    category_id             INT REFERENCES drug_categories(id),
    dosage_form_id          INT REFERENCES dosage_forms(id),
    strength                VARCHAR(100),                    -- ความแรง เช่น 500 mg, 250 mg/5 mL
    strength_value          NUMERIC,                         -- ค่าตัวเลข
    strength_unit_id        INT REFERENCES units(id),

    -- ข้อมูลเภสัชวิทยา
    pharmacological_class   VARCHAR(200),                    -- กลุ่มทางเภสัชวิทยา
    mechanism_of_action_th  TEXT,                            -- กลไกการออกฤทธิ์ (ไทย)
    mechanism_of_action_en  TEXT,                            -- กลไกการออกฤทธิ์ (อังกฤษ)
    pharmacokinetics        JSONB,                           -- เภสัชจลนศาสตร์ (onset, peak, duration, half_life, protein_binding)

    -- การใช้ยา
    indications_th          TEXT,                            -- ข้อบ่งใช้ (ไทย)
    indications_en          TEXT,                            -- ข้อบ่งใช้ (อังกฤษ)
    dosage_adult_th         TEXT,                            -- ขนาดยาผู้ใหญ่ (ไทย)
    dosage_adult_en         TEXT,                            -- ขนาดยาผู้ใหญ่ (อังกฤษ)
    dosage_pediatric_th     TEXT,                            -- ขนาดยาเด็ก (ไทย)
    dosage_pediatric_en     TEXT,                            -- ขนาดยาเด็ก (อังกฤษ)
    dosage_elderly_note     TEXT,                            -- หมายเหตุการปรับขนาดยาในผู้สูงอายุ
    max_daily_dose          VARCHAR(100),                    -- ขนาดสูงสุดต่อวัน
    route_of_administration VARCHAR(200),                    -- เส้นทางการให้ยา

    -- ความปลอดภัย
    contraindications_th    TEXT,                            -- ข้อห้ามใช้ (ไทย)
    contraindications_en    TEXT,                            -- ข้อห้ามใช้ (อังกฤษ)
    warnings_th             TEXT,                            -- คำเตือน (ไทย)
    warnings_en             TEXT,                            -- คำเตือน (อังกฤษ)
    pregnancy_category      VARCHAR(5),                      -- FDA Pregnancy Category (A/B/C/D/X)
    pregnancy_note_th       TEXT,                            -- หมายเหตุการใช้ในครรภ์ (ไทย)
    lactation_note_th       TEXT,                            -- หมายเหตุการใช้ขณะให้นม (ไทย)
    renal_adjustment        TEXT,                            -- การปรับขนาดยาในผู้ป่วยโรคไต
    hepatic_adjustment      TEXT,                            -- การปรับขนาดยาในผู้ป่วยโรคตับ

    -- ผลข้างเคียง
    adverse_effects_common_th   TEXT,                        -- ผลข้างเคียงที่พบบ่อย (ไทย)
    adverse_effects_serious_th  TEXT,                        -- ผลข้างเคียงรุนแรง (ไทย)

    -- การเก็บรักษา
    storage_condition_th    TEXT,                            -- เงื่อนไขการเก็บรักษา (ไทย)
    storage_condition_en    TEXT,
    storage_temperature_min NUMERIC,                         -- อุณหภูมิต่ำสุด (°C)
    storage_temperature_max NUMERIC,                         -- อุณหภูมิสูงสุด (°C)
    protect_from_light      BOOLEAN DEFAULT FALSE,           -- ป้องกันแสง
    protect_from_moisture   BOOLEAN DEFAULT FALSE,           -- ป้องกันความชื้น
    refrigerate             BOOLEAN DEFAULT FALSE,           -- แช่เย็น (2-8°C)

    -- ราคาและทะเบียน
    thai_fda_reg_no         VARCHAR(50),                     -- เลขทะเบียนยา อย.
    ndlt_category           VARCHAR(5),                      -- บัญชียาหลักแห่งชาติ
    narcotic_class          VARCHAR(20),                     -- ประเภทวัตถุเสพติด (ถ้ามี)
    is_high_alert           BOOLEAN DEFAULT FALSE,           -- ยาความเสี่ยงสูง (High Alert Drug)
    is_lasa                 BOOLEAN DEFAULT FALSE,           -- Look-Alike Sound-Alike Drug
    lasa_pairs              TEXT[],                          -- คู่ยา LASA

    -- แหล่งอ้างอิง
    references              TEXT[],                          -- แหล่งอ้างอิง

    -- metadata
    is_active               BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 5. ปฏิกิริยาระหว่างยา (Drug Interactions)
-- -----------------------------------------------
CREATE TABLE drug_interactions (
    id              SERIAL PRIMARY KEY,
    drug_id_1       INT NOT NULL REFERENCES drugs(id),
    drug_id_2       INT NOT NULL REFERENCES drugs(id),
    severity        VARCHAR(20) NOT NULL CHECK (severity IN ('contraindicated', 'major', 'moderate', 'minor')),
    severity_th     VARCHAR(50),                             -- รุนแรงมาก / รุนแรง / ปานกลาง / น้อย
    mechanism_th    TEXT,                                    -- กลไกการเกิดปฏิกิริยา
    mechanism_en    TEXT,
    clinical_effect_th  TEXT,                               -- ผลทางคลินิก
    management_th   TEXT,                                    -- การจัดการ
    reference       TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_drug_pair UNIQUE (drug_id_1, drug_id_2)
);

-- -----------------------------------------------
-- 6. ข้อมูล Allergy Cross-Reactivity
-- -----------------------------------------------
CREATE TABLE allergy_cross_reactivity (
    id              SERIAL PRIMARY KEY,
    drug_id         INT NOT NULL REFERENCES drugs(id),
    cross_react_with    VARCHAR(200) NOT NULL,               -- กลุ่มยาที่แพ้ข้าม
    probability     VARCHAR(20),                             -- โอกาสแพ้ข้าม: high/moderate/low
    note_th         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 7. Antidotes (ยาแก้พิษ)
-- -----------------------------------------------
CREATE TABLE antidotes (
    id              SERIAL PRIMARY KEY,
    drug_id         INT NOT NULL REFERENCES drugs(id),       -- ยาที่ต้องการยาแก้พิษ
    antidote_drug_id    INT REFERENCES drugs(id),            -- ยาแก้พิษ (ถ้ามีในระบบ)
    antidote_name   VARCHAR(200),                            -- ชื่อยาแก้พิษ
    dose_th         TEXT,                                    -- ขนาดยาแก้พิษ
    note_th         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 8. Indexes
-- -----------------------------------------------
CREATE INDEX idx_drugs_generic_name_en ON drugs (generic_name_en);
CREATE INDEX idx_drugs_generic_name_th ON drugs (generic_name_th);
CREATE INDEX idx_drugs_category ON drugs (category_id);
CREATE INDEX idx_drugs_ndlt ON drugs (ndlt_category);
CREATE INDEX idx_drugs_high_alert ON drugs (is_high_alert);
CREATE INDEX idx_drug_interactions_drug1 ON drug_interactions (drug_id_1);
CREATE INDEX idx_drug_interactions_drug2 ON drug_interactions (drug_id_2);
CREATE INDEX idx_drug_interactions_severity ON drug_interactions (severity);
