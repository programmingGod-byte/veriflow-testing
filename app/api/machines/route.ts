import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import  connectToDatabase  from '@/lib/mongodb'; // Adjust path as needed
import User from '@/models/User'; // Adjust path as needed




export async function GET(request:any) {
  // Check authentication
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Find the user and populate machines
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform machines data to exclude sensitive information (passwords)
    // and add any additional computed fields
    const machines = user.machines.map(machine => ({
      machineCode: machine.machineCode,
      machineType:machine.machineType,
      machineName: machine.machineName || `Machine ${machine.id}`, // Default name if not set
      status: machine.status || 'offline', // Default status if not set
      addedAt: machine.addedAt || machine._id.getTimestamp(), // Use creation time if addedAt not available
      longitude:machine.longitude,
      latitude:machine.latitude,
      // Add any other fields you want to return, but NOT the password
      // lastSeen: machine.lastSeen,
      // location: machine.location,
      // type: machine.type,
    }));

    console.log(machines)
    // Return machines data
    return NextResponse.json({
      machines: machines,
      totalMachines: machines.length,
      message: machines.length === 0 ? 'No machines found' : `Found ${machines.length} machine(s)`
    });

  } catch (error:any) {
    console.error('Error fetching machines:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid user data format' }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Server error while fetching machines' }, 
      { status: 500 }
    );
  }
}


export async function POST(request:any) {
  // Check authentication
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Parse request body
    const body = await request.json();
    const { machineName, machineCode,machineType } = body;
    
    // const { machineId, password } = body;
    // Validate required fields
    if (!machineName || !machineCode || !machineType) {
      return NextResponse.json(
        { error: 'Machine ID and password are required' }, 
        { status: 400 }
      );
    }

    // Validate machineId format (optional - adjust as needed)
    if (typeof machineName !== 'string' || machineName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid machine name format' }, 
        { status: 400 }
      );
    }

    

    // Connect to database
    await connectToDatabase();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if machine already exists for this user
    const existingMachine = user.machines.find(machine => machine.machineCode === machineCode.trim());
    if (existingMachine) {
      return NextResponse.json(
        { error: 'Machine with this code already exists' }, 
        { status: 409 }
      );
    }

    // Create new machine object
    const newMachine = {
      machineName: machineName.trim(),
      machineCode: machineCode,
      machineType:machineType
      // You can add additional fields here like:
      // name: body.name || `Machine ${machineId}`,
      // status: 'offline',
      // addedAt: new Date(),
    };

    // Add machine to user's machines array
    user.machines.push(newMachine);
    user.updatedAt = new Date();

    // Save the updated user
    await user.save();

    // Return success response (don't include password in response)
    const responseData = {
      message: 'Machine added successfully',
      machine: {
        machineName: newMachine.machineName,
        machineCode:newMachine.machineCode,
        machineType:newMachine.machineType
        // Include other fields you want to return, but not the password
        // name: newMachine.name,
        // status: newMachine.status,
      },
      totalMachines: user.machines.length
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error:any) {
    console.error('Error adding machine:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error: ' + error.message }, 
        { status: 400 }
      );
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid data format' }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Server error while adding machine' }, 
      { status: 500 }
    );
  }
}


