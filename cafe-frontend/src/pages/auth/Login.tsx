// src/pages/auth/Login.tsx

import * as React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container, Box, Typography, TextField, Button, Stack, Alert, Link, Card, CardContent
} from "@mui/material";
import { useAuth } from "@/auth/AuthProvider";
import styles from './LoginBackground.module.css'; // Import CSS cho ảnh nền

export default function Login() {
  const nav = useNavigate();
  const { signInWithEmail } = useAuth(); // Lấy hàm signIn từ context
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    // Gọi hàm signIn từ AuthProvider thay vì gọi supabase trực tiếp
    const { error } = await signInWithEmail(email, password);

    if (error) {
      setError(error.message);
    } else {
      nav("/"); // Chuyển về trang chủ sau khi đăng nhập thành công
    }
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <div className={styles.loginBackground} />
      <Card sx={{ 
        p: 3,
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,.12)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Làm mờ nhẹ card để dễ đọc hơn
        backdropFilter: 'blur(4px)'
      }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h4" fontWeight={700}>
              Đăng nhập
            </Typography>
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 3, width: '100%' }}>
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                  required fullWidth
                  id="email" label="Địa chỉ Email"
                  name="email" type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  required fullWidth
                  name="password" label="Mật khẩu"
                  type="password" id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="submit" fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ py: 1.5, mt: 2 }}
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </Stack>
              <Box textAlign="center" sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/signup" variant="body2">
                  {"Chưa có tài khoản? Đăng ký ngay"}
                </Link>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}