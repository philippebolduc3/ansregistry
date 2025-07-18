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

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Store in database (we'll add this later)
    // For now, just send emails

    // Send notification email to you only
    await resend.emails.send({
      from: 'ANS Registry <noreply@ansregistry.org>',
      to: ['your-email@example.com'], // Replace with your actual email
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

    res.status(200).json({ 
      success: true, 
      message: 'Successfully joined waitlist' 
    });

  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ 
      error: 'Failed to join waitlist',
      details: error.message 
    });
  }
}