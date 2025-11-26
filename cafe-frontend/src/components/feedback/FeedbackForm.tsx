// src/components/feedback/FeedbackForm.tsx

import * as React from "react";
import { Box, TextField, Button, Stack, Alert, Typography } from "@mui/material";
import { useAuth } from "@/auth/AuthProvider";

const backend = import.meta.env.VITE_BACKEND_URL;

export default function FeedbackForm({ onPostSuccess }: { onPostSuccess: () => void }) {
  const { session } = useAuth();
  const [content, setContent] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  if (!session) {
    return <Typography sx={{ my: 2 }}>Vui lòng <a href="/login">đăng nhập</a> để để lại lời nhắn.</Typography>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(false);

    const token = session.access_token;
    const res = await fetch(`${backend}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content })
    });

    if (res.ok) {
      setContent("");
      setSuccess(true);
      onPostSuccess();
    } else {
      setError("Gửi lời nhắn thất bại. Vui lòng thử lại.");
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
      <Stack spacing={2}>
        <TextField label="Để lại lời nhắn cho Serenite Café..." multiline rows={3} value={content} onChange={(e) => setContent(e.target.value)} fullWidth />
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Cảm ơn bạn đã gửi lời nhắn! Lời nhắn của bạn sẽ được hiển thị sau khi quản trị viên xét duyệt.</Alert>}
        <Button type="submit" variant="contained" disabled={loading || !content.trim()}>
          {loading ? 'Đang gửi...' : 'Gửi lời nhắn'}
        </Button>
      </Stack>
    </Box>
  );
}