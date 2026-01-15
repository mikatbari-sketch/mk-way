import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBR1_l0LIMT4E6oY3TBZscdmIeT1sLsi-g",
  authDomain: "mk-way.firebaseapp.com",
  projectId: "mk-way",
  storageBucket: "mk-way.firebasestorage.app",
  messagingSenderId: "712963182379",
  appId: "1:712963182379:web:29403a038b63608c803f6e",
  measurementId: "G-C7LLSMG7WH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);