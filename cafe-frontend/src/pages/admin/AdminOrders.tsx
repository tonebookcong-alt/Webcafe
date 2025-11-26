// src/pages/admin/AdminOrders.tsx

import * as React from "react";
import {
  Box, Typography, TextField, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Stack, Button, Tooltip, IconButton
} from "@mui/material";
import OrderDetailsDialog from "@/components/orders/OrderDetailsDialog";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type Order = {
  id: string;
  total: number;
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled" | "paid";
  created_at: string;
  paid_at?: string | null;
};

const backend = import.meta.env.VITE_BACKEND_URL;

export default function AdminOrders() {
  const [rows, setRows] = React.useState<Order[]>([]);
  const [q, setQ] = React.useState("");

  const [openDetails, setOpenDetails] = React.useState(false);
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);

  const handleRowClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setOpenDetails(true);
  };

  const load = React.useCallback(() => {
    fetch(`${backend}/orders`).then(r => (r.ok ? r.json() : [])).then(setRows).catch(() => setRows([]));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: Order['status']) => {
    await fetch(`${backend}/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const renderActions = (order: Order) => {
    switch (order.status) {
      case "pending":
        return <Button size="small" variant="contained" color="primary" onClick={() => updateStatus(order.id, "confirmed")}>Xác nhận</Button>;
      case "confirmed":
        return <Button size="small" variant="contained" color="info" onClick={() => updateStatus(order.id, "shipping")}>Bắt đầu giao</Button>;
      case "shipping":
        return <Button size="small" variant="contained" color="success" onClick={() => updateStatus(order.id, "delivered")}>Đã giao</Button>;
      default:
        return null;
    }
  };

  const renderStatusChip = (status: Order['status']) => {
    const colors: Record<Order['status'], "warning" | "info" | "primary" | "success" | "default"> = {
      pending: "warning", confirmed: "info", shipping: "primary", delivered: "success", paid: "success", cancelled: "default"
    };
    const labels: Record<Order['status'], string> = {
      pending: "Chờ xác nhận", confirmed: "Đang chuẩn bị", shipping: "Đang giao", delivered: "Đã giao", paid: "Đã thanh toán", cancelled: "Đã hủy"
    };
    return <Chip size="small" color={colors[status] || 'default'} label={labels[status] || status} />;
  };

  const filtered = (rows || []).filter(r => {
    const s = `${r.id} ${r.total} ${r.status}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <>
      <Box>
        <Typography variant="h5" fontWeight={800} gutterBottom>Đơn hàng</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Tìm nhanh theo mã / tổng tiền / trạng thái…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ width: 420 }}
          />
          <Button variant="outlined" onClick={load}>Làm mới</Button>
        </Stack>
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã</TableCell>
                <TableCell>Tạo lúc</TableCell>
                <TableCell align="right">Tổng</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(r.id)}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Tooltip title={r.id} arrow>
                        <Typography variant="body2">#{r.id.slice(0, 8)}</Typography>
                      </Tooltip>
                      <Tooltip title="Copy ID đầy đủ" arrow>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(r.id); }}>
                          <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleString("vi-VN")}</TableCell>
                  <TableCell align="right">{r.total.toLocaleString("vi-VN")} đ</TableCell>
                  <TableCell>{renderStatusChip(r.status)}</TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    {renderActions(r)}
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length && <TableRow><TableCell colSpan={6} align="center">Không có dữ liệu</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      
      <OrderDetailsDialog orderId={selectedOrderId} open={openDetails} onClose={() => setOpenDetails(false)} />
    </>
  );
}