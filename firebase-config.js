// Firebase konfiguratsiyasi (sizning maʼlumotlaringiz)
const firebaseConfig = {
    apiKey: "AIzaSyA-YmqflIAZgiouEScOrZQsTdZT4teek6c",
    authDomain: "safemediaofficial-d25fa.firebaseapp.com",
    projectId: "safemediaofficial-d25fa",
    storageBucket: "safemediaofficial-d25fa.firebasestorage.app",
    messagingSenderId: "769260134268",
    appId: "1:769260134268:web:ebd92285f374fd489e8ef9",
    measurementId: "G-XRNBG7X68B"
};

// Firebase ni ishga tushirish (agar allaqachon boshlanmagan boʻlsa)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Admin email roʻyxati (oʻz emailingizni yozing)
const ADMIN_EMAILS = ["ilmyolida77@gmail.com"];