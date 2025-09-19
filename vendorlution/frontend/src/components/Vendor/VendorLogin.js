import { useState } from "react";

// Mock vendor store (would normally come from backend)
const mockVendors = [
  { username: "vendor@shop.com", password: "Vendor123!" },
];

function VendorLogin() {
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (locked) {
      setError("Too many failed attempts. Account locked.");
      return;
    }

    if (!validatePassword(pwd)) {
      setError("Password must be at least 8 characters, include uppercase, lowercase, and a number.");
      return;
    }

    const vendor = mockVendors.find(
      (v) => v.username === username && v.password === pwd
    );

    if (vendor) {
      setError("");
      alert("✅ Vendor login successful!");
      window.location.href = "/vendor/dashboard";
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 5) {
        setLocked(true);
        setError("Too many failed attempts. Account locked.");
      } else {
        setError("❌ Invalid vendor credentials.");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Vendor Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={locked}>
          {locked ? "Locked" : "Login"}
        </button>
      </form>
    </div>
  );
}

export default VendorLogin;

