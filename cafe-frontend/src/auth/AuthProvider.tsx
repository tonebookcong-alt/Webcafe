// src/auth/AuthProvider.tsx - PHIÊN BẢN CÓ LOG VÀ SAFETY TIMEOUT

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { Box, CircularProgress, Typography } from '@mui/material';

type Profile = {
    id: string;
    role: "admin" | "staff" | "customer";
    display_name?: string;
    points?: number;
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ data: { user: User | null; session: Session | null; }; error: AuthError | null; }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ data: { user: User | null; session: Session | null; }; error: AuthError | null; }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ THÊM: Cache để tránh gọi API lặp lại
  const profileCacheRef = useRef<Map<string, { data: Profile | null; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

  const fetchProfile = async (userId: string, skipCache = false) => {
    try {
      // ✅ KIỂM TRA CACHE
      if (!skipCache && profileCacheRef.current.has(userId)) {
        const cached = profileCacheRef.current.get(userId)!;
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log("AuthProvider: Sử dụng profile từ cache");
          setProfile(cached.data);
          return;
        }
      }

      console.log("AuthProvider: Fetching profile for:", userId);
      
      // ✅ THÊM: Gọi backend API thay vì Supabase trực tiếp
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/profiles/${userId}`);
      
      if (!response.ok) {
        console.error("Error fetching profile:", response.status);
        setProfile(null);
        return;
      }
      
      const data = await response.json();
      
      // ✅ LƯU VÀO CACHE
      profileCacheRef.current.set(userId, { data: data as Profile, timestamp: Date.now() });
      setProfile(data as Profile | null);
      
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      setProfile(null);
    }
  };
  
  const refreshProfile = async () => {
    if (user) {
      // ✅ BUỘC LẤY LẠI (BỎ QUA CACHE)
      await fetchProfile(user.id, true);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("AuthProvider: Bắt đầu khởi tạo...");

    const safetyTimer = setTimeout(() => {
        if (mounted && loading) {
            console.warn("AuthProvider: Quá thời gian chờ (5s). Bắt buộc tắt loading.");
            setLoading(false);
        }
    }, 5000);

    const initializeSession = async () => {
      console.log("AuthProvider: Đang gọi getSession()...");
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        console.log("AuthProvider: getSession() hoàn tất.", { cóSession: !!initialSession, lỗi: error });

        if (error) throw error;

        if (mounted) {
          if (initialSession?.user) {
            console.log("AuthProvider: Tìm thấy session cũ, đang khôi phục...");
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(initialSession.user.id);
          } else {
            console.log("AuthProvider: Không có session cũ.");
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error("AuthProvider: Lỗi nghiêm trọng khi khởi tạo:", err);
      } finally {
        clearTimeout(safetyTimer);
        if (mounted) {
          console.log("AuthProvider: Hoàn tất khởi tạo. Tắt loading.");
          setLoading(false);
        }
      }
    };

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);
      
      // ✅ CHỈ XỬ LÝ NHỮNG SỰ KIỆN CẦN THIẾT
      if (event === 'SIGNED_IN') {
        if (mounted && newSession?.user) {
          console.log("AuthProvider: User signed in");
          setSession(newSession);
          setUser(newSession.user);
          await fetchProfile(newSession.user.id, true); // Buộc lấy lại
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          console.log("AuthProvider: User signed out");
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // ✅ CHỈ CẬP NHẬT SESSION, KHÔNG LẤY LẠI PROFILE
        if (mounted) {
          console.log("AuthProvider: Token refreshed");
          setSession(newSession);
          setLoading(false);
        }
      }
    });

    return () => {
      console.log("AuthProvider: Unmounting...");
      mounted = false;
      clearTimeout(safetyTimer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUpWithEmail = (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  };

  const signOut = async () => {
    // ✅ XÓA CACHE KHI SIGN OUT
    profileCacheRef.current.clear();
    await supabase.auth.signOut();
  };

  const value = { user, profile, session, loading, signInWithEmail, signUpWithEmail, signOut, refreshProfile };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Đang tải...</Typography>
        <Typography variant="caption" sx={{ mt: 1, color: 'gray' }}>Đang kết nối đến máy chủ...</Typography>
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};