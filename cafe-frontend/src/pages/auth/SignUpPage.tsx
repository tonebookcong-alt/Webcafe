import * as React from "react";
import { supabase } from "@/lib/supabaseClient";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container, Box, Typography, TextField, Button, Stack, Alert, Link
} from "@mui/material";

export default function SignUpPage() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" fontWeight={700}>
          Tạo tài khoản
        </Typography>
        <Box component="form" onSubmit={handleSignUp} sx={{ mt: 3, width: '100%' }}>
          {success ? (
            <Alert severity="success">
              Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản trước khi đăng nhập.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                required fullWidth
                id="email" label="Địa chỉ Email"
                name="email" type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                required fullWidth
                name="password" label="Mật khẩu"
                type="password" id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                required fullWidth
                name="confirmPassword" label="Xác nhận Mật khẩu"
                type="password" id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="submit" fullWidth
                variant="contained"
                disabled={loading}
                sx={{ py: 1.5, mt: 2 }}
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </Stack>
          )}
          <Box textAlign="center" sx={{ mt: 2 }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Đã có tài khoản? Đăng nhập
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}