import React from "react";
import { LucideProps } from "lucide-react";
import { BarChart3, LineChart, PieChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ChartLoading = ({ className, height = 300 }) => {
  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      <Card className="h-full w-full border">
        <CardContent className="p-6 flex flex-col h-full justify-center items-center">
          <Skeleton className="h-[70%] w-[90%] rounded-md mb-4" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[70%]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const NoDataPlaceholder = ({
  icon: Icon = BarChart3,
  title = "Nessun dato disponibile",
  description = "Non ci sono dati disponibili per i filtri selezionati.",
  height = 300,
  className,
}) => {
  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      <Card className="h-full w-full border bg-muted/10">
        <CardContent className="p-6 flex flex-col h-full justify-center items-center text-center">
          <Icon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export const chartIcons = {
  line: LineChart,
  bar: BarChart3,
  pie: PieChart,
};

export const getChartIcon = (type = "bar") => {
  return chartIcons[type] || BarChart3;
}; 