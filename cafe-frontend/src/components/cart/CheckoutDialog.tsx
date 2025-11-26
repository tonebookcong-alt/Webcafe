// src/components/cart/CheckoutDialog.tsx - PHIÊN BẢN ĐÃ SỬA LỖI

import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, RadioGroup,
  FormControlLabel, Radio, Typography, Box, Alert
} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useCart } from "@/lib/cart/CartContext";
import { useAuth } from "@/auth/AuthProvider";
import { useNavigate } from "react-router-dom"; // Import useNavigate

type Props = {
  open: boolean;
  onClose: () => void;
};

const backend = import.meta.env.VITE_BACKEND_URL;

export default function CheckoutDialog({ open, onClose }: Props) {
  // SỬA LỖI Ở ĐÂY: Dùng đúng tên từ Context
  const { cartItems, calculateTotal, clearCart } = useCart(); 
  const { session } = useAuth();
  const navigate = useNavigate();

  // TÍNH TOÁN LẠI: Gọi hàm để lấy giá trị
  const totalPrice = calculateTotal(); 

  const [method, setMethod] = React.useState("cod");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Reset trạng thái khi dialog được mở lại
    if (open) {
      setStatus("idle");
      setError(null);
    }
  }, [open]);

  const handleCheckout = async () => {
    if (!session?.user) {
      alert("Bạn cần đăng nhập để đặt hàng.");
      onClose();
      navigate('/login');
      return;
    }

    setStatus("loading");
    setError(null);

    const payload = {
      items: cartItems.map(it => ({ product_id: it.id, qty: it.quantity })),
      total: totalPrice,
      user_id: session.user.id,
    };

    try {
      const res = await fetch(`${backend}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Tạo đơn hàng thất bại");
      }
      setStatus("success");
      clearCart();
    } catch (err: any) {
      setStatus("error");
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Xác nhận đơn hàng</DialogTitle>
      
      {status === 'success' ? (
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" gutterBottom>Đặt hàng thành công!</Typography>
          <Typography color="text.secondary">Đơn hàng của bạn đang được xử lý.</Typography>
        </DialogContent>
      ) : (
        <>
          <DialogContent>
            {status === 'error' && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Typography variant="subtitle1" gutterBottom>Phương thức thanh toán</Typography>
            <RadioGroup value={method} onChange={(e) => setMethod(e.target.value)}>
              <FormControlLabel 
                value="cod" 
                control={<Radio />} 
                label="Thanh toán khi nhận hàng (COD)"
              />
              <FormControlLabel 
                value="bank" 
                disabled 
                control={<Radio />} 
                label="Chuyển khoản (sắp ra mắt)"
              />
            </RadioGroup>
            <Box display="flex" justifyContent="space-between" mt={2} borderTop={1} borderColor="divider" pt={2}>
              <Typography fontWeight="bold">Tổng cộng</Typography>
              <Typography fontWeight="bold">{totalPrice.toLocaleString('vi-VN')} đ</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Hủy</Button>
            <Button 
              variant="contained" 
              onClick={handleCheckout} 
              disabled={status === 'loading' || cartItems.length === 0}
            >
              {status === 'loading' ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}