import firebaseCert from "../config/firebaseCert";
import admin from 'firebase-admin';

export const initialiseDB = () => {
    try {
        return admin.firestore()
    } catch {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseCert),
            databaseURL: 'https://tucmc.firebaseio.com'
        })
        return admin.firestore()
    }
}
