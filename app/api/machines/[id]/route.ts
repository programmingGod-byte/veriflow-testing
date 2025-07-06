
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import  connectToDatabase  from '@/lib/mongodb'; // Adjust path as needed
import User from '@/models/User'; // Adjust path as needed


export async function PUT(request: Request, context: { params: { id: string } }) {
  console.log("params:", context.params);

  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, ip, email } = body;

    const machineId = context.params.id;  // safer than destructuring if you want to debug

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const machine = user.machines.find((m: any) => m.password === machineId);
    if (!machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }

    if (name) machine.name = name;
    if (ip) machine.password = ip;

    await user.save();

    return NextResponse.json({ message: 'Machine updated successfully', newId: ip });

  } catch (error: any) {
    console.error('Error updating machine:', error);
    return NextResponse.json({ error: 'Server error while updating machine' }, { status: 500 });
  }
}
