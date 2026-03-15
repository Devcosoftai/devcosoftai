const nodemailer = require('nodemailer');

// Create transporter only if credentials are available
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  // Determine SMTP settings based on email provider
  const emailUser = process.env.EMAIL_USER.toLowerCase();
  let smtpHost = process.env.EMAIL_HOST;
  let smtpPort = process.env.EMAIL_PORT || 587;
  let secure = false;

  // Auto-detect email provider if EMAIL_HOST not set
  if (!smtpHost) {
    if (emailUser.includes('@gmail.com')) {
      smtpHost = 'smtp.gmail.com';
    } else if (emailUser.includes('@outlook.com') || emailUser.includes('@hotmail.com') || emailUser.includes('@live.com')) {
      smtpHost = 'smtp-mail.outlook.com';
    } else if (emailUser.includes('@yahoo.com')) {
      smtpHost = 'smtp.mail.yahoo.com';
      smtpPort = 587;
    } else if (emailUser.includes('@hostinger.com') || emailUser.includes('@titan.email')) {
      // Hostinger email (Titan Email)
      smtpHost = 'smtp.titan.email';
      smtpPort = 587;
    } else {
      // Try to detect custom domain emails - default to Hostinger if common hosting
      // For custom domains, user should specify EMAIL_HOST
      smtpHost = 'smtp.hostinger.com'; // Default to Hostinger for custom domains
    }
  }

  // Use secure connection for port 465
  if (smtpPort == 465) {
    secure = true;
  }

  // Check if using Outlook/Office 365
  const isOutlook = emailUser.includes('@outlook.com') || 
                    emailUser.includes('@hotmail.com') || 
                    emailUser.includes('@live.com') ||
                    emailUser.includes('@office365.com') ||
                    emailUser.includes('@microsoft.com');

  if (isOutlook && smtpHost.includes('outlook.com')) {
    console.log('\n📧 Using Outlook/Office 365 email service...');
    console.log('   Note: Personal Outlook accounts require Office 365 business setup.');
    console.log('   If you get authentication errors, you may need to enable SMTP AUTH.\n');
  }

  // Create transporter for all accounts (including Outlook)
  // For Office 365 business accounts, SMTP AUTH must be enabled by admin
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: secure, // true for 465, false for other ports (587 uses STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Increased timeouts for better reliability
    connectionTimeout: 30000, // 20 seconds to establish connection
    greetingTimeout: 20000,   // 15 seconds for server greeting
    socketTimeout: 40000,      // 30 seconds for socket operations
  });

  // Verify connection configuration
  transporter.verify((error, success) => {
      if (error) {
      console.log('❌ Mailer configuration error:', error.message);
      
      // Handle timeout errors
      if (error.message.includes('Timeout') || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
        console.log(`⚠️  Connection timeout - Cannot reach SMTP server (${smtpHost}:${smtpPort})`);
      }
      // Handle federated authentication errors (ADFS/STS)
      else if (error.message.includes('federated STS service was unreachable') || 
               error.message.includes('federated') ||
               error.message.includes('STS service')) {
        console.log('⚠️  Federated authentication error - Cannot reach Microsoft authentication service');
      }
      // Handle SMTP authentication disabled errors
      else if (error.message.includes('SmtpClientAuthentication is disabled') || 
          (error.message.includes('Authentication unsuccessful') && 
           !error.message.includes('federated'))) {
        console.log('⚠️  SMTP Authentication failed - Check email credentials or switch to Gmail/SendGrid');
      }
      
      console.log('⚠️  Email notifications will be disabled');
      } else {
        console.log('✅ Mailer ready to send emails');
        console.log(`   Using: ${smtpHost}:${smtpPort}`);
      }
    });
  }

/**
 * Send notification email to admin about new contact submission
 */
exports.sendContactNotification = async (contactData) => {
  if (!transporter || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email credentials not configured. Skipping email notification.');
    return null;
  }

  const { name, email, company, service, budget, message } = contactData;

  // Parse CC emails from environment variable (comma-separated)
  const ccEmails = process.env.EMAIL_CC 
    ? process.env.EMAIL_CC.split(',').map(email => email.trim()).filter(email => email)
    : [];

  const mailOptions = {
    from: `"DevCoSoft.ai Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    cc: ccEmails.length > 0 ? ccEmails : undefined,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
          ${service ? `<p><strong>Service:</strong> ${service}</p>` : ''}
          ${budget ? `<p><strong>Budget:</strong> ${budget}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p style="background: white; padding: 15px; border-left: 3px solid #007bff; margin-top: 10px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
        </div>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          This is an automated notification from DevCoSoft.ai contact form.
        </p>
      </div>
    `,
    text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ''}
${service ? `Service: ${service}` : ''}
${budget ? `Budget: ${budget}` : ''}

Message:
${message}
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Contact notification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending contact notification email:', error.message);
    return null;
  }
};

/**
 * Send confirmation email to the user who submitted the contact form
 */
exports.sendContactConfirmation = async (contactData) => {
  if (!transporter || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  const { name, email } = contactData;

  // Parse CC emails from environment variable (comma-separated)
  // For confirmation emails, you might want different CC or none
  const ccEmails = process.env.EMAIL_CC_CONFIRMATION 
    ? process.env.EMAIL_CC_CONFIRMATION.split(',').map(email => email.trim()).filter(email => email)
    : [];

  const mailOptions = {
    from: `"DevCoSoft.ai" <${process.env.EMAIL_USER}>`,
    to: email,
    cc: ccEmails.length > 0 ? ccEmails : undefined,
    subject: 'Thank you for contacting DevCoSoft.ai',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank you, ${name}!</h2>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p>Our team is reviewing your inquiry and will respond as soon as possible.</p>
        <p style="margin-top: 30px; color: #666;">
          Best regards,<br>
          <strong>The DevCoSoft.ai Team</strong>
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          This is an automated confirmation email. Please do not reply to this message.
        </p>
      </div>
    `,
    text: `
Thank you, ${name}!

We've received your message and will get back to you within 24 hours.

Our team is reviewing your inquiry and will respond as soon as possible.

Best regards,
The DevCoSoft.ai Team
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Contact confirmation email sent to:', email);
    return info;
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error.message);
    return null;
  }
};

module.exports = exports;
