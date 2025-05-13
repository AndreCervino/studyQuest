import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3fNjyHPL-oNyBSrZk5x_PvbcsMXGJd0Y",
  authDomain: "studyquest-4952e.firebaseapp.com",
  projectId: "studyquest-4952e",
  storageBucket: "studyquest-4952e.appspot.com",
  messagingSenderId: "727758275778",
  appId: "1:727758275778:web:c6f7b99a6cfc5abdd8675b",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

