(async function run() {
  try {
    const base = process.env.AUTH_BASE_URL || "http://localhost:5000/api/auth";
    const email = process.env.RESET_EMAIL;
    const password = process.env.RESET_PASSWORD || "P@ssw0rd123!";
    const newPassword = process.env.RESET_NEW_PASSWORD || "N3wP@ssw0rd123!";

    if (!email) {
      console.error("Set RESET_EMAIL to a real inbox to run this test.");
      process.exit(1);
    }

    console.log("Ensuring account exists for", email);
    let res = await fetch(`${base}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Reset Test User",
        email,
        password,
        role: "citizen",
      }),
    });

    let body = await res.json().catch(() => ({}));
    if (res.status === 409) {
      console.log("Account already exists, continuing.");
    } else {
      console.log("Register response:", res.status, body);
    }

    console.log("Requesting reset code...");
    res = await fetch(`${base}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    body = await res.json().catch(() => ({}));
    console.log("Forgot response:", res.status, body);

    const code = process.env.RESET_CODE;
    if (!code) {
      console.log("Set RESET_CODE from the email, then rerun to verify and reset.");
      return;
    }

    console.log("Verifying code...");
    res = await fetch(`${base}/verify-reset-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    body = await res.json().catch(() => ({}));
    console.log("Verify response:", res.status, body);
    if (!res.ok) return;

    console.log("Resetting password...");
    res = await fetch(`${base}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password: newPassword }),
    });
    body = await res.json().catch(() => ({}));
    console.log("Reset response:", res.status, body);
  } catch (err) {
    console.error("Request error:", err.message);
    process.exit(1);
  }
})();
