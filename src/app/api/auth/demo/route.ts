import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/mongodb';
import { signAuthToken } from '@/lib/auth';
import { User } from '@/models/User';
import { ShopProfile } from '@/models/ShopProfile';
import type { Types } from 'mongoose';

const DEMO_ACCOUNTS = {
  explorer: {
    name: 'Rohan Mehta',
    email: 'explorer@demo.locara.test',
    img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop',
  },
  owner: {
    name: 'Maya Rao',
    email: 'owner@demo.locara.test',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
  },
} as const;

async function ensureDemoOwnerShop(owner: { _id: Types.ObjectId; name: string; email: string; img?: string }) {
  const ownerId = owner._id;
  const existing = await ShopProfile.findOne({ ownerId }).sort({ updatedAt: -1 });
  if (existing) return existing;

  return ShopProfile.create({
    shopId: 'locara-demo-maya-studio',
    ownerId,
    ownerName: owner.name,
    ownerEmail: owner.email,
    ownerImg: owner.img,
    name: 'Maya Studio & Atelier',
    description: 'A contemporary Bangalore atelier bringing together handwoven silks, thoughtful tailoring, and locally made occasion wear.',
    address: '428 100ft Road, Indiranagar',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    phone: '+91 80 4123 9988',
    category: 'womens-fashion',
    subcategory: 'Handwoven silk and occasion wear',
    businessType: 'Boutique',
    priceRange: '₹1,500–₹25,000',
    yearsInBusiness: 12,
    targetAudience: 'Local shoppers and occasion wear customers',
    productsServices: 'Handwoven sarees, blouses, custom tailoring',
    area: 'Indiranagar',
    pincode: '560038',
    shopStyle: 'Contemporary with traditional craft',
    keywords: ['silk saree', 'handwoven', 'occasion wear', 'tailoring'],
    tags: ['handwoven', 'silk', 'occasion wear', 'local atelier'],
    specialties: ['Handwoven silk', 'Custom tailoring', 'Occasion wear'],
    tagline: 'Crafted for the moments that matter',
    status: 'APPROVED',
    est: 2014,
    age: 12,
    isOpen: true,
    openTime: '10:00',
    closeTime: '20:00',
    rating: 4.8,
    totalRatings: 126,
    photos: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1200&auto=format&fit=crop',
    ],
    products: [
      { id: 'demo-silk-saree', name: 'Raw Mango Mulberry Silk Saree', price: 18500, unit: 'piece', description: 'Handwoven silk saree in a rich seasonal palette.', category: 'Womens Fashion', inStock: true, isNew: true, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop' },
      { id: 'demo-handloom-dupatta', name: 'Handloom Silk Dupatta', price: 4200, unit: 'piece', description: 'A lightweight handloom layer finished by local artisans.', category: 'Ethnic Wear', inStock: true, isNew: true, image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e8?q=80&w=900&auto=format&fit=crop' },
      { id: 'demo-tailoring', name: 'Custom Occasion Blouse', price: 3500, unit: 'piece', description: 'Made to measure with a choice of traditional finishes.', category: 'Custom Tailoring', inStock: true, isNew: false, image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?q=80&w=900&auto=format&fit=crop' },
    ],
    location: { type: 'Point', coordinates: [77.6412, 12.9716] },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const role = body?.role === 'owner' ? 'owner' : body?.role === 'explorer' ? 'explorer' : null;
    if (!role) return NextResponse.json({ error: 'Choose a demo profile to continue.' }, { status: 400 });

    await connectDb();
    const profile = DEMO_ACCOUNTS[role];
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({ ...profile, role, provider: 'credentials' });
    } else if (user.role !== role || !user.img) {
      user.role = role;
      user.img = profile.img;
      await user.save();
    }

    if (role === 'owner') {
      await ensureDemoOwnerShop({ _id: user._id, name: user.name, email: user.email, img: user.img });
    }

    const token = signAuthToken({ id: user._id.toString(), email: user.email, role });
    return NextResponse.json({
      user: { id: user._id.toString(), name: user.name, email: user.email, role, img: user.img },
      token,
    });
  } catch (error) {
    console.error('[POST /api/auth/demo]', error);
    return NextResponse.json({ error: 'Demo sign-in is unavailable right now. Please try again.' }, { status: 503 });
  }
}
