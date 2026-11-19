// Firebase connection + Firestore guestbook.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
    getFirestore, collection, addDoc, onSnapshot, query, orderBy,
    serverTimestamp, limit
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCvxqK9jyme_KnBRs2Zziw5ov-ezSSm9bY",
    authDomain: "tan-trang-wedding.firebaseapp.com",
    projectId: "tan-trang-wedding",
    storageBucket: "tan-trang-wedding.firebasestorage.app",
    messagingSenderId: "125347013478",
    appId: "1:125347013478:web:4b4e4905fd899c67051ea7",
    measurementId: "G-P9VKYKWWVD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const wishesCollection = collection(db, "wishes");

window.firebaseReady = Promise.resolve({
    addWish({ name, attend, message }) {
        return addDoc(wishesCollection, {
            name, attend, message, createdAt: serverTimestamp()
        });
    },

    listenToWishes(callback) {
        const wishesQuery = query(
            wishesCollection,
            orderBy("createdAt", "desc"),
            limit(100)
        );

        return onSnapshot(wishesQuery, (snapshot) => {
            callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Firestore listener error:", error);
        });
    }
});

console.log("Firebase connected; Firestore guestbook is ready.");
