import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get salary IDs from request body
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs di salario mancanti o non validi' }, { status: 400 });
    }

    // Verify all salaries exist and belong to the current user
    const salaries = await prisma.salary.findMany({
      where: {
        id: { in: ids },
        userId: session.user.id
      }
    });

    if (salaries.length !== ids.length) {
      return NextResponse.json({ 
        error: 'Uno o più salari non trovati o non appartengono all\'utente corrente' 
      }, { status: 404 });
    }

    // Delete the salaries in a transaction
    await prisma.$transaction(async (tx) => {
      for (const id of ids) {
        await tx.salary.delete({
          where: { id }
        });
      }
    });

    return NextResponse.json({
      message: `${ids.length} salari eliminati con successo`,
      success: true
    });

  } catch (error) {
    console.error('Error deleting salaries:', error);
    return NextResponse.json(
      { error: 'Impossibile eliminare i salari', details: error.message },
      { status: 500 }
    );
  }
} 