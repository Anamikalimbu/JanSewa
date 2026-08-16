/**
 * constants/categoryMeta.js
 *
 * Bilingual (English / Nepali) labels for complaint categories and their
 * sub-categories. Served via GET /api/complaints/meta/categories so the
 * frontend's Category / Sub-Category dropdowns — and their translations —
 * are data-driven from a single source of truth instead of being
 * duplicated between the client and server.
 *
 * `value` always matches the COMPLAINT_CATEGORIES enum in constants/index.js.
 */
const CATEGORY_META = [
  {
    value: "Water",
    label_en: "Water Supply",
    label_ne: "पानी आपूर्ति",
    subCategories: [
      { value: "leakage",   label_en: "Pipe Leakage",        label_ne: "पाइप चुहावट" },
      { value: "no-supply", label_en: "No Water Supply",     label_ne: "पानी आपूर्ति नभएको" },
      { value: "quality",   label_en: "Water Quality Issue", label_ne: "पानीको गुणस्तर समस्या" },
      { value: "other",     label_en: "Other",               label_ne: "अन्य" },
    ],
  },
  {
    value: "Garbage",
    label_en: "Sanitation",
    label_ne: "सरसफाई",
    subCategories: [
      { value: "not-collected", label_en: "Garbage Not Collected", label_ne: "फोहोर नउठाइएको" },
      { value: "public-litter", label_en: "Litter in Public Area",  label_ne: "सार्वजनिक स्थलमा फोहोर" },
      { value: "other",         label_en: "Other",                 label_ne: "अन्य" },
    ],
  },
  {
    value: "Road",
    label_en: "Roads",
    label_ne: "सडक",
    subCategories: [
      { value: "pothole",    label_en: "Pothole / Road Damage", label_ne: "खाल्डो / सडक क्षति" },
      { value: "blockage",   label_en: "Road Blockage",         label_ne: "सडक अवरोध" },
      { value: "other",      label_en: "Other",                 label_ne: "अन्य" },
    ],
  },
  {
    value: "Electricity",
    label_en: "Electricity",
    label_ne: "बिजुली",
    subCategories: [
      { value: "outage",      label_en: "Power Outage",     label_ne: "बिजुली गएको" },
      { value: "wiring",      label_en: "Damaged Wiring",   label_ne: "बिग्रिएको तार" },
      { value: "other",       label_en: "Other",            label_ne: "अन्य" },
    ],
  },
  {
    value: "Drainage",
    label_en: "Drainage",
    label_ne: "ढल निकास",
    subCategories: [
      { value: "blocked",   label_en: "Blocked Drain",   label_ne: "अवरुद्ध ढल" },
      { value: "overflow",  label_en: "Drain Overflow",  label_ne: "ढल ओभरफ्लो" },
      { value: "other",     label_en: "Other",           label_ne: "अन्य" },
    ],
  },
  {
    value: "StreetLight",
    label_en: "Street Light",
    label_ne: "सडक बत्ती",
    subCategories: [
      { value: "not-working", label_en: "Street Light Not Working", label_ne: "सडक बत्ती बलेको छैन" },
      { value: "damaged-pole", label_en: "Damaged Pole",             label_ne: "बिग्रिएको खम्बा" },
      { value: "other",        label_en: "Other",                    label_ne: "अन्य" },
    ],
  },
  {
    value: "Other",
    label_en: "Other",
    label_ne: "अन्य",
    subCategories: [
      { value: "other", label_en: "Other", label_ne: "अन्य" },
    ],
  },
];

module.exports = CATEGORY_META;
