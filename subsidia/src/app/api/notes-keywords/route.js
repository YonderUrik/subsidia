import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get distinct notes for this user
    const distinctNotes = await prisma.salary.findMany({
      where: {
        userId: session.user.id,
        notes: {
          not: null,
          not: ""
        }
      },
      select: {
        notes: true
      },
      distinct: ['notes']
    });
    
    // Extract keywords from notes
    const notesKeywords = distinctNotes
      .filter(note => note.notes)
      .flatMap(note => {
        // Split notes by spaces and remove common words, punctuation
        const words = note.notes.split(/\s+|,|\.|;|:|\/|-|_/)
          .filter(word => word.length > 2) // Filter out short words
          .map(word => word.toLowerCase().trim())
          .filter(Boolean); // Remove empty strings
        return words;
      })
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      .sort();

    return NextResponse.json({
      data: notesKeywords,
      success: true
    });
  } catch (error) {
    console.error('Error fetching notes keywords:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 