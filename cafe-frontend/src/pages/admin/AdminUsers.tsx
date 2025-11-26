import * as React from "react";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip } from "@mui/material";

type Row = { id:string; email:string; created_at:string; last_sign_in_at?:string; role:string; display_name?:string|null; };
const backend = import.meta.env.VITE_BACKEND_URL;

export default function AdminUsers(){
  const [rows,setRows] = React.useState<Row[]>([]);
  React.useEffect(()=>{
    fetch(`${backend}/admin/users`).then(r=>r.json()).then(setRows).catch(()=>setRows([]));
  },[]);
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Người dùng</Typography>
      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Tên hiển thị</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Đăng ký</TableCell>
              <TableCell>Đăng nhập gần nhất</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(u=>(
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.display_name || "-"}</TableCell>
                <TableCell><Chip size="small" label={u.role}/></TableCell>
                <TableCell>{new Date(u.created_at).toLocaleString("vi-VN")}</TableCell>
                <TableCell>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("vi-VN") : "-"}</TableCell>
              </TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={5} align="center">Không có dữ liệu</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
