import { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from "./config.js";

console.log("Auth module loaded");

export { 
  auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut 
};
