// src/pages/admin/AdminFeedback.tsx

import * as React from "react";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Stack } from "@mui/material";

type Feedback = { id: string; user_id: string; content: string; created_at: string; is_active: boolean; };
const backend = import.meta.env.VITE_BACKEND_URL;

export default function AdminFeedback() {
  const [rows, setRows] = React.useState<Feedback[]>([]);
  
  const load = React.useCallback(() => {
    fetch(`${backend}/admin/feedback`).then(r => r.json()).then(setRows).catch(() => setRows([]));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, isActive: boolean) => {
    await fetch(`${backend}/admin/feedback/${id}`, { 
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
    });
    load();
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Quản lý Phản hồi chung</Typography>
      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nội dung</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(c => (
              <TableRow key={c.id} hover>
                <TableCell sx={{ minWidth: 400 }}>{c.content}</TableCell>
                <TableCell sx={{ minWidth: 160 }}>{new Date(c.created_at).toLocaleString('vi-VN')}</TableCell>
                <TableCell>
                  <Chip size="small" label={c.is_active ? "Đã duyệt" : "Chờ duyệt"} color={c.is_active ? "success" : "default"} />
                </TableCell>
                <TableCell align="center" sx={{ minWidth: 200 }}>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {!c.is_active && (
                      <Button size="small" color="success" variant="outlined" onClick={() => updateStatus(c.id, true)}>Duyệt</Button>
                    )}
                    {c.is_active && (
                      <Button size="small" color="warning" variant="outlined" onClick={() => updateStatus(c.id, false)}>Ẩn</Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={4} align="center">Không có dữ liệu</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}