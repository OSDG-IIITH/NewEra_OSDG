import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_PROPOSALS_WEBAPP_URL;

export async function POST(request: Request) {
  if (!GOOGLE_SCRIPT_URL) {
    return NextResponse.json({ error: 'Server misconfigured: Missing Apps Script URL' }, { status: 500 });
  }

  try {
    const body = await request.json();

    // Forward the request to Google Apps Script
    // We use method: 'POST' and Content-Type: 'application/json'
    // The Apps Script must handle JSON payload in doPost(e)
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // Important: Google Apps Script returns 302 to the content. 
      // Node's fetch follows redirects by default.
    });

    // Check if the request itself failed (e.g. 404 or 500 from Google)
    if (!response.ok) {
      return NextResponse.json({ error: `Upstream error: ${response.statusText}` }, { status: response.status });
    }

    // Attempt to parse the final JSON response from the script
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
