const firebaseConfig = {
    apiKey: "AIzaSyA-YmqflIAZgiouEScOrZQsTdZT4teek6c",
    authDomain: "safemediaofficial-d25fa.firebaseapp.com",
    projectId: "safemediaofficial-d25fa",
    storageBucket: "safemediaofficial-d25fa.firebasestorage.app",
    messagingSenderId: "769260134268",
    appId: "1:769260134268:web:ebd92285f374fd489e8ef9"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const storage = firebase.storage(); // profil surati uchun
const ADMIN_EMAILS = ["ilmyolida77@gmail.com", "safemediaosupport@gmail.com"];