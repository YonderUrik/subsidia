'use client';

import { useState, useEffect } from 'react';
import {
   BarChart, Bar, LineChart, Line, PieChart, Pie,
   XAxis, YAxis, CartesianGrid, Tooltip, Legend,
   ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import axios from 'axios';
import { format, parse } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
   Calendar,
   BarChartBig,
   LineChart as LineIcon,
   PieChart as PieIcon,
   RefreshCcw,
   Filter,
   Search,
   Tag,
   User2 as UserIcon,
   BarChart3
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker, DateRangePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomTooltip, CustomPieTooltip } from '@/components/ui/custom-chart-tooltip';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChartLoading, NoDataPlaceholder, getChartIcon } from '@/components/ui/chart-placeholder';
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { debounce } from 'lodash';
import { formatNumber } from '@/lib/utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

// Configure dayjs with UTC plugin
dayjs.extend(utc);

// Helper function to format week labels
const formatWeekLabel = (value) => {
   // Check if it's a week format (e.g., "Sett. 23, 2023")
   if (typeof value === 'string' && value.includes('Sett.')) {
      // Extract week number and year
      const match = value.match(/Sett\. (\d+), (\d+)/);
      if (match) {
         const [_, weekNum, year] = match;
         // Return a more readable format
         return `Settimana ${weekNum}`;
      }
   }
   return value;
};

const COLORS = [
   '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
   '#6366f1', '#ef4444', '#14b8a6', '#f97316', '#8b5cf6'
];

export default function SalaryStatsPage() {
   // General state
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const [timeRange, setTimeRange] = useState('year');
   const [groupBy, setGroupBy] = useState('week');
   const [fromDate, setFromDate] = useState(null);
   const [toDate, setToDate] = useState(null);
   const [useCustomDateRange, setUseCustomDateRange] = useState(false);
   const [error, setError] = useState(null);
   const [activeTab, setActiveTab] = useState('trend');

   // Chart-specific loading states
   const [trendChartLoading, setTrendChartLoading] = useState(true);
   const [workTypeChartLoading, setWorkTypeChartLoading] = useState(true);
   const [paidUnpaidChartLoading, setPaidUnpaidChartLoading] = useState(true);
   const [employeeChartLoading, setEmployeeChartLoading] = useState(true);
   const [keywordChartLoading, setKeywordChartLoading] = useState(true);

   // Filter state
   const [employeeId, setEmployeeId] = useState('');
   const [employees, setEmployees] = useState([]);
   const [notesKeyword, setNotesKeyword] = useState('');
   const [notesKeywordInput, setNotesKeywordInput] = useState('');
   const [notesKeywords, setNotesKeywords] = useState([]);

   // Data availability flags
   const [hasTrendData, setHasTrendData] = useState(true);
   const [hasWorkTypeData, setHasWorkTypeData] = useState(true);
   const [hasPaidUnpaidData, setHasPaidUnpaidData] = useState(true);
   const [hasEmployeeData, setHasEmployeeData] = useState(true);
   const [hasKeywordData, setHasKeywordData] = useState(true);

   // Initialize date inputs on component mount
   useEffect(() => {
      const today = dayjs();
      const startOfYear = today.startOf('year').utc();
      const currentDate = today.utc();

      setToDate(currentDate.format());
      setFromDate(startOfYear.format());
   }, []);

   // Fetch initial data when component mounts and dates are set
   useEffect(() => {
      if (fromDate && toDate) {
         refreshData();
      }
   }, [fromDate, toDate]);

   // Refresh data when filters change
   useEffect(() => {
      if (fromDate && toDate && (employeeId !== undefined || notesKeyword !== undefined)) {
         refreshData();
      }
   }, [employeeId, notesKeyword]);

   // Refresh when time range changes
   useEffect(() => {
      if (fromDate && toDate) {
         refreshData();
      }
   }, [timeRange, groupBy, useCustomDateRange]);

   const toggleDateRangeType = () => {
      setUseCustomDateRange(!useCustomDateRange);
   };

   const refreshData = () => {
      setLoading(true);
      setTrendChartLoading(true);
      setWorkTypeChartLoading(true);
      setPaidUnpaidChartLoading(true);
      setEmployeeChartLoading(true);
      setKeywordChartLoading(true);
      
      const fetchData = async () => {
         try {
            let url;
            
            // Always use date range approach for consistency
            if (fromDate && toDate) {
               url = `/api/salary-stats?startDate=${fromDate}&endDate=${toDate}&groupBy=${groupBy}`;
            } else {
               url = `/api/salary-stats?timeRange=${timeRange}&groupBy=${groupBy}`;
            }
            
            // Add filters to URL if they exist
            if (employeeId) {
               url += `&employeeId=${employeeId}`;
            }
            
            if (notesKeyword) {
               url += `&notesKeyword=${encodeURIComponent(notesKeyword)}`;
            }
            
            console.log("Fetching data with URL:", url);
            const response = await axios.get(url);
            setStats(response.data);

            // Set employees for filter dropdown
            if (response.data.employees) {
               setEmployees(response.data.employees);
            }

            // Set notes keywords for filter dropdown
            if (response.data.allNotesKeywords) {
               setNotesKeywords(response.data.allNotesKeywords);
            }

            // Set data availability flags
            setHasTrendData(response.data.salaryTrend && response.data.salaryTrend.length > 0);
            setHasWorkTypeData(response.data.workTypes.fullDay > 0 || response.data.workTypes.halfDay > 0);
            setHasPaidUnpaidData(response.data.paidVsUnpaid.paid > 0 || response.data.paidVsUnpaid.unpaid > 0);
            setHasEmployeeData(response.data.workTypesByEmployee && response.data.workTypesByEmployee.length > 0);
            setHasKeywordData(response.data.notesKeywords && response.data.notesKeywords.length > 0);

            setError(null);
         } catch (err) {
            console.error('Errore nel recupero delle statistiche:', err);
            setError('Impossibile recuperare le statistiche dei salari');

            // Reset data availability flags on error
            setHasTrendData(false);
            setHasWorkTypeData(false);
            setHasPaidUnpaidData(false);
            setHasEmployeeData(false);
            setHasKeywordData(false);
         } finally {
            // Add a small delay to loading states to make the UI feel more responsive
            setTimeout(() => {
               setLoading(false);
               setTrendChartLoading(false);
            }, 500);

            setTimeout(() => {
               setWorkTypeChartLoading(false);
            }, 700);

            setTimeout(() => {
               setPaidUnpaidChartLoading(false);
            }, 900);

            setTimeout(() => {
               setEmployeeChartLoading(false);
            }, 1100);

            setTimeout(() => {
               setKeywordChartLoading(false);
            }, 1300);
         }
      };

      fetchData();
   };

   // Handler for notes keyword filtering
   const handleNotesKeywordSelect = (keyword) => {
      setNotesKeywordInput(keyword);
      setNotesKeyword(keyword);
   };

   const clearNotesFilter = () => {
      setNotesKeywordInput("");
      setNotesKeyword("");
   };

   // Handler for employee filtering
   const handleEmployeeChange = (value) => {
      setEmployeeId(value);
   };

   const clearEmployeeFilter = () => {
      setEmployeeId("");
   };

   // Debounced function for handling notes keyword input
   const debouncedNotesSearch = debounce((value) => {
      setNotesKeyword(value);
   }, 500);

   // Handle input change with debounce
   const handleNotesInputChange = (e) => {
      const value = e.target.value;
      setNotesKeywordInput(value);
      debouncedNotesSearch(value);
   };

   // Clean up debounce functions on component unmount
   useEffect(() => {
      return () => {
         debouncedNotesSearch.cancel();
      };
   }, []);

   if (loading && !stats) {
      return (
         <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
               <h1 className="text-2xl font-bold">Statistiche Salari</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <ChartLoading height={350} />
               <ChartLoading height={350} />
               <ChartLoading height={350} />
               <ChartLoading height={350} />
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="p-6">
            <Card className="border-destructive">
               <CardHeader>
                  <CardTitle className="text-destructive">Errore</CardTitle>
               </CardHeader>
               <CardContent>
                  <p>{error}</p>
               </CardContent>
               <CardFooter>
                  <Button onClick={refreshData} variant="outline">
                     <RefreshCcw className="mr-2 h-4 w-4" />
                     Riprova
                  </Button>
               </CardFooter>
            </Card>
         </div>
      );
   }

   if (!stats) {
      return (
         <div className="p-6">
            <Card>
               <CardHeader>
                  <CardTitle>Nessun dato disponibile</CardTitle>
                  <CardDescription>
                     Non ci sono dati disponibili per il periodo selezionato.
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="flex flex-col items-center justify-center h-40">
                     <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                     <p className="text-muted-foreground">Prova a selezionare un periodo diverso</p>
                  </div>
               </CardContent>
               <CardFooter className="flex justify-between">
                  {!useCustomDateRange ? (
                     <div className="flex space-x-2">
                        <Button
                           onClick={() => {
                              const today = dayjs();
                              const startOfMonth = today.startOf('month');
                              const endOfMonth = today.endOf('month');
                              setToDate(endOfMonth.utc().format());
                              setFromDate(startOfMonth.utc().format());
                              setTimeRange('month');
                           }}
                           variant={timeRange === 'month' ? 'default' : 'outline'}
                           size="sm"
                        >
                           Mese
                        </Button>
                        <Button
                           onClick={() => {
                              const today = dayjs();
                              const startOfYear = today.startOf('year');
                              const endOfYear = today.endOf('year');
                              setToDate(endOfYear.utc().format());
                              setFromDate(startOfYear.utc().format());
                              setTimeRange('year');
                           }}
                           variant={timeRange === 'year' ? 'default' : 'outline'}
                           size="sm"
                        >
                           Anno
                        </Button>
                     </div>
                  ) : (
                     <DateRangePicker
                        from={fromDate}
                        to={toDate}
                        setFrom={setFromDate}
                        setTo={setToDate}
                     />
                  )}
                  <Button onClick={toggleDateRangeType} variant="ghost" size="sm">
                     {useCustomDateRange ? 'Usa periodi predefiniti' : 'Usa date personalizzate'}
                  </Button>
               </CardFooter>
            </Card>
         </div>
      );
   }

   // Prepare data for paid vs unpaid pie chart with percentages
   const totalSalaries = stats?.paidVsUnpaid?.paid + stats?.paidVsUnpaid?.unpaid || 0;
   const paidUnpaidData = stats?.paidVsUnpaid ? [
      {
         name: 'Pagato',
         value: stats.paidVsUnpaid.paid,
         percentage: stats.paidVsUnpaid.paid / totalSalaries || 0,
         fill: '#10b981'
      },
      {
         name: 'Non Pagato',
         value: stats.paidVsUnpaid.unpaid,
         percentage: stats.paidVsUnpaid.unpaid / totalSalaries || 0,
         fill: '#ef4444'
      },
   ] : [];

   // Prepare data for work types pie chart with percentages
   const totalWorkTypes = stats?.workTypes?.fullDay + stats?.workTypes?.halfDay || 0;
   const workTypesData = stats?.workTypes ? [
      {
         name: 'Giornata Intera',
         value: stats.workTypes.fullDay,
         percentage: stats.workTypes.fullDay / totalWorkTypes || 0,
         fill: '#22c55e'
      },
      {
         name: 'Mezza Giornata',
         value: stats.workTypes.halfDay,
         percentage: stats.workTypes.halfDay / totalWorkTypes || 0,
         fill: '#f97316'
      },
   ] : [];

   // Prepare data for keywords bar chart
   const keywordsData = stats?.notesKeywords?.slice(0, 10) || [];

   // Enhanced work types by employee data
   const enhancedWorkTypesByEmployee = stats?.workTypesByEmployee?.map((item, index) => ({
      ...item,
      fullDayColor: '#0ea5e9',
      halfDayColor: '#8b5cf6'
   })) || [];
   
   // Sort trend data by sortIndex if available, or ensure weeks are properly sorted
   const sortedSalaryTrend = stats?.salaryTrend ? [...stats.salaryTrend].sort((a, b) => {
      // If sortIndex is available, use it
      if (a.sortIndex !== undefined && b.sortIndex !== undefined) {
         return a.sortIndex - b.sortIndex;
      }
      
      // Special handling for week format
      if (a.date && b.date && (a.date.includes('Sett.') || b.date.includes('Sett.'))) {
         // Extract week numbers for comparison
         const aMatch = a.date.match(/Sett\. (\d+)(?:, (\d+))?/);
         const bMatch = b.date.match(/Sett\. (\d+)(?:, (\d+))?/);
         
         if (aMatch && bMatch) {
            // If year is present, compare years first
            const aYear = aMatch[2] ? parseInt(aMatch[2]) : 0;
            const bYear = bMatch[2] ? parseInt(bMatch[2]) : 0;
            
            if (aYear !== bYear) {
                return aYear - bYear;
            }
            
            // If years are the same or not present, compare week numbers
            return parseInt(aMatch[1]) - parseInt(bMatch[1]);
         }
      }
      
      // Default string comparison
      return a.date?.localeCompare(b.date) || 0;
   }) : [];

   return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
         <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold">Statistiche Salari</h1>

                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                     <Button
                        onClick={refreshData}
                        variant="outline"
                        size="sm"
                        className="h-9 flex-1 sm:flex-auto"
                     >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Aggiorna
                     </Button>

                     <Button
                        onClick={toggleDateRangeType}
                        variant="outline"
                        size="sm"
                        className="h-9 flex-1 sm:flex-auto"
                     >
                        <Calendar className="mr-2 h-4 w-4" />
                        {useCustomDateRange ? 'Periodi' : 'Date'}
                     </Button>
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-3">
                  {!useCustomDateRange ? (
                     <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto">
                        <Button
                           onClick={() => {
                              const today = dayjs();
                              const startOfMonth = today.startOf('month');
                              const endOfMonth = today.endOf('month');
                              setToDate(endOfMonth.utc().format());
                              setFromDate(startOfMonth.utc().format());
                              setTimeRange('month');
                           }}
                           variant={timeRange === 'month' ? 'default' : 'outline'}
                           size="sm"
                           className="flex-1 sm:flex-auto"
                        >
                           Mese
                        </Button>
                        <Button
                           onClick={() => {
                              const today = dayjs();
                              const startOfYear = today.startOf('year');
                              const endOfYear = today.endOf('year');
                              setToDate(endOfYear.utc().format());
                              setFromDate(startOfYear.utc().format());
                              setTimeRange('year');
                           }}
                           variant={timeRange === 'year' ? 'default' : 'outline'}
                           size="sm"
                           className="flex-1 sm:flex-auto"
                        >
                           Anno
                        </Button>
                     </div>
                  ) : (
                     <div className="w-full sm:w-auto">
                        <DateRangePicker
                           from={fromDate}
                           to={toDate}
                           setFrom={setFromDate}
                           setTo={setToDate}
                        />
                     </div>
                  )}

                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                     <span className="text-sm text-muted-foreground whitespace-nowrap">Gruppo:</span>
                     <Select
                        value={groupBy}
                        onValueChange={setGroupBy}
                     >
                        <SelectTrigger className="w-full sm:w-[150px] h-9">
                           <SelectValue placeholder="Seleziona raggruppamento" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="day">Giorno</SelectItem>
                           <SelectItem value="week">Settimana</SelectItem>
                           <SelectItem value="month">Mese</SelectItem>
                           <SelectItem value="year">Anno</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               {/* Filter bar */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {/* Employee filter */}
                  <Popover>
                     <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-9">
                           <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              {employeeId ? (
                                 <span className="max-w-[150px] truncate text-sm">
                                    {employees.find(e => e.id === employeeId)?.name || 'Dipendente selezionato'}
                                 </span>
                              ) : (
                                 <span className="text-sm">Filtra per dipendente</span>
                              )}
                           </div>
                        </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-[240px] p-0">
                        <div className="p-2">
                           {employeeId && (
                              <Button
                                 variant="ghost"
                                 className="w-full justify-start mb-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                 onClick={clearEmployeeFilter}
                              >
                                 Rimuovi filtro dipendente
                              </Button>
                           )}
                           <div className="max-h-[200px] overflow-y-auto">
                              {employees?.length > 0 ? (
                                 <div className="space-y-1">
                                    {employees.map((employee) => (
                                       <Button
                                          key={employee.id}
                                          variant="ghost"
                                          className={`w-full justify-start ${employeeId === employee.id ? 'bg-primary/10' : ''}`}
                                          onClick={() => handleEmployeeChange(employee.id)}
                                       >
                                          {employee.name}
                                       </Button>
                                    ))}
                                 </div>
                              ) : (
                                 <div className="p-2 text-center text-slate-500 text-sm">Nessun dipendente trovato</div>
                              )}
                           </div>
                        </div>
                     </PopoverContent>
                  </Popover>

                  {/* Notes keyword filter */}
                  <Popover>
                     <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-9">
                           <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              {notesKeyword ? (
                                 <span className="max-w-[150px] truncate text-sm">{notesKeyword}</span>
                              ) : (
                                 <span className="text-sm">Filtra per parola chiave</span>
                              )}
                           </div>
                        </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-[240px] p-0">
                        <div className="p-2">
                           <div className="relative mb-2">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                              <Input
                                 type="search"
                                 placeholder="Cerca parole chiave..."
                                 className="pl-8 w-full"
                                 value={notesKeywordInput}
                                 onChange={handleNotesInputChange}
                              />
                           </div>
                           {notesKeyword && (
                              <Button
                                 variant="ghost"
                                 className="w-full justify-start mb-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                 onClick={clearNotesFilter}
                              >
                                 Cancella filtro
                              </Button>
                           )}
                           <div className="max-h-[200px] overflow-y-auto">
                              {notesKeywords?.length > 0 ? (
                                 <div className="flex flex-wrap gap-1 p-1">
                                    {notesKeywords.map((keyword) => (
                                       <Badge
                                          key={keyword}
                                          variant="secondary"
                                          className="cursor-pointer hover:bg-slate-200"
                                          onClick={() => handleNotesKeywordSelect(keyword)}
                                       >
                                          {keyword}
                                       </Badge>
                                    ))}
                                 </div>
                              ) : (
                                 <div className="p-2 text-center text-slate-500 text-sm">Nessuna parola chiave trovata</div>
                              )}
                           </div>
                        </div>
                     </PopoverContent>
                  </Popover>
               </div>

               {/* Active filters display */}
               {(employeeId || notesKeyword) && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                     <span className="text-xs sm:text-sm text-muted-foreground">Filtri:</span>

                     {employeeId && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                           <UserIcon className="h-3 w-3" />
                           {employees.find(e => e.id === employeeId)?.name || 'Dipendente'}
                           <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={clearEmployeeFilter}
                           >
                              ✕
                           </Button>
                        </Badge>
                     )}

                     {notesKeyword && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                           <Tag className="h-3 w-3" />
                           {notesKeyword}
                           <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={clearNotesFilter}
                           >
                              ✕
                           </Button>
                        </Badge>
                     )}
                  </div>
               )}
            </CardContent>
         </Card>

         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
            <TabsList className="grid w-full grid-cols-3">
               <TabsTrigger value="trend" className="text-xs sm:text-sm">
                  <LineIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="sm:inline">Andamento</span>
               </TabsTrigger>
               <TabsTrigger value="distribution" className="text-xs sm:text-sm">
                  <PieIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="sm:inline">Distribuzione</span>
               </TabsTrigger>
               <TabsTrigger value="employees" className="text-xs sm:text-sm">
                  <BarChartBig className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="sm:inline">Dipendenti</span>
               </TabsTrigger>
            </TabsList>

            <TabsContent value="trend" className="space-y-3">
               {/* Salary Trend Chart */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <div className="flex justify-between items-center">
                        <CardTitle className="text-base sm:text-lg">Salari</CardTitle>
                     </div>
                     <CardDescription className="text-xs sm:text-sm">
                        {useCustomDateRange
                           ? `Dal ${format(fromDate, 'dd/MM/yyyy')} al ${format(toDate, 'dd/MM/yyyy')}`
                           : `Ultim${timeRange === 'day' ? 'o' : timeRange === 'year' ? 'o' : 'a'} ${timeRange === 'day' ? 'giorno' :
                              timeRange === 'week' ? 'settimana' :
                                 timeRange === 'month' ? 'mese' : 'anno'
                           }`
                        }
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                     {trendChartLoading ? (
                        <ChartLoading height={300} />
                     ) : !hasTrendData ? (
                        <NoDataPlaceholder
                           icon={getChartIcon('bar')}
                           height={300}
                           title="Nessun dato di andamento disponibile"
                           description="Non ci sono dati disponibili per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[300px] sm:h-[400px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                 data={sortedSalaryTrend}
                                 margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                              >
                                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                 <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10 }}
                                    tickMargin={10}
                                    tickFormatter={formatWeekLabel}
                                 />
                                 <YAxis
                                    tickFormatter={(value) => formatNumber(value)}
                                    tick={{ fontSize: 10 }}
                                 />
                                 <Tooltip content={<CustomTooltip />} />
                                 <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '11px' }}
                                 />
                                 <Bar
                                    dataKey="paidAmount"
                                    stackId="a"
                                    name="Importo Pagato"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                 />
                                 <Bar
                                    dataKey="unpaidAmount"
                                    stackId="a"
                                    name="Importo Non Pagato"
                                    fill="#ef4444"
                                    radius={[4, 4, 0, 0]}
                                 />
                              </BarChart>

                           </ResponsiveContainer>
                        </div>
                     )}
                  </CardContent>
               </Card>

               {/* Work Types Distribution By Time */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <CardTitle className="text-base sm:text-lg">Giornate</CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                     {workTypeChartLoading ? (
                        <ChartLoading height={250} />
                     ) : !hasWorkTypeData ? (
                        <NoDataPlaceholder
                           icon={BarChart3}
                           height={250}
                           title="Nessun dato di distribuzione disponibile"
                           description="Non ci sono dati sulla distribuzione delle giornate per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[250px] sm:h-[350px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                 data={sortedSalaryTrend}
                                 margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                              >
                                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                 <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10 }}
                                    tickMargin={10}
                                    tickFormatter={formatWeekLabel}
                                 />
                                 <YAxis
                                    tick={{ fontSize: 10 }}
                                 />
                                 <Tooltip content={<CustomTooltip currency={false} />} />
                                 <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '11px' }}
                                 />
                                 <Bar
                                    dataKey="fullDayCount"
                                    name="Giornate Intere"
                                    fill="#22c55e"
                                    radius={[4, 4, 0, 0]}
                                 />
                                 <Bar
                                    dataKey="halfDayCount"
                                    name="Mezze Giornate"
                                    fill="#f97316"
                                    radius={[4, 4, 0, 0]}
                                 />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="distribution" className="space-y-3">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Paid vs Unpaid Chart */}
                  <Card>
                     <CardHeader className="pb-2 px-3 sm:px-6">
                        <CardTitle className="text-base sm:text-lg">Salari Pagati vs Non Pagati</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                           Distribuzione percentuale dei salari
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="px-2 sm:px-6">
                        {paidUnpaidChartLoading ? (
                           <ChartLoading height={250} />
                        ) : !hasPaidUnpaidData ? (
                           <NoDataPlaceholder
                              icon={PieChart}
                              height={250}
                              title="Nessun dato disponibile"
                              description="Non ci sono dati sui pagamenti per il periodo e i filtri selezionati."
                           />
                        ) : (
                           <>
                              <div className="h-[180px] sm:h-[220px]">
                                 <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                       <Pie
                                          data={paidUnpaidData}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={window.innerWidth < 640 ? 40 : 60}
                                          outerRadius={window.innerWidth < 640 ? 60 : 80}
                                          paddingAngle={5}
                                          dataKey="value"
                                       >
                                          {paidUnpaidData.map((entry, index) => (
                                             <Cell
                                                key={`cell-${index}`}
                                                fill={entry.fill}
                                                stroke="transparent"
                                             />
                                          ))}
                                       </Pie>
                                       <Tooltip content={<CustomPieTooltip />} />
                                       <Legend 
                                          verticalAlign="bottom" 
                                          height={36}
                                          iconType="circle"
                                          wrapperStyle={{ fontSize: '11px' }}
                                       />
                                    </PieChart>
                                 </ResponsiveContainer>
                              </div>
                              <Separator className="my-3" />
                              <div className="grid grid-cols-2 gap-2 text-center">
                                 <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Importo Pagato</p>
                                    <p className="text-base sm:text-xl font-bold text-green-500">
                                       {formatNumber(stats.paidVsUnpaid.paidAmount)}
                                    </p>
                                 </div>
                                 <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Importo Non Pagato</p>
                                    <p className="text-base sm:text-xl font-bold text-red-500">
                                       {formatNumber(stats.paidVsUnpaid.unpaidAmount)}
                                    </p>
                                 </div>
                              </div>
                           </>
                        )}
                     </CardContent>
                  </Card>

                  {/* Work Types Chart */}
                  <Card>
                     <CardHeader className="pb-2 px-3 sm:px-6">
                        <CardTitle className="text-base sm:text-lg">Distribuzione Tipi di Giornata</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                           Distribuzione percentuale tra giornate intere e mezze giornate
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="px-2 sm:px-6">
                        {workTypeChartLoading ? (
                           <ChartLoading height={250} />
                        ) : !hasWorkTypeData ? (
                           <NoDataPlaceholder
                              icon={PieChart}
                              height={250}
                              title="Nessun dato disponibile"
                              description="Non ci sono dati sui tipi di giornata per il periodo e i filtri selezionati."
                           />
                        ) : (
                           <>
                              <div className="h-[180px] sm:h-[220px]">
                                 <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                       <Pie
                                          data={workTypesData}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={window.innerWidth < 640 ? 40 : 60}
                                          outerRadius={window.innerWidth < 640 ? 60 : 80}
                                          paddingAngle={5}
                                          dataKey="value"
                                       >
                                          {workTypesData.map((entry, index) => (
                                             <Cell
                                                key={`cell-${index}`}
                                                fill={entry.fill}
                                                stroke="transparent"
                                             />
                                          ))}
                                       </Pie>
                                       <Tooltip content={<CustomPieTooltip />} />
                                       <Legend 
                                          verticalAlign="bottom" 
                                          height={36}
                                          iconType="circle"
                                          wrapperStyle={{ fontSize: '11px' }}
                                       />
                                    </PieChart>
                                 </ResponsiveContainer>
                              </div>
                              <Separator className="my-3" />
                              <div className="grid grid-cols-2 gap-2 text-center">
                                 <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Giornate Intere</p>
                                    <p className="text-base sm:text-xl font-bold text-green-500">
                                       {stats.workTypes.fullDay}
                                    </p>
                                 </div>
                                 <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Mezze Giornate</p>
                                    <p className="text-base sm:text-xl font-bold text-orange-500">
                                       {stats.workTypes.halfDay}
                                    </p>
                                 </div>
                              </div>
                           </>
                        )}
                     </CardContent>
                  </Card>
               </div>

               {/* Keywords Distribution */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <CardTitle className="text-base sm:text-lg">Parole Chiave nelle Note</CardTitle>
                     <CardDescription className="text-xs sm:text-sm">
                        Le 10 parole chiave più frequenti trovate nelle note
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                     {keywordChartLoading ? (
                        <ChartLoading height={250} />
                     ) : !hasKeywordData ? (
                        <NoDataPlaceholder
                           icon={BarChart3}
                           height={250}
                           title="Nessuna parola chiave trovata"
                           description="Non sono state trovate parole chiave nelle note per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[250px] sm:h-[350px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                 data={keywordsData}
                                 margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                                 layout="vertical"
                              >
                                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                 <XAxis type="number" />
                                 <YAxis
                                    dataKey="keyword"
                                    type="category"
                                    width={80}
                                    tick={{ fontSize: 10 }}
                                 />
                                 <Tooltip content={<CustomTooltip currency={false} />} />
                                 <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '11px' }}
                                 />
                                 <Bar
                                    dataKey="count"
                                    name="Occorrenze"
                                    fill="#8b5cf6"
                                    radius={[0, 4, 4, 0]}
                                 >
                                    {keywordsData.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                 </Bar>
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="employees" className="space-y-3">
               {/* Work Types by Employee */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <CardTitle className="text-base sm:text-lg">Tipi di Giornata per Dipendente</CardTitle>
                     <CardDescription className="text-xs sm:text-sm">
                        Distribuzione delle giornate per ogni dipendente
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                     {employeeChartLoading ? (
                        <ChartLoading height={300} />
                     ) : !hasEmployeeData ? (
                        <NoDataPlaceholder
                           icon={BarChart3}
                           height={300}
                           title="Nessun dato per dipendente disponibile"
                           description="Non ci sono dati sui dipendenti per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[300px] sm:h-[400px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                 data={enhancedWorkTypesByEmployee}
                                 margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                              >
                                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                 <XAxis
                                    dataKey="employeeName"
                                    tick={{ fontSize: 10 }}
                                    tickMargin={10}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                 />
                                 <YAxis
                                    tick={{ fontSize: 10 }}
                                 />
                                 <Tooltip content={<CustomTooltip currency={false} />} />
                                 <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '11px' }}
                                 />
                                 <Bar
                                    dataKey="fullDay"
                                    name="Giornate Intere"
                                    fill="#22c55e"
                                    radius={[4, 4, 0, 0]}
                                 />
                                 <Bar
                                    dataKey="halfDay"
                                    name="Mezze Giornate"
                                    fill="#f97316"
                                    radius={[4, 4, 0, 0]}
                                 />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>
         </Tabs>
      </div>
   );
}