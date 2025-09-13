import { NextResponse } from 'next/server';
import { firestoreAdmin as firestore } from '@/lib/firebase-admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json(
        { message: 'Unauthorized: No business associated with this account.' },
        { status: 401 }
      );
    }

    const businessId = session.user.businessId;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month'; // Default to month
    const direction = searchParams.get('direction') || 'outgoing'; // Default to outgoing

    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
    }

    const messagesSnapshot = await firestore
      .collection('messages')
      .where('businessId', '==', businessId)
      .where('direction', '==', direction)
      .where('sent_at', '>=', startDate)
      .get();

    const messageCount = messagesSnapshot.size;

    return NextResponse.json({ messageCount });

  } catch (error) {
    console.error('Failed to fetch message count:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred while fetching analytics.' },
      { status: 500 }
    );
  }
}
