import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBu_nTtUzjTf1K_1P0yF6_KBa7pX_r7d74",
  authDomain: "idmachine.firebaseapp.com",
  databaseURL: "https://idmachine-default-rtdb.firebaseio.com",
  projectId: "idmachine",
  storageBucket: "idmachine.appspot.com",
  messagingSenderId: "528831135229",
  appId: "1:528831135229:web:4c6d48048874d746616d94"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const auth = getAuth(app); 