import { useState } from "react";

// Mock user store (would normally come from backend)
const mockCustomers = [
  { username: "customer@example.com", password: "Customer123!" }, // strong example password
];

function CustomerLogin() {
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

    const user = mockCustomers.find(
      (u) => u.username === username && u.password === pwd
    );

    if (user) {
      setError("");
      alert("✅ Customer login successful!");
      window.location.href = "/customer/dashboard"; // simulate redirect
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 5) {
        setLocked(true);
        setError("Too many failed attempts. Account locked.");
      } else {
        setError("❌ Invalid username or password.");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Customer Login</h2>
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

export default CustomerLogin;


