"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  role: "admin" | "developer" | null;
  userData: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, userData: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "developer" | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // 🌊 SYNC: Ensure state is atomic
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data?.role || "developer");
            setUserData(data);
          }
        } catch (e) {
          console.error("Auth sync error:", e);
        }
      } else {
        setUser(null);
        setRole(null);
        setUserData(null);
        
        // Whitelist public routes
        const publicRoutes = ["/login", "/", "/join"];
        const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith("/join/"));

        if (!isPublicRoute) {
          router.push("/login");
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, role, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
