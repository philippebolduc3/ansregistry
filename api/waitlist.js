// api/waitlist.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Debug logging
    console.log('=== DEBUG INFO ===');
    console.log('Email received:', email);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('NOTIFICATION_EMAIL:', process.env.NOTIFICATION_EMAIL);
    console.log('==================');

    // Validate email
    if (!email || !email.includes('@')) {
      console.log('Email validation failed:', email);
      return res.status(400).json({ error: 'Invalid email address' });
    }

    console.log('Attempting to send email via Resend...');

    // Send notification email to you only
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend default for testing
      to: [process.env.NOTIFICATION_EMAIL],
      subject: 'New ANS Registry Waitlist Signup',
      html: `
        <h2>New Waitlist Signup</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>IP:</strong> ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}</p>
        <p><strong>User Agent:</strong> ${req.headers['user-agent']}</p>
        
        <h3>Follow-up Action:</h3>
        <p>You can now add ${email} to your outreach list.</p>
        
        <p>View site: <a href="https://ansregistry.org">ansregistry.org</a></p>
      `
    });

    console.log('Resend response:', result);
    console.log('Email sent successfully!');

    res.status(200).json({ 
      success: true, 
      message: 'Successfully joined waitlist',
      debug: {
        emailId: result.data?.id,
        hasApiKey: !!process.env.RESEND_API_KEY,
        notificationEmail: process.env.NOTIFICATION_EMAIL
      }
    });

  } catch (error) {
    console.error('Waitlist error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to join waitlist',
      details: error.message,
      debug: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        notificationEmail: process.env.NOTIFICATION_EMAIL
      }
    });
  }
}