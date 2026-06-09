# SMTP Integration for Contact Forms

This template is fully integrated with the web builder's SMTP system for handling contact form submissions.

## How it Works

1. **Contact Forms** - All contact forms in this template submit to `/api/contact`
2. **API Route** - The API route forwards submissions to the backend SMTP service
3. **Email Delivery** - The backend sends formatted emails using the configured SMTP settings

## Contact Form Locations

### 1. Main Contact Section
- **File**: `app/components/sections/ContactSection.tsx`
- **Used in**: Main page contact section and dedicated contact page
- **Fields**: Name, Email, Phone, Message
- **Subject**: "Contact Form Submission from Website"

### 2. Service Contact Form
- **File**: `app/components/sections/ServiceContactFormSection.tsx`
- **Used in**: Individual service pages
- **Fields**: Name, Email, Phone, Message
- **Subject**: "Service Inquiry: [Service Name]"

### 3. Contact Page
- **File**: `app/contact-us/page.tsx`
- **Route**: `/contact-us`
- **Features**: Full contact section with map and business hours

## Configuration

### Environment Variables
Create a `.env.local` file based on `.env.local.example`:

```env
# Backend API URL for SMTP integration
BACKEND_API_URL=http://localhost:5000

# Site configuration
NEXT_PUBLIC_WEBBUILDER_SITE_SLUG=your-site-slug
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### SMTP Settings
Configure SMTP in the web builder admin panel:
1. Go to **SMTP Settings** in the admin sidebar
2. Add your SMTP configuration (host, port, credentials)
3. Test the connection
4. Set as active

## Email Content

Submitted forms include:
- **Name**, **Email**, **Phone** (optional)
- **Subject** (automatically generated)
- **Message**
- **Site ID** and **Service ID** (when applicable)
- **Timestamp**

Emails are sent to the configured "from email" address with formatted HTML content.

## Error Handling

- ✅ **Success**: "Message sent successfully! We'll get back to you soon."
- ❌ **Validation**: Shows specific field errors
- ❌ **SMTP Error**: "Failed to send message. Please try again."
- ❌ **Network Error**: "Network error. Please check your connection and try again."

## Development Mode

If the backend is unavailable, submissions are logged to console in development mode.

## Testing

1. Configure SMTP settings in the web builder
2. Test the connection in SMTP Settings
3. Submit a contact form on the template
4. Check the configured email inbox for the submission

## Security

- Input validation on both frontend and backend
- Email format validation
- SQL injection protection via MongoDB
- Rate limiting on backend API

## Customization

To modify form fields:
1. Edit the form components in `app/components/sections/`
2. Update the API route validation in `app/api/contact/route.ts`
3. Update the backend validation in `backend/src/routes/contact.ts`

To customize email templates:
1. Edit the email content in `backend/src/routes/contact.ts`
2. Modify the HTML formatting and text content
