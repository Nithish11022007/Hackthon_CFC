import { createContext, useContext, useEffect, useState } from "react";
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser || null);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    /**
     * Sign in with Google popup.
     * Returns { success: true } or { success: false, code: string, message: string }
     * so the caller can display inline errors instead of alert().
     */
    async function loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const signedInUser = result.user;

            // Domain check
            if (!signedInUser.email.endsWith("@srmap.edu.in")) {
                await firebaseSignOut(auth);
                return {
                    success: false,
                    code: "domain-restricted",
                    message: "Only @srmap.edu.in emails are allowed. Please use your SRM AP account.",
                };
            }

            // Save / merge user profile to Firestore
            await setDoc(doc(db, "users", signedInUser.uid), {
                uid: signedInUser.uid,
                email: signedInUser.email,
                displayName: signedInUser.displayName,
                photoURL: signedInUser.photoURL,
                lastSeen: serverTimestamp(),
            }, { merge: true });

            return { success: true };
        } catch (error) {
            // User closed popup — don't treat as an error
            if (error.code === "auth/popup-closed-by-user") {
                return { success: false, code: "cancelled", message: "" };
            }
            return {
                success: false,
                code: error.code || "unknown",
                message: error.message || "Something went wrong. Please try again.",
            };
        }
    }

    async function logout() {
        await firebaseSignOut(auth);
    }

    const value = { user, loading, loginWithGoogle, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}