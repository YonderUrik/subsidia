'use client';

import { useState, useEffect } from 'react';
import {
   BarChart, Bar, LineChart, Line, PieChart, Pie,
   XAxis, YAxis, CartesianGrid, Tooltip, Legend,
   ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import axios from 'axios';
import { format } from 'date-fns';
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
   MapPin,
   Sprout,
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
import weekOfYear from 'dayjs/plugin/weekOfYear';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(weekOfYear);

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

export default function HarvestStatsPage() {
   // General state
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const [timeRange, setTimeRange] = useState('year');
   const [groupBy, setGroupBy] = useState('month');
   const [fromDate, setFromDate] = useState(null);
   const [toDate, setToDate] = useState(null);
   const [useCustomDateRange, setUseCustomDateRange] = useState(false);
   const [error, setError] = useState(null);
   const [activeTab, setActiveTab] = useState('production');

   // Chart-specific loading states
   const [productionChartLoading, setProductionChartLoading] = useState(true);
   const [financeChartLoading, setFinanceChartLoading] = useState(true);
   const [landChartLoading, setLandChartLoading] = useState(true);
   const [soilTypeChartLoading, setSoilTypeChartLoading] = useState(true);

   // Filter state
   const [landId, setLandId] = useState('');
   const [lands, setLands] = useState([]);
   const [soilType, setSoilType] = useState('');
   const [soilTypes, setSoilTypes] = useState([]);
   const [variety, setVariety] = useState('');
   const [varieties, setVarieties] = useState([]);

   // Data availability flags
   const [hasProductionData, setHasProductionData] = useState(true);
   const [hasFinanceData, setHasFinanceData] = useState(true);
   const [hasLandData, setHasLandData] = useState(true);
   const [hasSoilTypeData, setHasSoilTypeData] = useState(true);
   
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
      if (fromDate && toDate && (landId !== undefined || soilType !== undefined || variety !== undefined)) {
         refreshData();
      }
   }, [landId, soilType, variety]);

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
      setProductionChartLoading(true);
      setFinanceChartLoading(true);
      setLandChartLoading(true);
      setSoilTypeChartLoading(true);
      
      const fetchData = async () => {
         try {
            let url;
            
            // Always use date range approach for consistency
            if (fromDate && toDate) {
               url = `/api/harvest-overview?startDate=${fromDate}&endDate=${toDate}&groupBy=${groupBy}`;
            } else {
               url = `/api/harvest-overview?timeRange=${timeRange}&groupBy=${groupBy}`;
            }
            
            // Add filters to URL if they exist
            if (landId) {
               url += `&landId=${landId}`;
            }
            
            if (soilType) {
               url += `&soilType=${encodeURIComponent(soilType)}`;
            }
            
            if (variety) {
               url += `&variety=${encodeURIComponent(variety)}`;
            }
            
            const response = await axios.get(url);
            setStats(response.data);

            // Set data for filter dropdowns
            if (response.data.lands) {
               setLands(response.data.lands);
            }
            
            if (response.data.soilTypes) {
               setSoilTypes(response.data.soilTypes);
            }
            
            if (response.data.varieties) {
               setVarieties(response.data.varieties);
            }

            // Set data availability flags
            setHasProductionData(response.data.harvestTrend && response.data.harvestTrend.length > 0);
            setHasFinanceData(
               response.data.paidVsUnpaid &&
               (response.data.paidVsUnpaid.paid > 0 || response.data.paidVsUnpaid.unpaid > 0)
            );
            setHasLandData(response.data.productionByLand && response.data.productionByLand.length > 0);
            setHasSoilTypeData(response.data.productionBySoilType && response.data.productionBySoilType.length > 0);

            setError(null);
         } catch (err) {
            console.error('Errore nel recupero delle statistiche:', err);
            setError('Impossibile recuperare le statistiche del raccolto');

            // Reset data availability flags on error
            setHasProductionData(false);
            setHasFinanceData(false);
            setHasLandData(false);
            setHasSoilTypeData(false);
         } finally {
            // Add a small delay to loading states to make the UI feel more responsive
            setTimeout(() => {
               setLoading(false);
               setProductionChartLoading(false);
            }, 500);

            setTimeout(() => {
               setFinanceChartLoading(false);
            }, 700);

            setTimeout(() => {
               setLandChartLoading(false);
            }, 900);

            setTimeout(() => {
               setSoilTypeChartLoading(false);
            }, 1100);
         }
      };

      fetchData();
   };

   // Handler for land filtering
   const handleLandChange = (value) => {
      setLandId(value);
   };

   const clearLandFilter = () => {
      setLandId("");
   };

   // Handler for soil type filtering
   const handleSoilTypeChange = (value) => {
      setSoilType(value);
   };

   const clearSoilTypeFilter = () => {
      setSoilType("");
   };

   // Handler for variety filtering
   const handleVarietyChange = (value) => {
      setVariety(value);
   };

   const clearVarietyFilter = () => {
      setVariety("");
   };

   if (loading && !stats) {
      return (
         <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
               <h1 className="text-2xl font-bold">Statistiche Raccolto</h1>
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
   const totalHarvests = stats?.paidVsUnpaid?.paid + stats?.paidVsUnpaid?.unpaid || 0;
   const paidUnpaidData = stats?.paidVsUnpaid ? [
      {
         name: 'Pagato',
         value: stats.paidVsUnpaid.paidAmount,
         percentage: stats.paidVsUnpaid.paidAmount / (stats.paidVsUnpaid.paidAmount + stats.paidVsUnpaid.unpaidAmount) || 0,
         fill: '#10b981'
      },
      {
         name: 'Non Pagato',
         value: stats.paidVsUnpaid.unpaidAmount,
         percentage: stats.paidVsUnpaid.unpaidAmount / (stats.paidVsUnpaid.paidAmount + stats.paidVsUnpaid.unpaidAmount) || 0,
         fill: '#ef4444'
      },
   ] : [];

   // Sort trend data by sortIndex if available
   const sortedHarvestTrend = stats?.harvestTrend ? [...stats.harvestTrend].sort((a, b) => {
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
                  <h1 className="text-2xl sm:text-3xl font-bold">Statistiche Raccolto</h1>

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
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                  {/* Land filter */}
                  <Popover>
                     <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-9">
                           <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {landId ? (
                                 <span className="max-w-[150px] truncate text-sm">
                                    {lands.find(l => l.id === landId)?.name || 'Terreno selezionato'}
                                 </span>
                              ) : (
                                 <span className="text-sm">Filtra per terreno</span>
                              )}
                           </div>
                        </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-[240px] p-0">
                        <div className="p-2">
                           {landId && (
                              <Button
                                 variant="ghost"
                                 className="w-full justify-start mb-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                 onClick={clearLandFilter}
                              >
                                 Rimuovi filtro terreno
                              </Button>
                           )}
                           <div className="max-h-[200px] overflow-y-auto">
                              {lands?.length > 0 ? (
                                 <div className="space-y-1">
                                    {lands.map((land) => (
                                       <Button
                                          key={land.id}
                                          variant="ghost"
                                          className={`w-full justify-start ${landId === land.id ? 'bg-primary/10' : ''}`}
                                          onClick={() => handleLandChange(land.id)}
                                       >
                                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: land.color || '#888' }}></div>
                                          {land.name}
                                       </Button>
                                    ))}
                                 </div>
                              ) : (
                                 <div className="p-2 text-center text-slate-500 text-sm">Nessun terreno trovato</div>
                              )}
                           </div>
                        </div>
                     </PopoverContent>
                  </Popover>

                  {/* Soil type filter */}
                  <Popover>
                     <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-9">
                           <div className="flex items-center gap-2">
                              <Sprout className="h-4 w-4" />
                              {soilType ? (
                                 <span className="max-w-[150px] truncate text-sm">{soilType}</span>
                              ) : (
                                 <span className="text-sm">Filtra per tipo di terreno</span>
                              )}
                           </div>
                        </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-[240px] p-0">
                        <div className="p-2">
                           {soilType && (
                              <Button
                                 variant="ghost"
                                 className="w-full justify-start mb-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                 onClick={clearSoilTypeFilter}
                              >
                                 Rimuovi filtro tipo di terreno
                              </Button>
                           )}
                           <div className="max-h-[200px] overflow-y-auto">
                              {soilTypes?.length > 0 ? (
                                 <div className="flex flex-wrap gap-1 p-1">
                                    {soilTypes.map((type) => (
                                       <Badge
                                          key={type}
                                          variant={soilType === type ? "default" : "secondary"}
                                          className="cursor-pointer hover:bg-slate-200"
                                          onClick={() => handleSoilTypeChange(type)}
                                       >
                                          {type}
                                       </Badge>
                                    ))}
                                 </div>
                              ) : (
                                 <div className="p-2 text-center text-slate-500 text-sm">Nessun tipo di terreno trovato</div>
                              )}
                           </div>
                        </div>
                     </PopoverContent>
                  </Popover>

                  {/* Variety filter */}
                  <Popover>
                     <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-9">
                           <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              {variety ? (
                                 <span className="max-w-[150px] truncate text-sm">{variety}</span>
                              ) : (
                                 <span className="text-sm">Filtra per varietà</span>
                              )}
                           </div>
                        </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-[240px] p-0">
                        <div className="p-2">
                           {variety && (
                              <Button
                                 variant="ghost"
                                 className="w-full justify-start mb-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                 onClick={clearVarietyFilter}
                              >
                                 Rimuovi filtro varietà
                              </Button>
                           )}
                           <div className="max-h-[200px] overflow-y-auto">
                              {varieties?.length > 0 ? (
                                 <div className="flex flex-wrap gap-1 p-1">
                                    {varieties.map((type) => (
                                       <Badge
                                          key={type}
                                          variant={variety === type ? "default" : "secondary"}
                                          className="cursor-pointer hover:bg-slate-200"
                                          onClick={() => handleVarietyChange(type)}
                                       >
                                          {type}
                                       </Badge>
                                    ))}
                                 </div>
                              ) : (
                                 <div className="p-2 text-center text-slate-500 text-sm">Nessuna varietà trovata</div>
                              )}
                           </div>
                        </div>
                     </PopoverContent>
                  </Popover>
               </div>

               {/* Active filters display */}
               {(landId || soilType || variety) && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                     <span className="text-xs sm:text-sm text-muted-foreground">Filtri:</span>

                     {landId && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                           <MapPin className="h-3 w-3" />
                           {lands.find(l => l.id === landId)?.name || 'Terreno'}
                           <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={clearLandFilter}
                           >
                              ✕
                           </Button>
                        </Badge>
                     )}

                     {soilType && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                           <Sprout className="h-3 w-3" />
                           {soilType}
                           <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={clearSoilTypeFilter}
                           >
                              ✕
                           </Button>
                        </Badge>
                     )}

                     {variety && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                           <Tag className="h-3 w-3" />
                           {variety}
                           <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={clearVarietyFilter}
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
               <TabsTrigger value="production" className="text-xs sm:text-sm">
                  <LineIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="sm:inline">Produzione</span>
               </TabsTrigger>
               <TabsTrigger value="finance" className="text-xs sm:text-sm">
                  <PieIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="sm:inline">Finanza</span>
               </TabsTrigger>
               <TabsTrigger value="area" className="text-xs sm:text-sm">
                  <BarChartBig className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="sm:inline">Superfici</span>
               </TabsTrigger>
            </TabsList>

            <TabsContent value="production" className="space-y-3">
               {/* Production Trend Chart */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <div className="flex justify-between items-center">
                        <CardTitle className="text-base sm:text-lg">Produzione nel Tempo</CardTitle>
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
                     {productionChartLoading ? (
                        <ChartLoading height={300} />
                     ) : !hasProductionData ? (
                        <NoDataPlaceholder
                           icon={getChartIcon('line')}
                           height={300}
                           title="Nessun dato di produzione disponibile"
                           description="Non ci sono dati disponibili per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[300px] sm:h-[400px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                 data={sortedHarvestTrend}
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
                                    yAxisId="left"
                                    tickFormatter={(value) => `${value} kg`}
                                    tick={{ fontSize: 10 }}
                                 />
                                 <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={(value) => `${value} ha`}
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
                                    yAxisId="left"
                                    dataKey="quantity"
                                    name="Produzione (kg)"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                 />
                                 <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="area"
                                    name="Superficie (ha)"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                 />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     )}
                  </CardContent>
               </Card>

               {/* Yield Per Hectare Chart */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <CardTitle className="text-base sm:text-lg">Resa per Ettaro</CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                     {productionChartLoading ? (
                        <ChartLoading height={250} />
                     ) : !hasProductionData ? (
                        <NoDataPlaceholder
                           icon={getChartIcon('area')}
                           height={250}
                           title="Nessun dato di resa disponibile"
                           description="Non ci sono dati sulla resa per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[250px] sm:h-[350px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                 data={sortedHarvestTrend}
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
                                    tickFormatter={(value) => `${value} kg/ha`}
                                    tick={{ fontSize: 10 }}
                                 />
                                 <Tooltip content={<CustomTooltip />} />
                                 <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '11px' }}
                                 />
                                 <Area
                                    type="monotone"
                                    dataKey="yieldPerHa"
                                    name="Resa (kg/ha)"
                                    stroke="#8b5cf6"
                                    fill="#c4b5fd"
                                    fillOpacity={0.6}
                                 />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     )}
                  </CardContent>
               </Card>

               {/* Production by Land */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <CardTitle className="text-base sm:text-lg">Produzione per Terreno</CardTitle>
                     <CardDescription className="text-xs sm:text-sm">
                        Produzione totale per ogni terreno nel periodo selezionato
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                     {landChartLoading ? (
                        <ChartLoading height={250} />
                     ) : !hasLandData ? (
                        <NoDataPlaceholder
                           icon={getChartIcon('bar')}
                           height={250}
                           title="Nessun dato per terreno disponibile"
                           description="Non ci sono dati sui terreni per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[250px] sm:h-[350px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                 data={stats.productionByLand}
                                 margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                                 layout="vertical"
                              >
                                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                 <XAxis 
                                    type="number"
                                    tickFormatter={(value) => `${value} kg`}
                                 />
                                 <YAxis
                                    dataKey="landName"
                                    type="category"
                                    width={80}
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
                                    dataKey="quantity"
                                    name="Produzione (kg)"
                                    radius={[0, 4, 4, 0]}
                                 >
                                    {stats.productionByLand.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                 </Bar>
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="finance" className="space-y-3">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Paid vs Unpaid Chart */}
                  <Card>
                     <CardHeader className="pb-2 px-3 sm:px-6">
                        <CardTitle className="text-base sm:text-lg">Pagamenti Ricevuti vs Attesi</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                           Distribuzione percentuale dei pagamenti
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="px-2 sm:px-6">
                        {financeChartLoading ? (
                           <ChartLoading height={250} />
                        ) : !hasFinanceData ? (
                           <NoDataPlaceholder
                              icon={PieIcon}
                              height={250}
                              title="Nessun dato finanziario disponibile"
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
                                    <p className="text-xs sm:text-sm text-muted-foreground">Importo Ricevuto</p>
                                    <p className="text-base sm:text-xl font-bold text-green-500">
                                       {formatNumber(stats.paidVsUnpaid.paidAmount)}
                                    </p>
                                 </div>
                                 <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Importo da Ricevere</p>
                                    <p className="text-base sm:text-xl font-bold text-red-500">
                                       {formatNumber(stats.paidVsUnpaid.unpaidAmount)}
                                    </p>
                                 </div>
                              </div>
                           </>
                        )}
                     </CardContent>
                  </Card>

                  {/* Revenue by Soil Type */}
                  <Card>
                     <CardHeader className="pb-2 px-3 sm:px-6">
                        <CardTitle className="text-base sm:text-lg">Ricavi per Tipo di Terreno</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                           Distribuzione dei ricavi per tipo di terreno
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="px-2 sm:px-6">
                        {soilTypeChartLoading ? (
                           <ChartLoading height={250} />
                        ) : !hasSoilTypeData ? (
                           <NoDataPlaceholder
                              icon={PieIcon}
                              height={250}
                              title="Nessun dato disponibile"
                              description="Non ci sono dati sui tipi di terreno per il periodo e i filtri selezionati."
                           />
                        ) : (
                           <div className="h-[250px] sm:h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                    <Pie
                                       data={stats.productionBySoilType}
                                       cx="50%"
                                       cy="50%"
                                       outerRadius={window.innerWidth < 640 ? 80 : 100}
                                       dataKey="revenue"
                                       nameKey="soilType"
                                       label={(entry) => entry.soilType}
                                       labelLine={false}
                                    >
                                       {stats.productionBySoilType.map((entry, index) => (
                                          <Cell 
                                             key={`cell-${index}`} 
                                             fill={COLORS[index % COLORS.length]} 
                                          />
                                       ))}
                                    </Pie>
                                    <Tooltip 
                                       formatter={(value) => formatNumber(value)}
                                       content={<CustomPieTooltip />}
                                    />
                                    <Legend
                                       layout="vertical"
                                       verticalAlign="middle"
                                       align="right"
                                       iconType="circle"
                                       wrapperStyle={{ fontSize: '11px' }}
                                    />
                                 </PieChart>
                              </ResponsiveContainer>
                           </div>
                        )}
                     </CardContent>
                  </Card>
               </div>

               {/* Revenue Trend Chart */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <div className="flex justify-between items-center">
                        <CardTitle className="text-base sm:text-lg">Ricavi nel Tempo</CardTitle>
                     </div>
                     <CardDescription className="text-xs sm:text-sm">
                        Andamento dei ricavi e pagamenti nel periodo selezionato
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                     {financeChartLoading ? (
                        <ChartLoading height={300} />
                     ) : !hasFinanceData ? (
                        <NoDataPlaceholder
                           icon={getChartIcon('line')}
                           height={300}
                           title="Nessun dato di ricavi disponibile"
                           description="Non ci sono dati disponibili per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[300px] sm:h-[400px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                 data={sortedHarvestTrend}
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
                                    name="Ricevuto"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                 />
                                 <Bar
                                    dataKey="unpaidAmount"
                                    stackId="a"
                                    name="Da Ricevere"
                                    fill="#ef4444"
                                    radius={[4, 4, 0, 0]}
                                 />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     )}
                  </CardContent>
               </Card>

               {/* Revenue by Land */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <CardTitle className="text-base sm:text-lg">Ricavi per Terreno</CardTitle>
                     <CardDescription className="text-xs sm:text-sm">
                        Ricavi totali per ogni terreno nel periodo selezionato
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                     {landChartLoading ? (
                        <ChartLoading height={250} />
                     ) : !hasLandData ? (
                        <NoDataPlaceholder
                           icon={getChartIcon('bar')}
                           height={250}
                           title="Nessun dato per terreno disponibile"
                           description="Non ci sono dati sui ricavi per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[250px] sm:h-[350px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                 data={stats.productionByLand}
                                 margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                                 layout="vertical"
                              >
                                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                 <XAxis 
                                    type="number"
                                    tickFormatter={(value) => formatNumber(value)}
                                 />
                                 <YAxis
                                    dataKey="landName"
                                    type="category"
                                    width={80}
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
                                    dataKey="revenue"
                                    name="Ricavi (€)"
                                    radius={[0, 4, 4, 0]}
                                 >
                                    {stats.productionByLand.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                 </Bar>
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="area" className="space-y-3">
               {/* Yield Per Hectare by Land */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <CardTitle className="text-base sm:text-lg">Resa per Ettaro per Terreno</CardTitle>
                     <CardDescription className="text-xs sm:text-sm">
                        Confronto della resa per ettaro tra i diversi terreni
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                     {landChartLoading ? (
                        <ChartLoading height={250} />
                     ) : !hasLandData ? (
                        <NoDataPlaceholder
                           icon={getChartIcon('bar')}
                           height={250}
                           title="Nessun dato di resa disponibile"
                           description="Non ci sono dati sulla resa per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[250px] sm:h-[350px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                 data={stats.productionByLand}
                                 margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                                 layout="vertical"
                              >
                                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                 <XAxis 
                                    type="number"
                                    tickFormatter={(value) => `${value} kg/ha`}
                                 />
                                 <YAxis
                                    dataKey="landName"
                                    type="category"
                                    width={80}
                                    tick={{ fontSize: 10 }}
                                 />
                                 <Tooltip 
                                    formatter={(value) => [`${value.toFixed(2)} kg/ha`, "Resa"]}
                                    content={<CustomTooltip currency={false} />} 
                                 />
                                 <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '11px' }}
                                 />
                                 <Bar
                                    dataKey="yieldPerHa"
                                    name="Resa (kg/ha)"
                                    radius={[0, 4, 4, 0]}
                                 >
                                    {stats.productionByLand.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                 </Bar>
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     )}
                  </CardContent>
               </Card>

               {/* Revenue Per Hectare by Land */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <CardTitle className="text-base sm:text-lg">Ricavo per Ettaro per Terreno</CardTitle>
                     <CardDescription className="text-xs sm:text-sm">
                        Confronto del ricavo per ettaro tra i diversi terreni
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                     {landChartLoading ? (
                        <ChartLoading height={250} />
                     ) : !hasLandData ? (
                        <NoDataPlaceholder
                           icon={getChartIcon('bar')}
                           height={250}
                           title="Nessun dato di ricavo disponibile"
                           description="Non ci sono dati sul ricavo per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[250px] sm:h-[350px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                 data={stats.productionByLand}
                                 margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                                 layout="vertical"
                              >
                                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                 <XAxis 
                                    type="number"
                                    tickFormatter={(value) => formatNumber(value) + "/ha"}
                                 />
                                 <YAxis
                                    dataKey="landName"
                                    type="category"
                                    width={80}
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
                                    dataKey="revenuePerHa"
                                    name="Ricavo (€/ha)"
                                    radius={[0, 4, 4, 0]}
                                 >
                                    {stats.productionByLand.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                 </Bar>
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     )}
                  </CardContent>
               </Card>

               {/* Yield Per Hectare by Soil Type */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <CardTitle className="text-base sm:text-lg">Resa per Tipo di Terreno</CardTitle>
                     <CardDescription className="text-xs sm:text-sm">
                        Confronto della resa per ettaro tra i diversi tipi di terreno
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                     {soilTypeChartLoading ? (
                        <ChartLoading height={250} />
                     ) : !hasSoilTypeData ? (
                        <NoDataPlaceholder
                           icon={getChartIcon('bar')}
                           height={250}
                           title="Nessun dato per tipo di terreno disponibile"
                           description="Non ci sono dati sulla resa per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[250px] sm:h-[350px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                 data={stats.productionBySoilType}
                                 margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                              >
                                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                 <XAxis
                                    dataKey="soilType"
                                    tick={{ fontSize: 10 }}
                                    tickMargin={10}
                                 />
                                 <YAxis
                                    tickFormatter={(value) => `${value} kg/ha`}
                                    tick={{ fontSize: 10 }}
                                 />
                                 <Tooltip 
                                    formatter={(value) => [`${value.toFixed(2)} kg/ha`, "Resa"]}
                                    content={<CustomTooltip currency={false} />} 
                                 />
                                 <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '11px' }}
                                 />
                                 <Bar
                                    dataKey="yieldPerHa"
                                    name="Resa (kg/ha)"
                                    radius={[4, 4, 0, 0]}
                                 >
                                    {stats.productionBySoilType.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                 </Bar>
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     )}
                  </CardContent>
               </Card>

               {/* Revenue Per Hectare by Soil Type */}
               <Card>
                  <CardHeader className="pb-2 px-3 sm:px-6">
                     <CardTitle className="text-base sm:text-lg">Ricavo per Tipo di Terreno</CardTitle>
                     <CardDescription className="text-xs sm:text-sm">
                        Confronto del ricavo per ettaro tra i diversi tipi di terreno
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-6">
                     {soilTypeChartLoading ? (
                        <ChartLoading height={250} />
                     ) : !hasSoilTypeData ? (
                        <NoDataPlaceholder
                           icon={getChartIcon('bar')}
                           height={250}
                           title="Nessun dato per tipo di terreno disponibile"
                           description="Non ci sono dati sul ricavo per il periodo e i filtri selezionati."
                        />
                     ) : (
                        <div className="h-[250px] sm:h-[350px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                 data={stats.productionBySoilType}
                                 margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                              >
                                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                 <XAxis
                                    dataKey="soilType"
                                    tick={{ fontSize: 10 }}
                                    tickMargin={10}
                                 />
                                 <YAxis
                                    tickFormatter={(value) => formatNumber(value) + "/ha"}
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
                                    dataKey="revenuePerHa"
                                    name="Ricavo (€/ha)"
                                    radius={[4, 4, 0, 0]}
                                 >
                                    {stats.productionBySoilType.map((entry, index) => (
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
         </Tabs>
      </div>
   );
}
