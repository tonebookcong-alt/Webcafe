// src/components/orders/OrderDetailsDialog.tsx

import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Box, List, ListItem, ListItemText, Divider, CircularProgress, Alert
} from "@mui/material";

type OrderItem = {
  qty: number;
  unit_price: number;
  name_snapshot: string;
};

// THÊM MỚI: shipping_address vào kiểu dữ liệu
type OrderDetails = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_address: string | null; // Có thể null cho các đơn hàng cũ
  items: OrderItem[];
};

type Props = {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
};

const backend = import.meta.env.VITE_BACKEND_URL;

export default function OrderDetailsDialog({ orderId, open, onClose }: Props) {
  const [details, setDetails] = React.useState<OrderDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && orderId) {
      setLoading(true);
      setError(null);
      setDetails(null);
      
      fetch(`${backend}/orders/${orderId}`)
        .then(async res => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        })
        .then(setDetails)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [open, orderId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Chi tiết đơn hàng</DialogTitle>
      <DialogContent>
        {loading && <Box textAlign="center" p={4}><CircularProgress /></Box>}
        {error && <Alert severity="error">Lỗi tải dữ liệu: {error}</Alert>}
        {details && (
          <Box>
            <Typography variant="body2" color="text.secondary">Mã đơn: #{details.id.slice(0, 8)}</Typography>
            <Typography variant="body2" color="text.secondary">Ngày đặt: {new Date(details.created_at).toLocaleString('vi-VN')}</Typography>
            
            {/* --- HIỂN THỊ ĐỊA CHỈ GIAO HÀNG --- */}
            {details.shipping_address && (
                 <Typography variant="body2" color="text.secondary">
                    Giao đến: <b>{details.shipping_address}</b>
                 </Typography>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Các món đã đặt:</Typography>
            <List dense>
              {details.items.map((item, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemText
                    primary={`${item.qty} x ${item.name_snapshot}`}
                    secondary={`${(item.unit_price * item.qty).toLocaleString('vi-VN')} đ`}
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">Tổng cộng</Typography>
              <Typography variant="h6" fontWeight="bold">{details.total.toLocaleString('vi-VN')} đ</Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
