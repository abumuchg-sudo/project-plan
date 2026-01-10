import { ai } from "./replit_integrations/image/client"; // Reusing the client
import { Case } from "@shared/schema";
import { storage } from "./storage";

// --- PROMPTS (Translated/Copied from Python) ---

const PROMPT_ARCHITECT = `
### תפקיד: ארכיטקט נתונים רפואי-משפטי (Medical-Legal Data Architect)

**קלט:** טקסט מתוך קובץ PDF.

### מטרות:
1. **OCR מדויק:** חלץ טקסט מכל עמוד.
2. **זיהוי ישויות:** פרטי נבדק, תאריך האירוע, סוג הפגיעה.
3. **סדר כרונולוגי:** תהליך אירוע → היום.

### הוראות ביצוע:
- אל תנחש. כל נתון חייב להיות מהמסמך.
- תאריכים: הצג בפורמט DD/MM/YYYY.
- התמקד ברפואה, תעלם מטפסים אדמיניסטרטיביים.

### פלט נדרש (טקסט רגיל, לא HTML):
1. **פרטי הנבדק:** שם, תעודת זהות, תאריך לידה, גיל, מקצוע.
2. **האירוע המכונן:** תאריך, סוג (ת"ד/עבודה/אחר), מנגנון הפגיעה.
3. **איברים נפגעים:** רשימה של איברים (למשל: עמוד שדרה מותני, כתף ימין).
4. **רצף מסמכים:** רשימה כרונולוגית (תאריך | סוג מסמך | מוסד).
`;

const PROMPT_MINER = `
### תפקיד: כורה נתונים קליני (Clinical Data Miner)

**קלט:** קובץ התיק (טקסט) + סיכום הארכיטקט.
**מטרה:** חילוץ נתונים קליניים לכתיבת חוות הדעת.

### עקרונות ברזל:
1. **הפרדה S/O:** תלונות סובייקטיביות (מה המטופל אמר) VS ממצאים אובייקטיביים (מה הרופא ראה).
2. **נרמול:** אם כתוב "הגבלה בכיפוף", חפש מעלות. אם אין מספר → כתוב "לא צוין".
3. **בדיקות הדמיה:** CT/MRI/US/רנטגן - חלץ תאריך, סוג, אזור, וממצאים עיקריים.

### חלץ ולסדר:
1. **היסטוריה רפואית:** סיכום של אירוע → היום (כולל ניתוחים וטיפולים).
2. **ממצאי הדמיה:** תאריך, סוג, ממצאים.
3. **בדיקה גופנית:** הבדיקה העדכנית ביותר - טווחי תנועה, מבחנים, כוח, תחושה.
4. **טיפולים:** רשימת תרופות וטיפול פיזיו (שם התרופה, דרך מתן, תאריכים).

**פלט:** טקסט רגיל, מובנה וברור.
`;

const PROMPT_ADJUDICATOR_TEMPLATE = (mode: string) => `
### תפקיד: מומחה פסיקה רפואית (Medical Adjudicator)

**קלט:** נתונים קליניים (מהכורה).
**מצב עבודה:** ${mode}

### הגדרות מצב:
1. **NEUTRAL (ניטרלי):** אם יש ספק → אין נכות. היה יבש ועובדתי.
2. **AGGRESSIVE (אגרסיבי):** 
   - בכל טווח תנועה גבולי → בחר בערך הגבוה יותר.
   - חפש קשר בין פגיעה למקצוע וקבע אם יש נכות לעבודה.
   - אם אפשר לפצל (גב + רגל) → עשה זאת.

### משימתך - כתיבת חוות הדעת:
כתוב טקסט קצר בלבד (לא HTML) שיכיל:

1. **היסטוריה:** סיכום נרטיבי של המקרה.
2. **בדיקה גופנית:** פרטים על איברים שנבדקו ותוצאות.
3. **ממצאי הדמיה:** סיכום בדיקות אובייקטיביות.
4. **טיפולים:** סיכום של התרופות והטיפולים.
5. **דיון ומסקנות (הליבה):** שכנע מדוע יש (או אין) נכות, הסבר קשר סיבתי, התייחס לתקנות.
6. **טבלת ליקויים:** רשימת סעיפים (מספר, תיאור, אחוז).

**אל תעצב HTML. רק כתוב טקסט מקצועי בפורמט ברור.**
`;

const PROMPT_FORMATTER = `
### תפקיד: מעצב HTML (Layout Engine)

**קלט:** תוכן חוות הדעת (טקסט) מהפוסק.
**מטרה:** המרת טקסט ל-HTML עם Classes נכונים, כולל טבלה בסעיף טיפולים.

### הוראות עיצוב (CSS Classes):
- השתמש ב-<div class="section"> לפסקאות.
- השתמש ב-<ol class="numbered-list"> לרשימות.
- השתמש ב-<div class="item-container"> עבור ממצאים (בדיקה גופנית, הדמיה).
- השתמש ב-<div class="summary-box"> לסיכום ומסקנות.
- השתמש ב-<div class="disability-section"> לטבלת ליקויים.

**חשוב:**
- עבור סעיף "טיפולים ושיקום", בנה טבלת HTML אמיתית עם עיצוב (border, padding, rtl).
- אל תכלול <html>, <head>, <body>. רק את תוכן ה-Body.
- וודא כיוון RTL.

הפוך את הטקסט ל-HTML נקי ומקצועי.
`;

// --- Agent Logic ---

async function runGemini(systemPrompt: string, userContent: string, model = "gemini-2.5-flash") {
  const response = await ai.models.generateContent({
    model: model,
    contents: [
      { role: "user", parts: [{ text: systemPrompt + "\n\n### INPUT:\n" + userContent }] }
    ]
  });
  return response.response.text();
}

export async function processCase(caseId: number, pdfText: string) {
  try {
    const caseItem = await storage.getCase(caseId);
    if (!caseItem) return;

    await storage.updateCase(caseId, { status: "processing" });

    // 1. Architect
    console.log(`Case ${caseId}: Running Architect...`);
    const architectOutput = await runGemini(PROMPT_ARCHITECT, pdfText);
    await storage.updateCase(caseId, { architectOutput });

    // 2. Miner
    console.log(`Case ${caseId}: Running Miner...`);
    const minerOutput = await runGemini(PROMPT_MINER, `Original Text (Partial):\n${pdfText.substring(0, 5000)}\n\nArchitect Output:\n${architectOutput}`);
    await storage.updateCase(caseId, { minerOutput });

    // 3. Adjudicator
    console.log(`Case ${caseId}: Running Adjudicator...`);
    const adjudicatorOutput = await runGemini(PROMPT_ADJUDICATOR_TEMPLATE(caseItem.mode), minerOutput, "gemini-2.5-pro"); // Use Pro for reasoning
    await storage.updateCase(caseId, { adjudicatorOutput });

    // 4. Formatter
    console.log(`Case ${caseId}: Running Formatter...`);
    const formatterOutput = await runGemini(PROMPT_FORMATTER, adjudicatorOutput);
    
    await storage.updateCase(caseId, { 
      formatterOutput,
      status: "completed"
    });
    console.log(`Case ${caseId}: Completed.`);

  } catch (error) {
    console.error(`Case ${caseId} Failed:`, error);
    await storage.updateCase(caseId, { status: "error" });
  }
}
