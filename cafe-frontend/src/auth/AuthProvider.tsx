// src/auth/AuthProvider.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { Box, CircularProgress, Typography } from '@mui/material'; // Thêm Typography

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
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Mặc định là true khi khởi tạo

  const fetchProfile = async (userId: string) => {
    // console.log("Fetching profile for user:", userId);
    const { data, error } = await supabase.from('profiles').select('id, role, display_name, points').eq('id', userId).single();
    if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null); // Đảm bảo profile là null nếu có lỗi
    } else {
        setProfile(data as Profile | null);
    }
  };
  
  const refreshProfile = async () => {
    if (user) {
      // console.log("Refreshing profile for user:", user.id);
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      // console.log("Auth state changed:", event, currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setProfile(null); // Reset profile khi thay đổi session
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      }
      setLoading(false); // Đã có thông tin session ban đầu, tắt loading
    };

    // Lấy session ban đầu
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        await handleAuthStateChange('INITIAL_LOAD', session); // Gọi hàm xử lý state
    });

    // Lắng nghe sự thay đổi trạng thái đăng nhập
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Chỉ chạy một lần khi component mount

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { user, profile, session, loading, signOut, refreshProfile };

  // HIỂN THỊ TRẠNG THÁI TẢI HOẶC HIỂN THỊ CHILDREN
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};