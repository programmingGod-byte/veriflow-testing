import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import  connectToDatabase  from '@/lib/mongodb'; // Adjust path as needed
import User from '@/models/User'; // Adjust path as needed



export async function POST(request) {
  try {
    // Parse JSON body
    const { email, machinePassword, latitude, longitude } = await request.json();
    console.log(email)
    if (!email || !machinePassword || !latitude || !longitude) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to DB
    await connectToDatabase();

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the machine by password (You can also include ID for better accuracy)
    const machine = user.machines.find((m) => m.machineCode === machinePassword);

    if (!machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }

    // Update location
    machine.latitude = latitude;
    machine.longitude = longitude;
    user.updatedAt = new Date();

    // Save changes
    await user.save();

    return NextResponse.json({
      message: 'Machine location updated successfully',
      machine: {
        id: machine.id,
        latitude: machine.latitude,
        longitude: machine.longitude,
        status: machine.status
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Update Machine Location Error:', error);
    return NextResponse.json({ error: 'Server error while updating location' }, { status: 500 });
  }
}
