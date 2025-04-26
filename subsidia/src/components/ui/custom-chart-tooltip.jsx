import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format, parse } from 'date-fns';
import { it } from 'date-fns/locale';

// Helper function to format week labels
const formatWeekLabel = (value) => {
  // Check if it's a week format (e.g., "Sett. 23, 2023")
  if (typeof value === 'string' && value.includes('Sett.')) {
    // Extract week number and year
    const match = value.match(/Sett\. (\d+), (\d+)/);
    if (match) {
      const [_, weekNum, year] = match;
      // Return a more readable format
      return `Settimana ${weekNum} (${year})`;
    }
  }
  return value;
};

export const CustomTooltip = ({ active, payload, label, currency = true }) => {
  if (active && payload && payload.length) {
    return (
      <Card className="bg-white shadow-md border border-slate-200 p-0">
        <CardContent className="p-2 text-xs">
          <p className="font-medium text-slate-900 mb-1">{formatWeekLabel(label)}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={`item-${index}`} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color || entry.fill }}
                ></div>
                <p style={{ color: entry.color || entry.fill }}>
                  {entry.name}: {currency ? '€' : ''}
                  {typeof entry.value === 'number'
                    ? entry.value.toLocaleString('it-IT', {
                        minimumFractionDigits: currency ? 2 : 0,
                        maximumFractionDigits: currency ? 2 : 0,
                      })
                    : entry.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <Card className="bg-white shadow-md border border-slate-200 p-0">
        <CardContent className="p-2 text-xs">
          <p className="font-medium text-slate-900 mb-1" style={{ color: data.payload.fill }}>
            {data.name}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data.payload.fill }}
              ></div>
              <p>
                Valore: {data.value.toLocaleString('it-IT')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full opacity-60"
                style={{ backgroundColor: data.payload.fill }}
              ></div>
              <p>
                Percentuale: {(data.payload.percentage * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}; 