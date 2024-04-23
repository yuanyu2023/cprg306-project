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
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

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

  const deleteNote = async (id) => {
    await deleteDoc(doc(db, "notes", id));
    setNotes(notes.filter((note) => note.id !== id));
  };

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
    <div className="px-20 max-w-800 mx-auto">
      <h1 style={{ textAlign: "center" }}>
        Short Notes
      </h1>
      <button onClick={handleLogout} className="pl-8">
        Log out
      </button>
      <div className='mb-20'>
        <input
          type="text"
          placeholder="Write a new short note"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className='mr-10'
        />
        <button onClick={addNote} className="p-4">
          Add Notes
        </button>
      </div>
      <div className="grid grid-cols-3 gap-20">
        {notes.map((note) => (
          <div key={note.id} className="rounded-lg p-15 shadow-md">
            {note.isEditing ? (
              <input
                type="text"
                value={note.text}
                onChange={(e) => handleEditChange(e, note.id)}
                className="w-full mb-10"
              />
            ) : (
              <p>{note.text}</p>
            )}
            {note.isEditing ? (
              <button onClick={() => submitEdit(note.id)}>
                Done
              </button>
            ) : (
              <button onClick={() => setEditing(note.id)} className="mr-10">
                Edit
              </button>
            )}
            <button onClick={() => setEditing(note.id)} className="mt-10">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAuth(ShortNotes);