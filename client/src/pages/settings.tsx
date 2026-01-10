import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "הגדרות נשמרו",
      description: "השינויים נשמרו בהצלחה במערכת.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold text-foreground">הגדרות מערכת</h2>
        <p className="text-muted-foreground">ניהול מפתחות API והעדפות כלליות.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>חיבורי AI (Replit Integrated)</CardTitle>
          <CardDescription>
            המערכת משתמשת באינטגרציה הפנימית של Replit עבור Gemini. אין צורך להגדיר מפתחות באופן ידני בסביבה זו.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 opacity-60 pointer-events-none">
            <Label>Gemini API Key</Label>
            <Input type="password" value="************************" readOnly />
            <p className="text-xs text-muted-foreground">מנוהל אוטומטית ע״י Replit Secrets</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>הגדרות רופא ברירת מחדל</CardTitle>
          <CardDescription>פרטים אלו יופיעו אוטומטית בטופס יצירת תיק חדש.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>שם רופא</Label>
            <Input placeholder="ד״ר ישראל ישראלי" />
          </div>
          <div className="space-y-2">
            <Label>מספר רשיון</Label>
            <Input placeholder="12345" />
          </div>
          <div className="pt-4 flex justify-end">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 ml-2" />
              שמור שינויים
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
