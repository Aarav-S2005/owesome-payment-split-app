

const sendInvitationTemplate = (inviter:string, groupName: string, link: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin: 0; padding: 30px 15px; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 8px; padding: 32px; border: 1px solid #e5e7eb;">
    <tr>
      <td align="center">
        <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #111827;">Join ${groupName}</h2>
        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.5; color: #4b5563;">
          You've been invited to join the <strong>${groupName}</strong> group by ${inviter}. Click the button below to accept and get started.
        </p>
        <a href="${link}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
          Join Group
        </a>
        <p style="margin: 24px 0 0 0; font-size: 12px; color: #9ca3af;">
          If you weren't expecting this invitation, you can ignore this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}