// Firebase konfiguratsiyasi
// O'ZINGIZNING FIREBASE MA'LUMOTLARINGIZNI KIRITING!
const firebaseConfig = {
    apiKey: "AIzaSyDEFAULT_CHANGE_THIS",  // <-- O'ZGARTIRING
    authDomain: "your-project.firebaseapp.com",  // <-- O'ZGARTIRING
    projectId: "your-project-id",  // <-- O'ZGARTIRING
    storageBucket: "your-project.appspot.com",  // <-- O'ZGARTIRING
    messagingSenderId: "123456789",  // <-- O'ZGARTIRING
    appId: "1:123456789:web:abcdef"  // <-- O'ZGARTIRING
};

// Firebase ni ishga tushirish
firebase.initializeApp(firebaseConfig);

// Firestore va Auth ni olish
const db = firebase.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Admin email ro'yxati (o'z emailingizni yozing)
const ADMIN_EMAILS = ["sizning_email@gmail.com"];  // <-- O'ZGARTIRING