import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';
    const groupBy = searchParams.get('groupBy') || 'day';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');
    const notesKeyword = searchParams.get('notesKeyword');
    
    // Calculate date range based on timeRange or custom dates
    const today = new Date();
    let startDate;
    let endDate = new Date(today);
    
    if (startDateParam && endDateParam) {
      // Use custom date range if provided
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      // Use predefined timeRange
      switch(timeRange) {
        case 'day':
          startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date(today);
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 1);
      }
    }
    
    // Build the query filter
    let where = {
      userId: session.user.id,
      workedDay: {
        gte: startDate,
        lte: endDate
      },
    };
    
    // Add employee filter if specified
    if (employeeId) {
      where.employeeId = employeeId;
    }
    
    // Add notes keyword filter if specified
    if (notesKeyword && notesKeyword.trim() !== '') {
      where.notes = {
        contains: notesKeyword,
        mode: 'insensitive'
      };
    }
    
    // Fetch all salaries within the time range and filters
    const salaries = await prisma.salary.findMany({
      where,
      include: {
        employee: true,
      },
      orderBy: {
        workedDay: 'asc',
      },
    });
    
    // Get all employees for reference
    const employees = await prisma.employee.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Calculate trends
    const salaryTrend = calculateTrend(salaries, timeRange, groupBy);
    
    // Calculate paid vs unpaid
    const paidVsUnpaid = {
      paid: salaries.filter(s => s.isPaid).length,
      unpaid: salaries.filter(s => !s.isPaid).length,
      paidAmount: salaries.filter(s => s.isPaid).reduce((sum, s) => sum + s.total, 0),
      unpaidAmount: salaries.filter(s => !s.isPaid).reduce((sum, s) => sum + s.total, 0),
    };
    
    // Calculate work types overall
    const workTypes = {
      fullDay: salaries.filter(s => s.workType === 'fullDay').length,
      halfDay: salaries.filter(s => s.workType === 'halfDay').length,
    };
    
    // Calculate work types by employee
    const workTypesByEmployee = employees.map(employee => {
      const employeeSalaries = salaries.filter(s => s.employeeId === employee.id);
      return {
        employeeId: employee.id,
        employeeName: employee.name,
        fullDay: employeeSalaries.filter(s => s.workType === 'fullDay').length,
        halfDay: employeeSalaries.filter(s => s.workType === 'halfDay').length,
      };
    }).filter(item => item.fullDay > 0 || item.halfDay > 0); // Only include employees with data
    
    // Analyze notes keywords
    const notesKeywords = analyzeNotes(salaries);
    
    // Get all unique notes keywords for dropdown
    const allNotesKeywords = await getUniqueNotesKeywords(session);
    
    return NextResponse.json({
      salaryTrend,
      paidVsUnpaid,
      workTypes,
      workTypesByEmployee,
      notesKeywords,
      employees,
      allNotesKeywords,
    });
  } catch (error) {
    console.error('Error fetching salary stats:', error);
    return NextResponse.json({ error: 'Failed to fetch salary statistics' }, { status: 500 });
  }
}

// Function to calculate trend based on time range and groupBy
function calculateTrend(salaries, timeRange, groupBy) {
  const trendData = [];
  
  if (salaries.length === 0) {
    return trendData;
  }
  
  // Group salaries by date based on time range and groupBy
  const groupedSalaries = {};
  
  salaries.forEach(salary => {
    const date = new Date(salary.workedDay);
    let key;
    
    // Determine grouping key based on groupBy parameter
    switch(groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'week':
        // Get the week number and year
        const weekInfo = getWeekNumber(date);
        key = `${weekInfo.year}-W${weekInfo.weekNo}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      case 'year':
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().split('T')[0]; // Default to daily
    }
    
    // Create or update group
    if (!groupedSalaries[key]) {
      let displayDate;
      
      switch(groupBy) {
        case 'day':
          displayDate = new Date(date).toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit'});
          break;
        case 'week':
          const weekInfo = getWeekNumber(date);
          displayDate = `Sett. ${weekInfo.weekNo} (${weekInfo.dateRange})`;
          break;
        case 'month':
          displayDate = date.toLocaleDateString('it-IT', {month: 'short', year: 'numeric'});
          break;
        case 'year':
          displayDate = date.getFullYear().toString();
          break;
        default:
          displayDate = date.toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit'});
      }
      
      groupedSalaries[key] = {
        date: displayDate,
        total: 0,
        count: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        fullDayCount: 0,
        halfDayCount: 0,
        fullDayAmount: 0,
        halfDayAmount: 0,
      };
    }
    
    groupedSalaries[key].total += salary.total;
    groupedSalaries[key].count += 1;
    
    if (salary.isPaid) {
      groupedSalaries[key].paidAmount += salary.total;
    } else {
      groupedSalaries[key].unpaidAmount += salary.total;
    }
    
    // Track work type counts and amounts
    if (salary.workType === 'fullDay') {
      groupedSalaries[key].fullDayCount += 1;
      groupedSalaries[key].fullDayAmount += salary.total;
    } else if (salary.workType === 'halfDay') {
      groupedSalaries[key].halfDayCount += 1;
      groupedSalaries[key].halfDayAmount += salary.total;
    }
  });
  
  // Sort the groups chronologically
  let sortedKeys = Object.keys(groupedSalaries).sort();
  
  // Special handling for week sorting to ensure correct numerical order
  if (groupBy === 'week') {
    sortedKeys = Object.keys(groupedSalaries).sort((a, b) => {
      // Parse keys like "2023-W23"
      const aMatch = a.match(/(\d+)-W(\d+)/);
      const bMatch = b.match(/(\d+)-W(\d+)/);
      
      if (aMatch && bMatch) {
        const aYear = parseInt(aMatch[1]);
        const aWeek = parseInt(aMatch[2]);
        const bYear = parseInt(bMatch[1]);
        const bWeek = parseInt(bMatch[2]);
        
        // Compare years first
        if (aYear !== bYear) {
          return aYear - bYear;
        }
        
        // Then compare weeks
        return aWeek - bWeek;
      }
      
      return a.localeCompare(b);
    });
  }
  
  // Convert to array for the chart
  for (const key of sortedKeys) {
    // Add a numerical sortIndex to ensure chart maintains order
    trendData.push({
      ...groupedSalaries[key],
      sortIndex: sortedKeys.indexOf(key)
    });
  }
  
  return trendData;
}

// Helper function to get week number
function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  
  // Add additional info for readability
  // Generate a date range string for the week (Monday-Sunday)
  const mondayOfWeek = new Date(d);
  mondayOfWeek.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); // Monday is considered first day
  
  const sundayOfWeek = new Date(mondayOfWeek);
  sundayOfWeek.setUTCDate(mondayOfWeek.getUTCDate() + 6);
  
  // Format the date range
  const mondayStr = mondayOfWeek.getUTCDate().toString().padStart(2, '0') + '/' + 
                   (mondayOfWeek.getUTCMonth() + 1).toString().padStart(2, '0');
  const sundayStr = sundayOfWeek.getUTCDate().toString().padStart(2, '0') + '/' + 
                   (sundayOfWeek.getUTCMonth() + 1).toString().padStart(2, '0');
  
  return {
    weekNo,
    dateRange: `${mondayStr}-${sundayStr}`,
    year: d.getUTCFullYear()
  };
}

// Function to analyze keywords in notes
function analyzeNotes(salaries) {
  const keywordCounts = {};
  const validSalaries = salaries.filter(s => s.notes && s.notes.trim().length > 0);
  
  // Skip if no valid notes
  if (validSalaries.length === 0) {
    return [];
  }
  
  // Extract keywords and count their occurrences
  validSalaries.forEach(salary => {
    const words = salary.notes.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      // Ignore short words and common stop words (Italian & English)
      if (word.length < 3 || ['and', 'the', 'for', 'with', 'this', 'that', 'del', 'della', 'che', 'per', 'con', 'una', 'uno'].includes(word)) {
        return;
      }
      
      keywordCounts[word] = (keywordCounts[word] || 0) + 1;
    });
  });
  
  // Convert to array and sort by frequency
  const keywordsArray = Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Get top 20 keywords
  
  return keywordsArray;
}

// Function to get all unique keywords from notes
async function getUniqueNotesKeywords(session) {
  try {
    const salaries = await prisma.salary.findMany({
      where: {
        userId: session.user.id,
        notes: {
          not: null,
        },
      },
      select: {
        notes: true,
      },
    });
    
    const allWords = new Set();
    
    salaries.forEach(salary => {
      if (salary.notes && salary.notes.trim().length > 0) {
        const words = salary.notes.toLowerCase().split(/\s+/);
        
        words.forEach(word => {
          // Filter out short words and common stop words
          if (word.length >= 3 && !['and', 'the', 'for', 'with', 'this', 'that', 'del', 'della', 'che', 'per', 'con', 'una', 'uno'].includes(word)) {
            allWords.add(word);
          }
        });
      }
    });
    
    return Array.from(allWords).sort();
  } catch (error) {
    console.error('Error getting unique notes keywords:', error);
    return [];
  }
}
