import React, { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";

export function LoginPage({ isRegistering, onAuthSuccess }) {
  const usernameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setPending(true);
    setError("");

    try {
      let res;

      if (isRegistering) {
        res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        });
      } else {
        res = await fetch("/api/auth/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            password,
          }),
        });
      }

      if (!res.ok) {
        if (res.status === 409) throw new Error("Username already exists");

        if (res.status === 401) throw new Error("Wrong username or password");

        throw new Error("Request failed");
      }

      const data = await res.json();

      console.log("Token:", data.token);

      onAuthSuccess(data.token);

      navigate(VALID_ROUTES.HOME);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <h2>{isRegistering ? "Register a new account" : "Login"}</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor={usernameId}>Username</label>
        <input
          id={usernameId}
          disabled={pending}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {isRegistering && (
          <>
            <label htmlFor={emailId}>Email</label>
            <input
              id={emailId}
              disabled={pending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </>
        )}

        <label htmlFor={passwordId}>Password</label>
        <input
          id={passwordId}
          type="password"
          disabled={pending}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={pending}>
          {pending ? "Submitting..." : isRegistering ? "Register" : "Login"}
        </button>
      </form>

      <div aria-live="polite">{error && <p>{error}</p>}</div>

      {isRegistering ? (
        <p>
          Already have an account?
          <Link to={VALID_ROUTES.LOGIN}> Login here</Link>
        </p>
      ) : (
        <p>
          Don't have an account?
          <Link to={VALID_ROUTES.REGISTER}> Register here</Link>
        </p>
      )}
    </>
  );
}
