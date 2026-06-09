import { NextRequest, NextResponse } from 'next/server';

// Mock testimonials data - in production, this would come from your database
const mockTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'CEO',
    company: 'Tech Innovations Inc.',
    content: 'Exceptional service and attention to detail. They transformed our entire digital presence and exceeded our expectations.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    featured: true
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Marketing Director',
    company: 'Global Solutions Ltd.',
    content: 'Professional, reliable, and innovative. Their team delivered outstanding results on time and within budget.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    featured: true
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Founder',
    company: 'Creative Studios',
    content: 'The best decision we made for our business. Their expertise and dedication made all the difference.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    featured: false
  },
  {
    id: '4',
    name: 'David Thompson',
    role: 'Operations Manager',
    company: 'Industrial Corp',
    content: 'Outstanding communication and project management. They truly understand client needs.',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    featured: false
  },
  {
    id: '5',
    name: 'Lisa Wang',
    role: 'Product Manager',
    company: 'Startup Hub',
    content: 'Innovative solutions and excellent support. Highly recommend for any business looking to grow.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    featured: false
  }
];

export async function GET(request: NextRequest) {
  try {
    // In production, you would fetch testimonials from your database
    // const testimonials = await Testimonial.find({ enabled: true }).sort({ featured: -1, createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: {
        testimonials: mockTestimonials,
        title: "Client Testimonials",
        description: "Hear what our clients have to say about our services"
      }
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In production, you would save to your database
    // const testimonial = new Testimonial(body);
    // await testimonial.save();
    
    return NextResponse.json({
      success: true,
      data: { message: 'Testimonial created successfully' }
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}
