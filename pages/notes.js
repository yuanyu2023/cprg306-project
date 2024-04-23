import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection } from "firebase/firestore";
import { query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { withAuth } from "../components/withAuth";

function ShortNotes({ ...props }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        fetchNotes(user.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Fetch to-dos from Firestore based on the user's ID
  const fetchNotes = async (userId) => {
    const q = query(collection(db, "notes"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    setNotes(
      querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        isEditing: false,
      }))
    );
    console.log("notes fetched");
  };

  // Add a new to-do
  const addNote = async () => {
    if (newNote === "" || !auth.currentUser) {
      return;
    }

    const docRef = await addDoc(collection(db, "notes"), {
      text: newNote,
      userId: auth.currentUser.uid,
    });

    console.log("New note added to Firestore:", { text: newNote, id: docRef.id });

    setNotes([...notes, { text: newNote, id: docRef.id, isEditing: false }]);
    setNewNote("");
  };

  // Delete a to-do
  const deleteNote = async (id) => {
    await deleteDoc(doc(db, "notes", id));
    setNotes(notes.filter((note) => note.id !== id));
  };

  // Set a to-do item to editing mode
  const setEditing = (id) => {
    setNotes(
      notes.map((note) => {
        if (note.id === id) {
          return { ...note, isEditing: true };
        }
        return note;
      })
    );
  };

  // Handle change in the edit text field
  const handleEditChange = (e, id) => {
    setNotes(
      notes.map((note) => {
        if (note.id === id) {
          return { ...note, text: e.target.value };
        }
        return note;
      })
    );
  };

  // Submit the edited to-do
  const submitEdit = async (id) => {
    const editedNote = notes.find((note) => note.id === id);
    await updateDoc(doc(db, "notes", id), { text: editedNote.text });

    setNotes(
      notes.map((note) => {
        if (note.id === id) {
          return { ...note, isEditing: false };
        }
        return note;
      })
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--color-latte)", textAlign: "center" }}>
        Short Notes
      </h1>
      <button
        onClick={handleLogout}
        style={{
          background: "var(--color-macchiato)",
          color: "var(--color-latte)",
          margin: "10px 0",
        }}
      >
        Log out
      </button>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Write a new short note"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button
          onClick={addNote}
          style={{
            background: "var(--color-frappe)",
            color: "var(--color-latte)",
          }}
        >
          Add Notes
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        {notes.map((note) => (
          <div
            key={note.id}
            style={{
              background: "var(--color-espresso)",
              color: "var(--color-latte)",
              borderRadius: "8px",
              padding: "15px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            {note.isEditing ? (
              <input
                type="text"
                value={note.text}
                onChange={(e) => handleEditChange(e, note.id)}
                style={{ width: "100%", marginBottom: "10px" }}
              />
            ) : (
              <p>{note.text}</p>
            )}
            {note.isEditing ? (
              <button
                onClick={() => submitEdit(note.id)}
                style={{
                  background: "var(--color-macchiato)",
                  color: "var(--color-latte)",
                }}
              >
                Done
              </button>
            ) : (
              <button
                onClick={() => setEditing(note.id)}
                style={{
                  background: "var(--color-macchiato)",
                  color: "var(--color-latte)",
                  marginRight: "10px",
                }}
              >
                Edit
              </button>
            )}
            <button
              onClick={() => deleteNote(note.id)}
              style={{
                background: "var(--color-macchiato)",
                color: "var(--color-latte)",
                marginTop: "10px",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAuth(ShortNotes);