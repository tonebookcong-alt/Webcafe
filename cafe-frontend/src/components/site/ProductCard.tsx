// src/components/site/ProductCard.tsx

import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material';
import { useCart } from '@/lib/cart/CartContext';
import { Link as RouterLink } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

// BẢNG ÁNH XẠ TÊN SẢN PHẨM -> TÊN FILE ẢNH
// Khóa (bên trái): Tên sản phẩm chính xác trong CSDL (có dấu)
// Giá trị (bên phải): Tên file ảnh trong thư mục public/products/ (không dấu)
const productImageMap: Record<string, string> = {
  "Bạc xỉu": "bac-xiu.jpg",
  "Cà phê cốt dừa": "ca-phe-cot-dua.jpg",
  "Cà phê sữa": "ca-phe-sua.jpg",
  "Cappuccino": "cappuccino.jpg",
  "Espresso": "espresso.jpg",
  "Latte": "latte.jpg",
  "Matcha Latte": "matcha-latte.jpg",
  "Nước ép cam": "nuoc-ep-cam.jpg",
  "Sinh tố xoài": "sinh-to-xoai.jpg",
  "Trà đào cam sả": "tra-dao-cam-sa.jpg",
  "Trà sữa trân châu": "tra-sua-tran-chau.jpg",
  "Trà xanh bạc hà": "tra-xanh-bac-ha.jpg",
};

function pickImage(p: Product) {
  // 1. Ưu tiên ảnh từ backend nếu có
  if (p.image_url) return p.image_url;

  // 2. Tìm tên file ảnh trong bảng ánh xạ dựa trên tên sản phẩm
  const localFileName = productImageMap[p.name];

  if (localFileName) {
    // Nếu tìm thấy, trả về đường dẫn đến ảnh trong thư mục public
    return `/products/${localFileName}`;
  }

  // 3. Fallback nếu không tìm thấy ảnh nào phù hợp
  // (Bạn có thể thay bằng một ảnh placeholder nội bộ nếu muốn)
  return `https://source.unsplash.com/400x300/?coffee,drink,${encodeURIComponent(p.name)}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <RouterLink to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column", transition: ".25s", "&:hover": { boxShadow: 6, transform: "translateY(-4px)" } }}>
        {/* Sử dụng hàm pickImage đã sửa */}
        <CardMedia
          component="img"
          sx={{ height: 180, objectFit: "cover" }}
          image={pickImage(product)}
          alt={product.name}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={600}>{product.name}</Typography>
          <Typography color="text.secondary">{product.price.toLocaleString("vi-VN")} đ</Typography>
        </CardContent>
        <CardActions onClick={(e) => { e.preventDefault(); addToCart(product); }}>
          <Button fullWidth variant="contained" color="primary" sx={{ borderRadius: 2 }}>
            Thêm vào giỏ hàng
          </Button>
        </CardActions>
      </Card>
    </RouterLink>
  );
}