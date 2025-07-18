// api/waitlist.js
const { Resend } = require('resend');

module.exports = async function handler(req, res) {
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
    console.log('=== WAITLIST DEBUG ===');
    console.log('Email received:', email);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('NOTIFICATION_EMAIL:', process.env.NOTIFICATION_EMAIL);
    console.log('=====================');

    // Validate email
    if (!email || !email.includes('@')) {
      console.log('Email validation failed:', email);
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Initialize Resend here to catch errors
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('Resend initialized successfully');

    console.log('Attempting to send email...');

    // Send notification email
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [process.env.NOTIFICATION_EMAIL],
      subject: 'New ANS Registry Waitlist Signup',
      html: `
        <h2>New Waitlist Signup</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>IP:</strong> ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}</p>
        
        <p>Someone is interested in ANS Registry early access.</p>
      `
    });

    console.log('Resend response:', JSON.stringify(result, null, 2));
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
    console.error('=== WAITLIST ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('=====================');
    
    res.status(500).json({ 
      error: 'Failed to join waitlist',
      details: error.message,
      debug: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        notificationEmail: process.env.NOTIFICATION_EMAIL
      }
    });
  }
};