import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Signup() {
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

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/notes");
    } catch (error) {
      setError(error.message);
    }
  };

  const navigateToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="px-10 py-2 rounded-md border-none">
      <h1 style={{ textAlign: "center"}}>Short Notes</h1>
      <p style={{ textAlign: "center"}}>Welcome to your short notes application! Start your note creation, editing, deleting and updating here!</p>
      <h1 style={{ textAlign: "center" }}>Sign Up</h1>
      {error && <p style={{ color: "black" }}>{error}</p>}
      <form
        onSubmit={handleSignup}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-10 py-2 rounded-md"
        />
        <button type="submit" className="px-10 py-2 rounded-md border-none">
          Sign Up
        </button>
      </form>
      <p style={{ textAlign: "center"}} className="mt-20">
        Already have an account?{" "}
        <button onClick={navigateToLogin} className="bg-transparent border-none cursor-pointer">
          Login
        </button>
      </p>
    </div>
  );
}