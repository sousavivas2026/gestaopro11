import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "destructive" | "info" | "purple";
}

const variantStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  info: "bg-info text-info-foreground",
  purple: "bg-purple text-purple-foreground",
};

export function MetricCard({ title, value, subtitle, icon: Icon, variant = "default" }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`rounded-lg p-3 ${variantStyles[variant]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
