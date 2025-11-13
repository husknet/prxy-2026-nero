import { NextResponse } from 'next/server';

const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1374688792249634847/AUasWsov70ZIOqxpEUlFczkVnpWkeIneGZeVSpMMrnWTniTz7jPaRb8ePoGXaCX1De-N';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip middleware for static assets and train page
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname === '/train'
  ) {
    return NextResponse.next();
  }

  const ip = req.ip || 
    req.headers.get('x-forwarded-for')?.split(',')[0] || 
    req.headers.get('x-real-ip') ||
    '0.0.0.0';
    
  const userAgent = req.headers.get('user-agent') || 'Unknown';

  try {
    const response = await fetch('https://bad-defender-production.up.railway.app/api/detect_bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, user_agent: userAgent })
    });

    if (!response.ok) {
      console.error(`Bot detection API error: ${response.status}`);
      return redirectToTrain(req);
    }

    const data = await response.json();
    const flags = data.details || {};

    const suspiciousFlags = {
      "Bot UA": flags.isBotUserAgent,
      "Scraper ISP": flags.isScraperISP,
      "IP Abuse": flags.isIPAbuser,
      "Traffic Spike": flags.isSuspiciousTraffic,
      "Data Center ASN": flags.isDataCenterASN
    };

    const triggeredReasons = Object.entries(suspiciousFlags)
      .filter(([_, val]) => val)
      .map(([key]) => key);

    const isSuspicious = triggeredReasons.length > 0;

    if (isSuspicious) {
      await sendDiscordAlert(ip, userAgent, triggeredReasons, flags);
      return redirectToTrain(req);
    }

  } catch (error) {
    console.error('Bot detection middleware error:', error);
    return redirectToTrain(req);
  }

  return NextResponse.next();
}

function redirectToTrain(req) {
  const trainUrl = req.nextUrl.clone();
  trainUrl.pathname = '/train';
  return NextResponse.redirect(trainUrl);
}

async function sendDiscordAlert(ip, userAgent, reasons, flags) {
  const isp = flags?.isp || 'Unknown';
  const asn = flags?.asn || 'Unknown';

  const embed = {
    title: "🚨 Bot Blocked",
    color: 15158332, // Red color
    timestamp: new Date().toISOString(),
    fields: [
      {
        name: "🔍 IP Address",
        value: `\`${ip}\``,
        inline: true
      },
      {
        name: "🏢 ISP",
        value: isp,
        inline: true
      },
      {
        name: "🏷️ ASN",
        value: `\`${asn}\``,
        inline: true
      },
      {
        name: "🧠 Reason(s)",
        value: reasons.join(', '),
        inline: false
      },
      {
        name: "🕵️‍♂️ User-Agent",
        value: `\`\`\`${userAgent.substring(0, 1000)}\`\`\``,
        inline: false
      }
    ],
    footer: {
      text: "Bot Detection System",
      icon_url: "https://i.imgur.com/4M34hi2.png"
    }
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: "Bot Blocker",
        avatar_url: "https://i.imgur.com/4M34hi2.png",
        embeds: [embed]
      }),
    });
  } catch (discordError) {
    console.error('Discord webhook alert failed:', discordError.message);
  }
}

export const config = {
  matcher: ['/((?!train|_next/static|_next/image|favicon.ico|api/).*)'],
};
