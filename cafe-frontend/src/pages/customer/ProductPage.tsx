// src/pages/customer/ProductPage.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper, Grid,
  IconButton, Divider, Rating
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { supabase } from '@/lib/supabaseClient';
import { useCart } from '@/lib/cart/CartContext';
import { useAuth } from '@/auth/AuthProvider';

// Định nghĩa kiểu dữ liệu cho sản phẩm
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number; // Thêm số lượng tồn kho
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>(); // Lấy product ID từ URL
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth(); // Lấy thông tin user để kiểm tra đăng nhập

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) {
      setError("Không tìm thấy ID sản phẩm.");
      setLoading(false);
      return;
    }
    fetchProduct(id);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single(); // Lấy một bản ghi duy nhất

      if (error) throw error;
      if (!data) {
        setError("Sản phẩm không tồn tại.");
      } else {
        setProduct(data as Product);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải thông tin sản phẩm:", err.message);
      setError("Không thể tải thông tin sản phẩm: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) { // Kiểm tra nếu người dùng chưa đăng nhập
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/login");
      return;
    }
    if (product) {
      if (product.stock <= 0) {
        alert("Sản phẩm này hiện đã hết hàng.");
        return;
      }
      addToCart(product);
      alert(`${product.name} đã được thêm vào giỏ hàng!`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Đang tải chi tiết sản phẩm...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Quay lại trang chủ
        </Button>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="warning">Sản phẩm không tồn tại.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Quay lại trang chủ
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        <ArrowBackIcon />
        <Typography variant="body1" sx={{ ml: 1 }}>Quay lại</Typography>
      </IconButton>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={product.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 400,
                objectFit: 'cover',
                borderRadius: 2,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {product.name}
            </Typography>
            <Typography variant="h5" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
              {product.price.toLocaleString('vi-VN')} VNĐ
            </Typography>
            
            {/* Rating ví dụ */}
            <Rating name="read-only" value={4.5} precision={0.5} readOnly sx={{ mb: 2 }} /> 

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Tồn kho: 
                <Typography component="span" fontWeight="bold" color={product.stock > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                  {product.stock > 0 ? `${product.stock} sản phẩm` : 'Hết hàng'}
                </Typography>
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={loading || product.stock <= 0}
              sx={{ py: 1.5, px: 3 }}
            >
              Thêm vào giỏ hàng
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}