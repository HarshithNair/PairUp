import { 
  getFirestore, doc, setDoc, updateDoc, collection, getDocs,
  addDoc, query, where, orderBy, onSnapshot, serverTimestamp, limit
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./config.js";

console.log("Database module loaded");

export { 
  db, doc, setDoc, updateDoc, collection, getDocs,
  addDoc, query, where, orderBy, onSnapshot, serverTimestamp, limit
};
