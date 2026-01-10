import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Stethoscope 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: PlusCircle, label: "תיק חדש", href: "/" },
  { icon: FileText, label: "היסטוריה", href: "/history" },
  { icon: Settings, label: "הגדרות", href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-l border-border h-screen sticky top-0 shadow-lg z-20">
      {/* Header Logo */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg leading-tight text-foreground">
              AI Medical
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              מערכת חוות דעת משפטית
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="block group">
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute right-0 w-1 h-8 bg-primary rounded-l-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-border/50">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">התנתק</span>
        </button>
      </div>
    </aside>
  );
}
