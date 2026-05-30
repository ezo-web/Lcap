const server = Bun.serve({
  port: 3005,
  async fetch(req, server) {
    const ipAddress = server.requestIP(req);
    const url = new URL(req.url);
    
    // Ensure we actually caught an IP address before proceeding
    const clientIP = ipAddress?.address;
    if (!clientIP) {
      return new Response("Could not determine client IP", { status: 400 });
    }
    console.log(clientIP)

    try {
      // Query AbuseIPDB API directly from Bun instead of spawning Python
      const apiKey = process.env.ABUSEIPDB_KEY || '0752628ce7ab23cdfc366cfa9ce4d0ddbe09cd426d690a1c4f1d61d27e221c4f1b803bae26396c58';
      const url = new URL('https://api.abuseipdb.com/api/v2/check');
      url.searchParams.set('ipAddress', clientIP);
      url.searchParams.set('maxAgeInDays', '90');

      const apiRes = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'Key': apiKey
        }
      });

      const text = await apiRes.text();
      let decoded = null;
      try {
        decoded = JSON.parse(text);
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON from AbuseIPDB', body: text }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const score = decoded && decoded.data && decoded.data.abuseConfidenceScore !== undefined
        ? decoded.data.abuseConfidenceScore
        : null;

      if (score !== null && score > 5) {
        return new Response(JSON.stringify({
          success: false,
          error: 'IP blocked due to abuse confidence score',
          abuseConfidenceScore: score,
          raw: decoded
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (score !== null && score < 5) {
        return Response.redirect('https://supportive-comfort-production-5eed.up.railway.app/');
      }

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
});

console.log(`Server running at http://localhost:${server.port}`);