import { ENV } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

const buildEmailEndpoint = (baseUrl: string): string => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendEmail",
    normalizedBase
  ).toString();
};

/**
 * Send an email to a participant
 * Returns true if successful, false if the service is unavailable
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!ENV.forgeApiUrl) {
    console.error("[Email] Forge API URL not configured");
    return false;
  }

  if (!ENV.forgeApiKey) {
    console.error("[Email] Forge API key not configured");
    return false;
  }

  const endpoint = buildEmailEndpoint(ENV.forgeApiUrl);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Failed to send email to ${payload.to} (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    console.log(`[Email] Successfully sent email to ${payload.to}`);
    return true;
  } catch (error) {
    console.error(`[Email] Error sending email to ${payload.to}:`, error);
    return false;
  }
}

/**
 * Generate welcome email HTML for new participants
 */
export function generateWelcomeEmailHtml(
  participantName: string,
  dashboardUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #b8860b;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #1a1a1a;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      color: #b8860b;
      margin: 5px 0 0 0;
      font-size: 14px;
    }
    .content {
      margin: 20px 0;
    }
    .content h2 {
      color: #1a1a1a;
      font-size: 20px;
      margin-bottom: 15px;
    }
    .content p {
      margin: 10px 0;
      color: #555;
    }
    .points-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background-color: #faf1e4;
    }
    .points-table th,
    .points-table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .points-table th {
      background-color: #b8860b;
      color: white;
      font-weight: bold;
    }
    .cta-button {
      display: inline-block;
      background-color: #b8860b;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #9a7109;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    .highlight {
      background-color: #faf1e4;
      padding: 15px;
      border-left: 4px solid #b8860b;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌙 Ramadan Challenge</h1>
      <p>Welcome to Your Spiritual Journey</p>
    </div>

    <div class="content">
      <h2>Welcome, ${participantName}!</h2>
      
      <p>Alhamdulillah! We're excited to have you join the Ramadan Challenge. This is your opportunity to track your spiritual journey, compete with fellow believers, and earn rewards for your dedication during this blessed month.</p>

      <div class="highlight">
        <strong>🎯 Your Dashboard is Ready!</strong><br>
        Click the button below to access your dashboard and start logging your activities.
      </div>

      <a href="${dashboardUrl}" class="cta-button">Go to Dashboard</a>

      <h2>📊 How Points Work</h2>
      <p>Track your daily activities and earn points based on your spiritual efforts:</p>
      
      <table class="points-table">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Daily Prayers (each)</td>
            <td>10 pts</td>
          </tr>
          <tr>
            <td>Tahajud Prayer (each)</td>
            <td>30 pts</td>
          </tr>
          <tr>
            <td>Tarawih 20 Rakat</td>
            <td>100 pts</td>
          </tr>
          <tr>
            <td>Tarawih 8 Rakat</td>
            <td>40 pts</td>
          </tr>
          <tr>
            <td>Full Day Fasting</td>
            <td>100 pts</td>
          </tr>
          <tr>
            <td>Quran Reading (Arabic, per page)</td>
            <td>20 pts</td>
          </tr>
          <tr>
            <td>Quran Reading (Other Languages, per page)</td>
            <td>10 pts</td>
          </tr>
          <tr>
            <td>Islamic Books (per page)</td>
            <td>8 pts</td>
          </tr>
          <tr>
            <td>Other Books (per page)</td>
            <td>4 pts</td>
          </tr>
          <tr>
            <td>Podcasts (per minute)</td>
            <td>3 pts</td>
          </tr>
          <tr>
            <td>Salawat (10 = 1 pt)</td>
            <td>0.1 pts</td>
          </tr>
        </tbody>
      </table>

      <h2>🏆 Prizes</h2>
      <p>The top 5 participants will receive monetary rewards at the end of Ramadan. Your consistent effort and dedication will be recognized and rewarded!</p>

      <h2>💡 Getting Started</h2>
      <ol>
        <li>Log in to your dashboard using the link above</li>
        <li>Update your display name (optional)</li>
        <li>Start logging your daily activities</li>
        <li>Check the leaderboard to see your ranking</li>
        <li>Stay motivated and consistent throughout Ramadan!</li>
      </ol>

      <h2>❓ Need Help?</h2>
      <p>If you have any issues logging in or using the dashboard, please:</p>
      <ul>
        <li>Clear your browser cache and cookies</li>
        <li>Try a different browser</li>
        <li>Check that cookies are enabled in your browser settings</li>
        <li>Make sure JavaScript is enabled</li>
      </ul>

      <div class="highlight">
        <strong>💝 Supporting the Challenge</strong><br>
        Your donations help sustain this initiative and increase prize pools for all participants. Every contribution—no matter the amount—makes a meaningful difference. Visit the donation page in the app to learn more.
      </div>
    </div>

    <div class="footer">
      <p>Ramadan Challenge Tracker | May your Ramadan be blessed with countless good deeds</p>
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
  `;
}
