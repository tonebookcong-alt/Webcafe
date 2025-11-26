import * as React from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Stack, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";

type Product = { id: string; name: string; price: number; is_active: boolean; created_at?: string; };

const backend = import.meta.env.VITE_BACKEND_URL;

export default function AdminProducts() {
  const [rows, setRows] = React.useState<Product[]>([]);
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<Partial<Product>>({ name: "", price: 0, is_active: true });

  const load = React.useCallback(() => {
    fetch(`${backend}/products`)
      .then(r => r.json())
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const save = async () => {
    await fetch(`${backend}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setOpen(false); setForm({ name: "", price: 0, is_active: true });
    load();
  };

  const filtered = rows.filter(r => `${r.name} ${r.id}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Sản phẩm</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField size="small" placeholder="Tìm theo tên / id…" value={q} onChange={(e)=>setQ(e.target.value)} />
        <Button variant="contained" onClick={() => setOpen(true)}>Thêm mới</Button>
        <Button variant="outlined" onClick={load}>Làm mới</Button>
      </Stack>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tên</TableCell>
              <TableCell align="right">Giá</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id} hover>
                <TableCell>{p.name}</TableCell>
                <TableCell align="right">{p.price.toLocaleString("vi-VN")} đ</TableCell>
                <TableCell>
                  <Chip size="small" color={p.is_active ? "success" : "default"} label={p.is_active ? "active" : "inactive"} />
                </TableCell>
                <TableCell>{p.created_at ? new Date(p.created_at).toLocaleString("vi-VN") : "-"}</TableCell>
              </TableRow>
            ))}
            {!filtered.length && <TableRow><TableCell colSpan={4} align="center">Không có dữ liệu</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm sản phẩm</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Tên" value={form.name || ""} onChange={(e)=>setForm({...form, name: e.target.value})} />
            <TextField label="Giá" type="number" value={form.price ?? 0} onChange={(e)=>setForm({...form, price: Number(e.target.value)})} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={save}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
