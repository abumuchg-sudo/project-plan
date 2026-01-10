import { useParams } from "wouter";
import { useCase } from "@/hooks/use-cases";
import { motion } from "framer-motion";
import { LoadingSteps, type StepStatus } from "@/components/ui/loading-steps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, CheckCircle, RefreshCcw, Eye, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function CaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: caseData, isLoading, error } = useCase(Number(id));

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <h3 className="text-xl font-medium text-muted-foreground">טוען נתוני תיק...</h3>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-4">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold">שגיאה בטעינת התיק</h2>
        <p className="text-muted-foreground max-w-md">
          לא ניתן לטעון את פרטי התיק. ייתכן והתיק נמחק או שהמזהה שגוי.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCcw className="ml-2 w-4 h-4" />
          נסה שנית
        </Button>
      </div>
    );
  }

  // Determine steps status based on data presence
  const getStepStatus = (stepOutput: string | null | undefined): StepStatus => {
    if (caseData.status === 'error') return 'error';
    if (stepOutput) return 'completed';
    if (caseData.status === 'processing') return 'processing'; // Simplified logic
    return 'pending';
  };

  // Logic to fine-tune active step based on what data exists
  // If architect output exists, Architect is done. If no miner output, Miner is processing...
  const architectStatus: StepStatus = caseData.architectOutput ? 'completed' : (caseData.status === 'processing' ? 'processing' : 'pending');
  const minerStatus: StepStatus = caseData.minerOutput ? 'completed' : (architectStatus === 'completed' && caseData.status !== 'completed' ? 'processing' : 'pending');
  const adjudicatorStatus: StepStatus = caseData.adjudicatorOutput ? 'completed' : (minerStatus === 'completed' && caseData.status !== 'completed' ? 'processing' : 'pending');
  const formatterStatus: StepStatus = caseData.formatterOutput ? 'completed' : (adjudicatorStatus === 'completed' && caseData.status !== 'completed' ? 'processing' : 'pending');

  const steps = [
    {
      id: "architect",
      label: "ארכיטקט (Architect)",
      description: "קריאת מסמכים, זיהוי מבנה ומיון ראשוני.",
      status: architectStatus,
    },
    {
      id: "miner",
      label: "כורה נתונים (Miner)",
      description: "חילוץ בדיקות, אבחנות, הדמיות וטיפולים.",
      status: minerStatus,
    },
    {
      id: "adjudicator",
      label: "פוסק (Adjudicator)",
      description: `גיבוש מסקנות משפטיות במוד ${caseData.mode === 'NEUTRAL' ? 'ניטרלי' : 'תובעני'}.`,
      status: adjudicatorStatus,
    },
    {
      id: "formatter",
      label: "מעצב (Formatter)",
      description: "בניית מסמך HTML סופי ומעוצב.",
      status: formatterStatus,
    },
  ];

  const handleDownload = () => {
    if (!caseData.formatterOutput) return;
    const blob = new Blob([caseData.formatterOutput], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical_opinion_${caseData.patientId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-serif font-bold">תיק {caseData.patientId}</h1>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border",
              caseData.status === 'completed' ? "bg-green-50 text-green-700 border-green-200" :
              caseData.status === 'processing' ? "bg-blue-50 text-blue-700 border-blue-200" :
              "bg-gray-50 text-gray-700 border-gray-200"
            )}>
              {caseData.status === 'completed' ? 'הסתיים' : caseData.status === 'processing' ? 'בתהליך' : 'ממתין'}
            </span>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="font-semibold text-foreground">{caseData.doctorName}</span>
            <span>•</span>
            <span>מוד: {caseData.mode === 'NEUTRAL' ? 'ניטרלי' : 'תובעני'}</span>
            <span>•</span>
            <span className="font-mono text-xs">{new Date(caseData.createdAt!).toLocaleDateString('he-IL')}</span>
          </p>
        </div>

        {caseData.formatterOutput && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
              const newWindow = window.open();
              if (newWindow) newWindow.document.write(caseData.formatterOutput || "");
            }}>
              <Eye className="w-4 h-4 ml-2" />
              תצוגה מקדימה
            </Button>
            <Button onClick={handleDownload} className="shadow-lg shadow-primary/20">
              <Download className="w-4 h-4 ml-2" />
              הורד חוות דעת
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Progress & Logs (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden sticky top-24">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">תהליך העבודה</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <LoadingSteps steps={steps} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Output & Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="preview" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="preview">תצוגה מקדימה</TabsTrigger>
                <TabsTrigger value="raw">נתונים גולמיים (Logs)</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="mt-0">
              <Card className="min-h-[600px] border-border shadow-sm overflow-hidden flex flex-col">
                {caseData.formatterOutput ? (
                  <iframe 
                    srcDoc={caseData.formatterOutput}
                    className="w-full flex-1 bg-white"
                    title="Report Preview"
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center bg-muted/10">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="mb-6 opacity-20"
                    >
                      <FileText className="w-24 h-24" />
                    </motion.div>
                    <h3 className="text-xl font-medium mb-2">מסמך בתהליך הפקה</h3>
                    <p className="max-w-xs mx-auto">
                      המערכת מעבדת את הנתונים כעת. המסמך הסופי יופיע כאן בסיום התהליך.
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="raw" className="mt-0">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">לוגים מפורטים (Agent Outputs)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {steps.map((step) => {
                    const outputKey = `${step.id}Output` as keyof typeof caseData;
                    const content = caseData[outputKey];
                    
                    if (!content) return null;

                    return (
                      <div key={step.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <h4 className="font-semibold text-sm">{step.label} Output</h4>
                        </div>
                        <ScrollArea className="h-48 w-full rounded-md border bg-muted/50 p-4 font-mono text-xs rtl-grid logs-scrollbar">
                          <pre className="whitespace-pre-wrap break-all">
                            {String(content)}
                          </pre>
                        </ScrollArea>
                      </div>
                    );
                  })}
                  {!caseData.architectOutput && (
                    <div className="text-center text-muted-foreground py-8">
                      טרם התקבלו נתונים מהסוכנים.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
