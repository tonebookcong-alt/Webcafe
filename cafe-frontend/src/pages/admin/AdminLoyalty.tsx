// src/pages/admin/AdminLoyalty.tsx

import * as React from "react";
import { 
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, 
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack 
} from "@mui/material";

type Customer = { id: string; email: string; display_name: string | null; points: number; };
const backend = import.meta.env.VITE_BACKEND_URL;

export default function AdminLoyalty() {
  const [rows, setRows] = React.useState<Customer[]>([]);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Customer | null>(null);
  const [form, setForm] = React.useState({ points: 0, reason: '' });

  const load = React.useCallback(() => {
    fetch(`${backend}/admin/loyalty`).then(r => r.json()).then(setRows).catch(() => setRows([]));
  }, []);

  React.useEffect(() => { load(); }, [load]);
  
  const openDialog = (customer: Customer) => {
    setSelected(customer);
    setForm({ points: 0, reason: '' });
    setOpen(true);
  };
  
  const handleAdjust = async () => {
    if (!selected || form.points === 0) return;
    await fetch(`${backend}/admin/loyalty/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: selected.id, points: form.points, reason: form.reason })
    });
    setOpen(false);
    load();
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Quản lý Tích điểm</Typography>
      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Khách hàng</TableCell>
              <TableCell align="right">Điểm hiện tại</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} hover>
                <TableCell>
                  <Typography fontWeight="bold">{r.display_name || 'Chưa có tên'}</Typography>
                  <Typography variant="body2" color="text.secondary">{r.email}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem' }}>{r.points}</TableCell>
                <TableCell align="center">
                  <Button variant="outlined" size="small" onClick={() => openDialog(r)}>Điều chỉnh</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Điều chỉnh điểm cho: {selected?.email}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography>Điểm hiện tại: <b>{selected?.points}</b></Typography>
            <TextField
              autoFocus
              type="number"
              label="Số điểm cần thay đổi (dùng số âm để trừ)"
              value={form.points}
              onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
            />
            <TextField
              label="Lý do thay đổi"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleAdjust}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}