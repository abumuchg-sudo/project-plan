import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Settings2 } from "lucide-react";

export interface AIConfig {
  apiKey1: string;
  apiKey2: string;
  apiKey3: string;
  apiKey4: string;
  architectModel: string;
  minerModel: string;
  adjudicatorModel: string;
  formatterModel: string;
}

interface AIConfigPanelProps {
  config: AIConfig;
  onChange: (config: AIConfig) => void;
}

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-3-pro-preview",
  "gemini-3-flash-preview"
];

export function AIConfigPanel({ config, onChange }: AIConfigPanelProps) {
  const handleChange = (key: keyof AIConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="config" className="border-none">
        <AccordionTrigger className="hover:no-underline py-2">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Settings2 className="w-4 h-4" />
            <span className="text-sm font-medium">הגדרות AI מתקדמות (אופציונלי)</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/40 bg-muted/20">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold">מפתחות API (Gemini)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <Label htmlFor={`apiKey${i}`} className="text-xs">מפתח {i}</Label>
                    <Input
                      id={`apiKey${i}`}
                      type="password"
                      placeholder="הכנס מפתח API..."
                      value={config[`apiKey${i}` as keyof AIConfig]}
                      onChange={(e) => handleChange(`apiKey${i}` as keyof AIConfig, e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-muted/20">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold">בחירת מודלים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                {[
                  { id: "architectModel", label: "Architect (ניתוח מבנה)" },
                  { id: "minerModel", label: "Miner (חילוץ נתונים)" },
                  { id: "adjudicatorModel", label: "Adjudicator (פסיקה)" },
                  { id: "formatterModel", label: "Formatter (עיצוב דו\"ח)" }
                ].map((m) => (
                  <div key={m.id} className="space-y-1">
                    <Label htmlFor={m.id} className="text-xs">{m.label}</Label>
                    <Select
                      value={config[m.id as keyof AIConfig]}
                      onValueChange={(val) => handleChange(m.id as keyof AIConfig, val)}
                    >
                      <SelectTrigger id={m.id} className="h-8 text-xs bg-background">
                        <SelectValue placeholder="בחר מודל" />
                      </SelectTrigger>
                      <SelectContent>
                        {MODELS.map((model) => (
                          <SelectItem key={model} value={model} className="text-xs">
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
