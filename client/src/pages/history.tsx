import { useCases } from "@/hooks/use-cases";
import { Link } from "wouter";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { FileText, ChevronLeft, Search, Calendar, User, UserCircle } from "lucide-react";
import { CardHover } from "@/components/ui/card-hover";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const { data: cases, isLoading } = useCases();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCases = cases?.filter(c => 
    c.patientId.includes(searchTerm) || 
    c.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold text-foreground">היסטוריית תיקים</h2>
          <p className="text-muted-foreground">ארכיון חוות דעת שנוצרו במערכת.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="חיפוש לפי ת.ז או שם רופא..." 
            className="pr-10 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-2xl border border-border/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases?.map((c) => (
            <Link key={c.id} href={`/case/${c.id}`}>
              <CardHover className="h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      c.status === 'completed' ? "bg-green-100 text-green-600" :
                      c.status === 'error' ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-600"
                    )}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      c.status === 'completed' ? "bg-green-50 text-green-700" :
                      c.status === 'error' ? "bg-red-50 text-red-700" :
                      "bg-blue-50 text-blue-700"
                    )}>
                      {c.status === 'completed' ? 'הסתיים' : c.status === 'processing' ? 'בתהליך' : 'ממתין'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-serif mb-1">תיק {c.patientId}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{c.originalFileName || "קובץ ללא שם"}</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserCircle className="w-4 h-4" />
                      <span>{c.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {c.createdAt && format(new Date(c.createdAt), 'd בMMMM yyyy', { locale: he })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end text-primary font-medium text-sm group-hover:underline">
                  לפרטי התיק
                  <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                </div>
              </CardHover>
            </Link>
          ))}

          {filteredCases?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/10 rounded-2xl border border-dashed">
              <p>לא נמצאו תיקים התואמים את החיפוש.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
