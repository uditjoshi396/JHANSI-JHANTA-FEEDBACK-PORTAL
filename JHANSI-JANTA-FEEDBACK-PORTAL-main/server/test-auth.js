(async function run() {
  try {
    const base = "http://localhost:5000/api/auth";
    const email = `test.user+ci.${Date.now()}@local.test`;
    const password = "P@ssw0rd123!";

    console.log("Registering", email);
    let res = await fetch(`${base}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email,
        password,
        role: "citizen",
      }),
    });

    const regBody = await res.json().catch(() => ({}));
    console.log("Register response:", res.status, regBody);

    console.log("Logging in");
    res = await fetch(`${base}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const loginBody = await res.json().catch(() => ({}));
    console.log("Login response:", res.status, loginBody);
  } catch (err) {
    console.error("Request error:", err.message);
    process.exit(1);
  }
})();
