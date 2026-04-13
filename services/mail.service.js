const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

transporter.verify((err) => {
    if (err) console.error('Mail service error:', err.message);
    else console.log('Mail service ready');
});

const sendEnquiryEmail = async ({
                                    ownerEmail,
                                    ownerName,
                                    propertyTitle,
                                    propertyLocation,
                                    senderName,
                                    senderEmail,
                                    senderMobile,
                                    details,
                                }) => {
    return transporter.sendMail({
        from: `"${process.env.COMPANY_NAME || 'Rent Market'}" <${process.env.GMAIL_USER}>`,
        to: ownerEmail,
        replyTo: senderEmail,
        subject: `New enquiry for: ${propertyTitle}`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
  <tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0"
           style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8e2;">

      <!-- Header -->
      <tr>
        <td style="background:#62be63;padding:28px 32px;">
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">New Property Enquiry</h1>
          <p style="margin:6px 0 0;color:#d4f0d4;font-size:13px;">
            ${process.env.COMPANY_NAME || 'Rent Market'}
          </p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:28px 32px;">

          <p style="margin:0 0 16px;color:#212234;font-size:15px;">
            Hi <strong>${ownerName}</strong>,
          </p>
          <p style="margin:0 0 22px;color:#484e48;font-size:14px;line-height:1.6;">
            You have received a new enquiry for your property listing.
          </p>

          <!-- Property box -->
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#f4f6f4;border-left:4px solid #62be63;border-radius:6px;margin-bottom:24px;">
            <tr><td style="padding:14px 18px;">
              <p style="margin:0;font-size:11px;color:#484e48;text-transform:uppercase;letter-spacing:0.6px;">Property</p>
              <p style="margin:5px 0 0;font-size:15px;font-weight:bold;color:#212234;">${propertyTitle}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#484e48;">📍 ${propertyLocation}</p>
            </td></tr>
          </table>

          <!-- Enquirer details -->
          <p style="margin:0 0 10px;font-size:11px;font-weight:bold;color:#212234;text-transform:uppercase;letter-spacing:0.6px;">
            Enquirer details
          </p>
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border:1px solid #dedfe7;border-radius:8px;overflow:hidden;margin-bottom:24px;">
            <tr style="background:#f9fafb;">
              <td style="padding:12px 16px;font-size:12px;color:#484e48;width:120px;border-bottom:1px solid #dedfe7;">Name</td>
              <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#212234;border-bottom:1px solid #dedfe7;">${senderName}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:12px;color:#484e48;border-bottom:1px solid #dedfe7;">Email</td>
              <td style="padding:12px 16px;font-size:13px;border-bottom:1px solid #dedfe7;">
                <a href="mailto:${senderEmail}" style="color:#62be63;text-decoration:none;">${senderEmail}</a>
              </td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:12px 16px;font-size:12px;color:#484e48;${details ? 'border-bottom:1px solid #dedfe7;' : ''}">Mobile</td>
              <td style="padding:12px 16px;font-size:13px;${details ? 'border-bottom:1px solid #dedfe7;' : ''}">
                <a href="tel:${senderMobile}" style="color:#212234;text-decoration:none;">${senderMobile}</a>
              </td>
            </tr>
            ${details ? `
            <tr>
              <td style="padding:12px 16px;font-size:12px;color:#484e48;vertical-align:top;">Message</td>
              <td style="padding:12px 16px;font-size:13px;color:#484e48;line-height:1.6;">${details}</td>
            </tr>` : ''}
          </table>

          <!-- Reply note -->
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#f0faf0;border-radius:8px;margin-bottom:20px;">
            <tr><td style="padding:14px 18px;">
              <p style="margin:0;font-size:13px;color:#212234;line-height:1.6;">
                💬 Reply to
                <a href="mailto:${senderEmail}" style="color:#62be63;font-weight:600;">${senderEmail}</a>
                or call
                <a href="tel:${senderMobile}" style="color:#62be63;font-weight:600;">${senderMobile}</a>
              </p>
            </td></tr>
          </table>

          <hr style="border:none;border-top:1px solid #dedfe7;margin:0 0 16px;">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
            Sent by ${process.env.COMPANY_NAME || 'Rent Market'} on behalf of a viewing user.
          </p>

        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`,
    });
};

module.exports = {sendEnquiryEmail};