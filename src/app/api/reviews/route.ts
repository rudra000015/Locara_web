import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/mongodb';
import { Review as ReviewModel } from '@/models/Review';
import { requireAuth } from '@/middleware/auth';

function computeStats(reviewDocs: any[]) {
  const totalReviews = reviewDocs.length;
  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const tagCounts: Record<string, number> = {};
  let total = 0;

  for (const r of reviewDocs) {
    const rating = r.rating || 0;
    if (rating >= 1 && rating <= 5) {
      ratingBreakdown[rating as keyof typeof ratingBreakdown] = (ratingBreakdown[rating as keyof typeof ratingBreakdown] || 0) + 1;
    }
    total += rating;
    (r.tags || []).forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  }

  return {
    shopId: reviewDocs[0]?.shopId || '',
    totalReviews,
    averageRating: totalReviews ? +(total / totalReviews).toFixed(1) : 0,
    ratingBreakdown,
    tagCounts,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('shopId');

    if (!shopId) {
      return NextResponse.json({ success: false, error: 'shopId required' }, { status: 400 });
    }

    await connectDb();
    const shopReviews = await ReviewModel.find({ shopId }).sort({ createdAt: -1 }).lean();
    const reviews = shopReviews.map((r) => ({ ...r, id: r._id?.toString() || '' }));
    const stats = computeStats(shopReviews);

    return NextResponse.json({ success: true, reviews, stats }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/reviews] error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      shopId,
      rating,
      title,
      body: reviewBody,
      tags = [],
      verified = false,
      userName,
      userImg,
    } = body;

    if (!shopId || rating == null || !title || !reviewBody) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await connectDb();
    await ReviewModel.findOneAndDelete({ shopId, userId: user.id });

    const newReview = await ReviewModel.create({
      user: user.id,
      shopId,
      userId: user.id,
      userName: userName || 'Anonymous',
      userImg: userImg || '',
      rating,
      title,
      body: reviewBody,
      tags,
      helpful: 0,
      helpfulBy: [],
      verified,
      ownerReply: undefined,
    });

    const allReviews = await ReviewModel.find({ shopId }).sort({ createdAt: -1 }).lean();
    const stats = computeStats(allReviews);

    return NextResponse.json({ success: true, review: { ...newReview.toObject(), id: newReview._id.toString() }, stats }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/reviews] error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
