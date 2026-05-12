"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  role: "admin" | "developer" | null;
  userData: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, role: null, userData: null, loading: true,
});

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
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          let data: any;

          if (docSnap.exists() && docSnap.data()?.role) {
            // ✅ Dokumen ada dan punya role — gunakan data yang ada
            data = docSnap.data();
          } else {
            // 🔧 Dokumen tidak ada / terhapus — buat ulang otomatis
            data = {
              uid: currentUser.uid,
              name: currentUser.displayName || "User",
              email: currentUser.email || "",
              photoURL: currentUser.photoURL || "",
              role: "developer",        // Default role baru
              progress: 0,
              status: "Active",
              completedTasks: [],
              currentProjectId: null,
              createdAt: serverTimestamp(),
              lastUpdated: serverTimestamp(),
            };
            await setDoc(docRef, data, { merge: true });
            console.log("✅ User document restored for:", currentUser.email);
          }

          setRole(data.role);
          setUserData(data);

          // ── Smart Redirect setelah login ───────────────────────────────────
          // Hanya redirect kalau user sedang di halaman publik (landing/login)
          const isOnPublicPage =
            pathname === "/" || pathname === "/login";

          // Jangan redirect kalau URL sudah ada projectId (misal dari join page)
          const alreadyHasProject =
            typeof window !== "undefined" &&
            window.location.search.includes("projectId");

          if (isOnPublicPage && !alreadyHasProject) {
            const projectId = data?.currentProjectId;

            if (projectId) {
              // User sudah punya project → redirect ke dashboard
              // Role menentukan view (admin panel vs developer checklist)
              router.push(`/dashboard?projectId=${projectId}`);
            }
            // Kalau belum punya project → tetap di landing page, biarkan user create/join
          }
        } catch (e) {
          console.error("Auth sync error:", e);
          // Fallback agar tidak stuck di loading
          setRole("developer");
          setUserData({
            name: currentUser.displayName,
            email: currentUser.email,
            role: "developer",
          });
        }
      } else {
        // User logout
        setUser(null);
        setRole(null);
        setUserData(null);

        // Whitelist public routes — jangan redirect kalau sudah di sini
        const publicRoutes = ["/login", "/", "/join"];
        const isPublicRoute = publicRoutes.some(
          (route) =>
            pathname === route || pathname.startsWith("/join/")
        );

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
