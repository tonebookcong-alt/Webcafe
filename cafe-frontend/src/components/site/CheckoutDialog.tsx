// src/components/site/CheckoutDialog.tsx - PHIÊN BẢN CÓ THÊM ĐỊA CHỈ

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemText, Typography, Divider, Box,
  IconButton, Alert, Stack, RadioGroup, FormControlLabel, Radio, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { useCart } from '@/lib/cart/CartContext';
import { useAuth } from '@/auth/AuthProvider';

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function CheckoutDialog({ open, onClose }: CheckoutDialogProps) {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, calculateTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  // THÊM MỚI: State để lưu địa chỉ
  const [shippingAddress, setShippingAddress] = React.useState(''); 

  const [paymentMethod, setPaymentMethod] = React.useState("cash");
  const [checkoutStatus, setCheckoutStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (checkoutStatus === 'success') {
      timer = setTimeout(() => {
        onClose();
        navigate('/my-orders');
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [checkoutStatus, navigate, onClose]);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Bạn cần đăng nhập để hoàn tất đơn hàng.");
      onClose();
      navigate("/login");
      return;
    }
    // THÊM MỚI: Kiểm tra xem đã nhập địa chỉ chưa
    if (!shippingAddress.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ giao hàng.");
      setCheckoutStatus('error');
      return;
    }

    setCheckoutStatus('loading');
    setErrorMessage('');

    const orderPayload = {
      user_id: user.id,
      items: cartItems.map(item => ({ product_id: item.id, qty: item.quantity })),
      total: calculateTotal(),
      payment_method: paymentMethod,
      shipping_address: shippingAddress, // THÊM MỚI: Gửi địa chỉ lên backend
    };

    try {
      const response = await fetch(`${backendUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Tạo đơn hàng thất bại');
      }
      
      clearCart();
      setCheckoutStatus('success');
    } catch (err: any) {
      console.error("Lỗi khi đặt hàng:", err);
      setErrorMessage(err.message);
      setCheckoutStatus('error');
    }
  };
  
  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setCheckoutStatus('idle');
        setErrorMessage('');
    }, 300);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Giỏ hàng của bạn
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {checkoutStatus === 'success' ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>Đặt hàng thành công!</Typography>
            <Typography color="text.secondary">Đơn hàng của bạn đang được xử lý. Tự động chuyển trang...</Typography>
          </Box>
        ) : (
          <>
            {checkoutStatus === 'error' && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
            {cartItems.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ py: 3 }}>Giỏ hàng của bạn đang trống.</Typography>
            ) : (
              <List>
                {cartItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" mr={1}>{item.price.toLocaleString('vi-VN')} VNĐ</Typography>
                            <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}><RemoveIcon fontSize="small" /></IconButton>
                            <Typography variant="body2" mx={1}>{item.quantity}</Typography>
                            <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}><AddIcon fontSize="small" /></IconButton>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }} 
                      />
                      <Typography variant="subtitle1" sx={{ minWidth: '80px', textAlign: 'right' }}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                      </Typography>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
                <ListItem>
                  <ListItemText primary={<Typography variant="h6">Tổng cộng:</Typography>} />
                  <Typography variant="h6" color="primary">{calculateTotal().toLocaleString('vi-VN')} VNĐ</Typography>
                </ListItem>
                
                {/* --- THÊM PHẦN ĐỊA CHỈ GIAO HÀNG --- */}
                <Divider sx={{ mt: 2, mb: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Thông tin giao hàng</Typography>
                <TextField
                  fullWidth
                  label="Địa chỉ giao hàng"
                  variant="outlined"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Ví dụ: 123 Nguyễn Văn Linh, Đà Nẵng"
                  required
                />
                
                <Divider sx={{ mt: 2, mb: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Phương thức thanh toán:</Typography>
                <RadioGroup row value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                  <FormControlLabel value="cash" control={<Radio />} label="Tiền mặt" />
                  <FormControlLabel value="card" control={<Radio />} label="Thẻ tín dụng" disabled />
                </RadioGroup>
              </List>
            )}
          </>
        )}
      </DialogContent>
      {checkoutStatus !== 'success' && (
         <DialogActions>
            <Button onClick={() => { clearCart(); }} color="error" disabled={cartItems.length === 0 || checkoutStatus === 'loading'}>Xóa tất cả</Button>
            <Button onClick={handleCheckout} color="primary" variant="contained" disabled={cartItems.length === 0 || checkoutStatus === 'loading'}>
              {checkoutStatus === 'loading' ? "Đang xử lý..." : "Đặt hàng"}
            </Button>
         </DialogActions>
      )}
    </Dialog>
  );
}
