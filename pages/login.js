import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/notes");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/notes");
    } catch (error) {
      setError(error.message);
    }
  };

  const navigateToSignup = () => {
    router.push("/signup");
  };

  return (
    <div className="rounded-md border-none">
      <h1 style={{ textAlign: "center" }}>Short Notes</h1>
      <p style={{ textAlign: "center"}}>Welcome to your short notes application! Start your note creation, editing, deleting and updating here!</p>
      <h1 style={{ textAlign: "center" }}>Login</h1>
      {error && <p className="text-black">{error}</p>}
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md"
        />
        <button type="submit" className="rounded-md border-none">
          Log In
        </button>
      </form>
      <p style={{ textAlign: "center"}}>
        Do not have an account?{" "}
        <button onClick={navigateToSignup} className="bg-transparent border-none cursor-pointer">
          Sign Up
        </button>
      </p>
    </div>
  );
}