import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
  // Check authentication
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
        notifications: user.notifications,
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  // Check authentication
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    const data = await request.json();
    await connectToDatabase();
    
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        ...data,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 