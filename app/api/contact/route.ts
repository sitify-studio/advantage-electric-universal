import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  siteId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Send to backend API which will handle SMTP email sending
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5000';
    
    try {
      const response = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const responseText = await response.text();
      console.log('Backend response status:', response.status);
      console.log('Backend response text:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText || 'Unknown backend error' };
        }
        throw new Error(errorData.error || `Backend error: ${response.status}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { success: true, message: 'Contact form submitted successfully' };
      }

      return NextResponse.json(result, { status: 200 });
    } catch (fetchError) {
      console.error('Backend API error:', fetchError);
      
      // Fallback: log the submission in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Contact form submission (fallback):', body);
        return NextResponse.json(
          { success: true, message: 'Contact form submitted (development mode)' },
          { status: 200 }
        );
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
