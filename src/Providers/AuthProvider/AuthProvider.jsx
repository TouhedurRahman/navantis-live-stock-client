import {
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile
} from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import app from "../../Firebase/firebase.config";

export const AuthContext = createContext(null);

const auth = getAuth(app);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Google provider
    const googleProvider = new GoogleAuthProvider();

    const createUser = async (email, password) => {
        setLoading(true);
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            // Send verification email
            sendEmailVerification(result.user)
                .then(() => {
                    console.log('Verification email sent to:', email);
                })
                .catch(error => {
                    console.error('Error sending verification email:', error);
                });
            return result;
        } finally {
            setLoading(false);
        }
    }

    const logIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    }

    const googleLogIn = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    }

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            if (currentUser?.emailVerified) {
                setUser(currentUser);
                // console.log('Current user: ', currentUser.email);
            } else if (currentUser) {
                setUser(currentUser);
            }
            setLoading(false);
        });
        return () => {
            unsubscribe();
        }
    }, []);

    const updateUserProfile = (userInfo) => {
        updateProfile(auth.currentUser, userInfo);
    };

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }

    const authInfo = {
        user,
        loading,
        createUser,
        logIn,
        googleLogIn,
        updateUserProfile,
        resetPassword,
        logOut
    }

    return (
        <AuthContext.Provider value={authInfo}>
            {
                children
            }
        </AuthContext.Provider>
    );
};

export default AuthProvider;