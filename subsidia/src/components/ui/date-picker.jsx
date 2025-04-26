"use client"

import * as React from "react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({ date, setDate, label, className }) {
  return (
    <div className={cn("grid gap-2", className)}>
      {label && <label className="text-sm text-muted-foreground">{label}</label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: it }) : <span>Seleziona data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            locale={it}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function DateRangePicker({ from, to, setFrom, setTo, className }) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !from && !to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {from && to ? (
              <>
                {format(from, "dd/MM/yyyy", { locale: it })} - {format(to, "dd/MM/yyyy", { locale: it })}
              </>
            ) : (
              <span>Seleziona intervallo date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={from}
            selected={{
              from,
              to,
            }}
            onSelect={(range) => {
              setFrom(range?.from)
              setTo(range?.to)
            }}
            numberOfMonths={2}
            locale={it}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 