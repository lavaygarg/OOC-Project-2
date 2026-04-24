const nodemailer = require('nodemailer');

const parseRecipients = (input) => {
    const fallback = 'garglavay@gmail.com';
    const raw = (input || fallback)
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);

    return raw.length ? raw : [fallback];
};

const getTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });
};

const buildHtml = ({ subject, bodyLines = [], metadata = {} }) => {
    const metadataRows = Object.entries(metadata)
        .map(([key, value]) => `<tr><td style="padding:6px 10px;border:1px solid #e5e7eb;"><strong>${key}</strong></td><td style="padding:6px 10px;border:1px solid #e5e7eb;">${String(value)}</td></tr>`)
        .join('');

    return `
        <div style="font-family:Arial,sans-serif;color:#111827;max-width:680px;margin:auto;">
            <h2 style="color:#991b1b;">Hope Foundation Security Alert</h2>
            <p style="font-size:14px;color:#374151;">${subject}</p>
            ${bodyLines.map(line => `<p style="font-size:14px;color:#111827;">${line}</p>`).join('')}
            ${metadataRows ? `
            <table style="border-collapse:collapse;width:100%;margin-top:12px;font-size:13px;">
                <tbody>${metadataRows}</tbody>
            </table>
            ` : ''}
            <p style="margin-top:16px;font-size:12px;color:#6b7280;">Automated security alert from OOC backend.</p>
        </div>
    `;
};

const sendSecurityAlert = async ({ subject, bodyLines = [], metadata = {} }) => {
    const transporter = getTransporter();
    if (!transporter) {
        return { sent: false, reason: 'SMTP is not configured' };
    }

    const recipients = parseRecipients(process.env.SECURITY_ALERT_EMAILS || process.env.SECURITY_ALERT_EMAIL);
    const from = process.env.ALERT_FROM_EMAIL || process.env.SMTP_USER;

    await transporter.sendMail({
        from,
        to: recipients,
        subject,
        text: [subject, ...bodyLines, JSON.stringify(metadata, null, 2)].join('\n'),
        html: buildHtml({ subject, bodyLines, metadata })
    });

    return { sent: true, recipients };
};

module.exports = { sendSecurityAlert };
