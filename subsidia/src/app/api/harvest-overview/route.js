import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import utc from 'dayjs/plugin/utc';

// Configure dayjs plugins
dayjs.extend(weekOfYear);
dayjs.extend(utc);

export async function GET(request) {
   try {
      // Check authentication
      const session = await getServerSession(authOptions);
      if (!session?.user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const userId = session.user.id;
      const { searchParams } = new URL(request.url);

      // Extract parameters
      const startDate = searchParams.get('startDate') ? dayjs(searchParams.get('startDate')).toDate() : undefined;
      const endDate = searchParams.get('endDate') ? dayjs(searchParams.get('endDate')).toDate() : undefined;
      const timeRange = searchParams.get('timeRange') || 'year';
      const groupBy = searchParams.get('groupBy') || 'month';
      const landId = searchParams.get('landId') || undefined;
      const soilType = searchParams.get('soilType') || undefined;
      const variety = searchParams.get('variety') || undefined;

      // Determine date range if not explicitly provided
      let dateFilter = {};
      if (startDate && endDate) {
         dateFilter = {
            harvestDay: {
               gte: startDate,
               lte: endDate,
            },
         };
      } else {
         const now = dayjs();
         let rangeStart;

         switch (timeRange) {
            case 'month':
               rangeStart = now.startOf('month');
               break;
            case 'year':
               rangeStart = now.startOf('year');
               break;
            case 'week':
               rangeStart = now.startOf('week');
               break;
            default:
               rangeStart = now.subtract(1, 'year');
         }

         dateFilter = {
            harvestDay: {
               gte: rangeStart.toDate(),
               lte: now.toDate(),
            },
         };
      }

      // Build additional filters
      const additionalFilters = {
         userId,
         ...(landId ? { landId } : {}),
      };

      // Filters for lands based on soil type or variety
      const landFilters = {
         userId,
         ...(soilType ? { soilType } : {}),
         ...(variety ? { variety } : {}),
      };

      // Get all lands for the user
      const lands = await prisma.land.findMany({
         where: {
            userId,
            isActive: true,
         },
         select: {
            id: true,
            name: true,
            area: true,
            soilType: true,
            variety: true,
            color: true,
         },
      });

      // Get all unique soil types
      const soilTypes = await prisma.land.findMany({
         where: { userId },
         select: { soilType: true },
         distinct: ['soilType'],
      });

      // Get all unique varieties
      const varieties = await prisma.land.findMany({
         where: { userId },
         select: { variety: true },
         distinct: ['variety'],
      });

      // Get all harvests based on filters
      const harvests = await prisma.harvest.findMany({
         where: {
            ...additionalFilters,
            ...dateFilter,
         },
         include: {
            land: true,
         },
         orderBy: {
            harvestDay: 'asc',
         },
      });

      if (harvests.length === 0) {
         return NextResponse.json({
            harvestTrend: [],
            paidVsUnpaid: { paid: 0, unpaid: 0, paidAmount: 0, unpaidAmount: 0 },
            productionByLand: [],
            productionBySoilType: [],
            lands,
            soilTypes: soilTypes.map(s => s.soilType).filter(Boolean),
            varieties: varieties.map(v => v.variety).filter(Boolean),
         });
      }

      // Calculate production trend over time
      const harvestTrend = [];
      const groupedHarvests = {};

      harvests.forEach(harvest => {
         if (!harvest.harvestDay) return;

         const date = dayjs(harvest.harvestDay);
         let groupKey;
         let sortIndex;

         // Format the date based on groupBy
         switch (groupBy) {
            case 'day':
               groupKey = date.format('DD/MM/YYYY');
               sortIndex = date.valueOf();
               break;
            case 'week':
               groupKey = `Sett. ${date.week()}, ${date.year()}`;
               sortIndex = date.year() * 100 + date.week();
               break;
            case 'month':
               groupKey = date.format('MMMM YYYY');
               sortIndex = date.year() * 100 + date.month();
               break;
            case 'year':
               groupKey = date.format('YYYY');
               sortIndex = date.year();
               break;
            default:
               groupKey = date.format('DD/MM/YYYY');
               sortIndex = date.valueOf();
         }

         if (!groupedHarvests[groupKey]) {
            groupedHarvests[groupKey] = {
               date: groupKey,
               sortIndex,
               quantity: 0,
               revenue: 0,
               paidAmount: 0,
               unpaidAmount: 0,
               area: 0,
               // Track unique land IDs to avoid counting the same land multiple times
               uniqueLandIds: new Set(),
            };
         }

         groupedHarvests[groupKey].quantity += harvest.quantity || 0;
         groupedHarvests[groupKey].revenue += harvest.total || 0;

         if (harvest.isPaid) {
            groupedHarvests[groupKey].paidAmount += harvest.total || 0;
         } else {
            groupedHarvests[groupKey].unpaidAmount += harvest.total - (harvest.paidAmount || 0);
         }

         // Add land area if this is the first time we're seeing this land in this period
         if (!groupedHarvests[groupKey].uniqueLandIds.has(harvest.landId)) {
            groupedHarvests[groupKey].uniqueLandIds.add(harvest.landId);
            groupedHarvests[groupKey].area += harvest.land.area || 0;
         }
      });

      // Convert to array and calculate yield
      for (const key in groupedHarvests) {
         const period = groupedHarvests[key];
         // Calculate kg/ha
         period.yieldPerHa = period.area > 0 ? period.quantity / period.area : 0;
         // Calculate revenue per ha
         period.revenuePerHa = period.area > 0 ? period.revenue / period.area : 0;
         // Remove the Set as it can't be serialized
         delete period.uniqueLandIds;

         harvestTrend.push(period);
      }

      // Sort by sortIndex
      harvestTrend.sort((a, b) => a.sortIndex - b.sortIndex);

      // Calculate paid vs unpaid
      const paidVsUnpaid = {
         paid: 0,
         unpaid: 0,
         paidAmount: 0,
         unpaidAmount: 0,
      };

      harvests.forEach(harvest => {
         if (harvest.isPaid) {
            paidVsUnpaid.paid++;
            paidVsUnpaid.paidAmount += harvest.total || 0;
         } else {
            paidVsUnpaid.unpaid++;
            paidVsUnpaid.unpaidAmount += harvest.total - (harvest.paidAmount || 0);
         }
      });

      // Calculate production by land
      const productionByLand = [];
      const landProduction = {};

      harvests.forEach(harvest => {
         const landId = harvest.landId;

         if (!landProduction[landId]) {
            const land = lands.find(l => l.id === landId) || harvest.land;

            landProduction[landId] = {
               landId,
               landName: land.name,
               area: land.area || 0,
               quantity: 0,
               revenue: 0,
               color: land.color || '#0ea5e9',
            };
         }

         landProduction[landId].quantity += harvest.quantity || 0;
         landProduction[landId].revenue += harvest.total || 0;
      });

      // Calculate yield and revenue per ha for each land
      for (const landId in landProduction) {
         const land = landProduction[landId];
         land.yieldPerHa = land.area > 0 ? land.quantity / land.area : 0;
         land.revenuePerHa = land.area > 0 ? land.revenue / land.area : 0;
         productionByLand.push(land);
      }

      // Sort by production quantity (descending)
      productionByLand.sort((a, b) => b.quantity - a.quantity);

      // Calculate production by soil type
      const soilTypeProduction = {};
      const productionBySoilType = [];

      harvests.forEach(harvest => {
         const soilType = harvest.land.soilType || 'Sconosciuto';

         if (!soilTypeProduction[soilType]) {
            soilTypeProduction[soilType] = {
               soilType,
               area: 0,
               quantity: 0,
               revenue: 0,
               uniqueLandIds: new Set(),
            };
         }

         // Only count land area once per soil type
         if (!soilTypeProduction[soilType].uniqueLandIds.has(harvest.landId)) {
            soilTypeProduction[soilType].uniqueLandIds.add(harvest.landId);
            soilTypeProduction[soilType].area += harvest.land.area || 0;
         }

         soilTypeProduction[soilType].quantity += harvest.quantity || 0;
         soilTypeProduction[soilType].revenue += harvest.total || 0;
      });

      // Calculate yield and revenue per ha for each soil type
      for (const soilType in soilTypeProduction) {
         const data = soilTypeProduction[soilType];
         data.yieldPerHa = data.area > 0 ? data.quantity / data.area : 0;
         data.revenuePerHa = data.area > 0 ? data.revenue / data.area : 0;
         delete data.uniqueLandIds;
         productionBySoilType.push(data);
      }

      // Sort by yield per ha (descending)
      productionBySoilType.sort((a, b) => b.yieldPerHa - a.yieldPerHa);

      return NextResponse.json({
         harvestTrend,
         paidVsUnpaid,
         productionByLand,
         productionBySoilType,
         lands,
         soilTypes: soilTypes.map(s => s.soilType).filter(Boolean),
         varieties: varieties.map(v => v.variety).filter(Boolean),
      });
   } catch (error) {
      console.error('Error retrieving harvest statistics:', error);
      return NextResponse.json({ error: 'Failed to retrieve harvest statistics' }, { status: 500 });
   }
}
