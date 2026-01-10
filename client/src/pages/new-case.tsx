import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateCase } from "@/hooks/use-cases";
import { UploadCloud, FileType, Check, AlertCircle, Scale, Gavel, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCasePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createCase = useCreateCase();
  
  const [file, setFile] = useState<File | null>(null);
  const [patientId, setPatientId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [mode, setMode] = useState<"NEUTRAL" | "AGGRESSIVE">("NEUTRAL");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast({
          title: "שגיאת קובץ",
          description: "אנא בחר קובץ PDF בלבד",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !patientId || !doctorName) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientId", patientId);
    formData.append("doctorName", doctorName);
    formData.append("mode", mode);

    try {
      const result = await createCase.mutateAsync(formData);
      toast({
        title: "התיק נוצר בהצלחה",
        description: "הועבר לעמוד הניתוח...",
      });
      setLocation(`/case/${result.id}`);
    } catch (error) {
      toast({
        title: "שגיאה ביצירת התיק",
        description: error instanceof Error ? error.message : "אירעה שגיאה בלתי צפויה",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold text-foreground">פתיחת תיק חדש</h2>
        <p className="text-muted-foreground">העלה מסמכים רפואיים לניתוח והפקת חוות דעת משפטית אוטומטית.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>פרטי התיק</CardTitle>
                <CardDescription>הזן את פרטי הנבדק והרופא המטפל</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">מזהה תיק / ת.ז נבדק</Label>
                    <Input 
                      id="patientId" 
                      placeholder="לדוגמה: 123456789"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      required
                      className="bg-muted/30 focus:bg-background transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">שם הרופא החתום</Label>
                    <Input 
                      id="doctorName" 
                      placeholder="ד״ר ישראלי"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      required
                      className="bg-muted/30 focus:bg-background transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label>מוד עבודה</Label>
                  <RadioGroup 
                    value={mode} 
                    onValueChange={(val) => setMode(val as "NEUTRAL" | "AGGRESSIVE")}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="NEUTRAL" id="neutral" className="peer sr-only" />
                      <Label
                        htmlFor="neutral"
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full"
                      >
                        <Scale className="mb-3 h-8 w-8 text-primary/80" />
                        <div className="text-center">
                          <span className="block font-semibold text-lg">ניטרלי</span>
                          <span className="text-sm text-muted-foreground mt-1 block font-normal">
                            ניתוח אובייקטיבי ועובדתי, ללא הטיה. מתאים למומחה מטעם בית משפט.
                          </span>
                        </div>
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem value="AGGRESSIVE" id="aggressive" className="peer sr-only" />
                      <Label
                        htmlFor="aggressive"
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full"
                      >
                        <Gavel className="mb-3 h-8 w-8 text-primary/80" />
                        <div className="text-center">
                          <span className="block font-semibold text-lg">תובעני</span>
                          <span className="text-sm text-muted-foreground mt-1 block font-normal">
                            פרשנות מחמירה לטובת הנבדק. חיפוש אקטיבי של אחוזי נכות וקשר סיבתי.
                          </span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                size="lg" 
                disabled={!file || !patientId || !doctorName || createCase.isPending}
                className="px-8 py-6 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              >
                {createCase.isPending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="ml-2"
                    >
                      <AlertCircle className="w-5 h-5 opacity-0" /> {/* Placeholder size */}
                      <span className="absolute inset-0 flex items-center justify-center">⏳</span>
                    </motion.div>
                    יוצר תיק...
                  </>
                ) : (
                  <>
                    התחל ניתוח תיק
                    <FileText className="mr-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Upload Area */}
          <div className="lg:col-span-1">
            <Card className={cn(
              "h-full border-2 border-dashed transition-all duration-300 relative overflow-hidden",
              file ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
            )}>
              <input
                type="file"
                id="file-upload"
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                onChange={handleFileChange}
              />
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 relative z-10">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                  file ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground"
                )}>
                  {file ? <Check className="w-10 h-10" /> : <UploadCloud className="w-10 h-10" />}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    {file ? "הקובץ נבחר" : "העלאת מסמכים"}
                  </h3>
                  <p className="text-sm text-muted-foreground px-4">
                    {file ? (
                      <span className="font-mono text-primary break-all">{file.name}</span>
                    ) : (
                      "גרור קובץ לכאן או לחץ לבחירה (PDF בלבד)"
                    )}
                  </p>
                </div>

                {file && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background/80 px-3 py-1.5 rounded-full shadow-sm border border-border"
                  >
                    <FileType className="w-3 h-3" />
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </motion.div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
