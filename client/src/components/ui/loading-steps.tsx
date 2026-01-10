import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "pending" | "processing" | "completed" | "error";

interface Step {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
}

interface LoadingStepsProps {
  steps: Step[];
  className?: string;
}

export function LoadingSteps({ steps, className }: LoadingStepsProps) {
  return (
    <div className={cn("relative space-y-8", className)}>
      {/* Vertical Line Connector */}
      <div className="absolute top-4 right-[15px] bottom-4 w-[2px] bg-border -z-10" />

      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-4 relative"
        >
          {/* Status Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center z-10 transition-colors duration-300"
            data-status={step.status}
          >
            {step.status === "completed" && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            {step.status === "processing" && (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            )}
            {step.status === "pending" && (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            {step.status === "error" && (
              <div className="w-3 h-3 rounded-full bg-destructive" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 pt-0.5">
            <h4 className={cn(
              "text-base font-semibold transition-colors duration-300",
              step.status === "processing" ? "text-primary" : 
              step.status === "completed" ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {step.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
