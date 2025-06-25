import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Contact from '@/models/Contact';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, subject, message } = data;

    // Validate the required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, subject, and message.' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Create and save the contact document
    const contact = new Contact({ name, email, subject, message });
    await contact.save();

    return NextResponse.json(
      { success: true, message: 'Contact message submitted successfully.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Connect to the database and fetch all contacts
    await connectToDatabase();
    const contacts = await Contact.find();

    return NextResponse.json(
      { success: true, contacts },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Expecting the id as a query parameter, e.g., /api/contact? id=12345
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Missing required query parameter: id" },
        { status: 400 }
      );
    }

    // Connect to the database and attempt deletion by ID
    await connectToDatabase();
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Contact deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
