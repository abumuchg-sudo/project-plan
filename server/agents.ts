import { GoogleGenAI } from "@google/genai";
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
**מטרה:** המרת טקסט ל-HTML עם Classes נכונים התואמים לעיצוב המקצועי הנדרש.

### Mapping של Classes (חובה מוחלטת):
1. **פסקאות רגילות:** <div class="section">...תוכן...</div>
2. **רשימה ממוספרת (למסמכים):** <ol class="numbered-list"><li>...</li></ol>
3. **בדיקה גופנית / הדמיה (לכל פריט):**
   <div class="item-container">
     <strong>[שם האיבר/בדיקה]:</strong>
     <div class="exam-section">...פירוט הממצאים...</div>
   </div>
4. **טיפולים ושיקום (טבלה):**
   <table style="width: 100%; border-collapse: collapse; direction: rtl; text-align: right;">
     <tr style="background-color: #f5f5f5; border-bottom: 1px solid #ddd;">
       <td style="padding: 8px; font-weight: bold;">דרך מתן:</td>
       <td style="padding: 8px;">...</td>
     </tr>
     ... (וכן הלאה לפי הפורמט שסופק)
   </table>
5. **סיכום ומסקנות:** <div class="summary-box">...</div>
6. **טבלת ליקויים:** <div class="disability-section"><div class="disability-item">...</div></div>

### סדר הפלט (Body Content בלבד):
1. <h2>מסמכים רפואיים שעמדו לרשותי</h2> + רשימה ממוספרת
2. <h2>היסטוריה רפואית</h2> + section
3. <h2>בדיקה גופנית</h2> + item-containers
4. <h2>ממצאי הדמיה ובדיקות עזר</h2> + item-containers
5. <h2>טיפולים ושיקום</h2> + טבלה
6. <h2>סיכום ומסקנות</h2> + summary-box
7. <h2>קביעת ליקויים לפי ספר הליקויים</h2> + disability-section
`;

const REPORT_CSS = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700&family=Montserrat:wght@400;500;600&display=swap');
    
    @page { size: A4; margin: 18mm 20mm; }
    * { box-sizing: border-box; }
    
    .report-body {
        font-family: 'Assistant', 'Arial', sans-serif;
        font-size: 10.5pt;
        line-height: 1.5;
        margin: 0;
        padding: 0;
        direction: rtl;
        text-align: right;
        background-color: white;
        color: #333;
    }
    
    /* Watermark */
    .watermark {
        position: fixed; bottom: 25mm; right: 25mm; width: 90mm; height: 90mm;
        opacity: 0.03; font-size: 60pt; font-weight: bold; color: #000;
        pointer-events: none; z-index: 0; display: flex; align-items: center; justify-content: center;
    }
    
    /* Document Container */
    .document {
        background: white; max-width: 210mm; margin: 0 auto; position: relative; padding: 10px;
    }
    
    /* Header */
    .header {
        text-align: center; margin-bottom: 25px; padding-top: 8px; border-top: 4px solid #bfa85c;
    }
    .header-top {
        display: flex; justify-content: center; align-items: center; margin: 15px 0 10px 0; gap: 25px;
    }
    .header-side {
        display: flex; flex-direction: column; align-items: center; min-width: 180px;
    }
    
    .logo {
        min-width: 55px; min-height: 40px; background-color: #1a1a1a; color: #bfa85c;
        font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 500;
        display: flex; align-items: center; justify-content: center; padding: 0 5px;
    }
    
    .doctor-name-label {
        font-size: 13pt; font-weight: 600; color: #1a1a1a; margin: 0; line-height: 1.2;
    }
    .doctor-subtitle {
        font-size: 9pt; color: #555; margin-top: 2px;
    }
    
    /* Typography */
    .document h1 {
        text-align: center; font-size: 15pt; margin: 20px 0 25px 0; font-weight: 700;
        color: #1a1a1a; position: relative; padding-bottom: 10px;
    }
    .document h1::after {
        content: ''; position: absolute; bottom: 0; left: 50%;
        transform: translateX(-50%); width: 70px; height: 2.5px; background: #bfa85c;
    }
    
    .document h2 {
        font-size: 12pt; margin-top: 18px; margin-bottom: 10px; font-weight: 600;
        color: #1a1a1a; border-bottom: 1px solid #eee; padding-bottom: 6px;
    }
    
    .document h3 {
        font-size: 11pt; margin-top: 12px; margin-bottom: 8px; font-weight: 600; color: #333;
    }
    
    /* Content Boxes */
    .declaration {
        margin: 18px 0; text-align: justify; font-style: italic; color: #444;
        background-color: #fdfdfd; padding: 12px 18px; border-radius: 4px;
        border-right: 4px solid #bfa85c;
    }
    
    .numbered-list {
        padding-right: 18px; list-style-type: decimal; margin: 8px 0;
    }
    
    .section {
        margin-bottom: 12px; text-align: justify;
    }
    
    .item-container {
        margin: 8px 0; padding: 8px; border: 1px solid #eee; border-radius: 4px; background: #fafafa;
    }
    .exam-section {
        margin: 5px 0; padding: 5px;
    }
    
    .summary-box {
        margin-top: 20px; padding: 15px; background-color: #fdfaf9;
        border-radius: 4px; border-right: 5px solid #bfa85c;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    
    .disability-section {
        margin: 20px 0; padding: 15px; background-color: #f9f9f9;
        border: 1px solid #f0f0f0; border-radius: 4px;
    }
    
    .disability-item {
        margin: 10px 0; padding: 8px; background: white; border-radius: 3px;
    }
    
    .signature-section {
        margin-top: 30px; text-align: center; padding-top: 15px; border-top: 1px solid #eee;
    }
</style>
`;

async function runGemini(systemPrompt: string, userContent: string, modelName: string, apiKey?: string) {
  const client = new GoogleGenAI({
    apiKey: apiKey || process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "dummy",
    httpOptions: apiKey ? undefined : {
      apiVersion: "",
      baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
    },
  });

  const model = client.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(systemPrompt + "\n\n### INPUT:\n" + userContent);
  return result.response.text();
}

export async function processCase(caseId: number, pdfText: string) {
  try {
    const caseItem = await storage.getCase(caseId);
    if (!caseItem) return;

    const keys = [caseItem.apiKey1, caseItem.apiKey2, caseItem.apiKey3, caseItem.apiKey4].filter(Boolean) as string[];
    const getKey = (idx: number) => keys.length > 0 ? keys[idx % keys.length] : undefined;

    await storage.updateCase(caseId, { status: "processing" });

    // 1. Architect
    console.log(`Case ${caseId}: Running Architect with ${caseItem.architectModel}...`);
    const architectOutput = await runGemini(PROMPT_ARCHITECT, pdfText, caseItem.architectModel, getKey(0));
    await storage.updateCase(caseId, { architectOutput });

    // 2. Miner
    console.log(`Case ${caseId}: Running Miner with ${caseItem.minerModel}...`);
    const minerOutput = await runGemini(PROMPT_MINER, `Original Text (Partial):\n` + pdfText.substring(0, 5000) + `\n\nArchitect Output:\n` + architectOutput, caseItem.minerModel, getKey(1));
    await storage.updateCase(caseId, { minerOutput });

    // 3. Adjudicator
    console.log(`Case ${caseId}: Running Adjudicator with ${caseItem.adjudicatorModel}...`);
    const adjudicatorOutput = await runGemini(PROMPT_ADJUDICATOR_TEMPLATE(caseItem.mode), minerOutput, caseItem.adjudicatorModel, getKey(2));
    await storage.updateCase(caseId, { adjudicatorOutput });

    // 4. Formatter
    console.log(`Case ${caseId}: Running Formatter with ${caseItem.formatterModel}...`);
    const formatterBody = await runGemini(PROMPT_FORMATTER, adjudicatorOutput, caseItem.formatterModel, getKey(3));
    
    // Construct Full HTML with Header/Styles exactly as in doc
    const finalHtml = `
      <div class="report-body" dir="rtl">
        ${REPORT_CSS}
        <div class="watermark">חוות דעת</div>
        <div class="document">
          <div class="header">
            <div class="header-top">
              <div class="header-side">
                <div class="logo">AI MEDICAL</div>
              </div>
              <div style="text-align: center;">
                <h1>חוות דעת רפואית-משפטית</h1>
                <p style="margin: 0; color: #666;">בדיקה באמצעות Gemini AI Adjudicator</p>
              </div>
              <div class="header-side">
                <p class="doctor-name-label">${caseItem.doctorName}</p>
                <p class="doctor-subtitle">מומחה רפואי</p>
              </div>
            </div>
          </div>
          
          <div class="section" style="margin-bottom: 20px;">
            <p><strong>מזהה תיק:</strong> ${caseItem.patientId}</p>
            <p><strong>תאריך:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
          </div>

          <div class="declaration">
            הנני נותן חוות דעתי זו במקום עדות בבית המשפט והנני מצהיר כי ידוע לי היטב שדין חוות דעת זו כשהיא חתומה על ידי כדין עדות בשבועה בבית המשפט.
          </div>

          ${formatterBody}

          <div class="signature-section">
            <p><strong>בכבוד רב,</strong></p>
            <p><strong>${caseItem.doctorName}</strong></p>
            <div style="margin-top: 40px; border-top: 1px solid #000; width: 200px; margin-right: auto; margin-left: auto;">
              חתימה
            </div>
          </div>
        </div>
      </div>
    `;

    await storage.updateCase(caseId, { 
      formatterOutput: finalHtml,
      status: "completed"
    });
    console.log(`Case ${caseId}: Completed.`);
  } catch (error) {
    console.error(`Case ${caseId} Failed:`, error);
    await storage.updateCase(caseId, { status: "error" });
  }
}
