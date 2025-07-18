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

    // Debug logging avec vraies valeurs
    console.log('=== WAITLIST DEBUG ===');
    console.log('Email received:', email);
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0,10)}...` : 'MISSING');
    console.log('NOTIFICATION_EMAIL:', process.env.NOTIFICATION_EMAIL);
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('RESEND') || key.includes('NOTIFICATION')));
    console.log('=====================');

    // Validate email
    if (!email || !email.includes('@')) {
      console.log('Email validation failed:', email);
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Check if API key exists
    if (!process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY is missing!');
      return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    }

    // Check if notification email exists
    if (!process.env.NOTIFICATION_EMAIL) {
      console.log('NOTIFICATION_EMAIL is missing!');
      return res.status(500).json({ error: 'NOTIFICATION_EMAIL not configured' });
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('Resend initialized with API key:', process.env.RESEND_API_KEY.substring(0,10) + '...');

    console.log('Attempting to send email...');
    console.log('From: onboarding@resend.dev');
    console.log('To:', process.env.NOTIFICATION_EMAIL);

    // Send notification email
    const result = await resend.emails.send({
      from: 'ANS Registry <noreply@ansregistry.org>', // Now use your verified domain!
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
    
    if (result.data) {
      console.log('Email sent successfully! ID:', result.data.id);
    } else {
      console.log('Email send failed:', result.error);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Successfully joined waitlist',
      debug: {
        emailId: result.data?.id,
        error: result.error,
        hasApiKey: !!process.env.RESEND_API_KEY,
        notificationEmail: process.env.NOTIFICATION_EMAIL
      }
    });

  } catch (error) {
    console.error('=== WAITLIST ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=====================');
    
    res.status(500).json({ 
      error: 'Failed to join waitlist',
      details: error.message
    });
  }
};