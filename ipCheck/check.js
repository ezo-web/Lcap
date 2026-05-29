const server = Bun.serve({
  port: 3004,
  async fetch(req, server) {
    const ipAddress = server.requestIP(req);
    
    // Ensure we actually caught an IP address before proceeding
    const clientIP = ipAddress?.address;
    if (!clientIP) {
      return new Response("Could not determine client IP", { status: 400 });
    }
    console.log(clientIP)

    try {
      // Pass clientIP as an argument to the Python script
      const proc = Bun.spawn(["python3", "ipCheck/1.py"], {
        env: { ...process.env, TARGET_IP: clientIP }
      });

      const output = await new Response(proc.stdout).text();
      await proc.exited;

      return new Response(JSON.stringify({ 
        success: true, 
        pythonOutput: output.trim() 
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
});

console.log(`Server running at http://localhost:${server.port}`);