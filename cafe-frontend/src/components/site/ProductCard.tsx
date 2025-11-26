// src/components/site/ProductCard.tsx

import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material';
import { useCart } from '@/lib/cart/CartContext';
import { Link as RouterLink } from 'react-router-dom';

// Dữ liệu ảnh local, bạn có thể chuyển ra một file riêng nếu muốn
import imgLatte from "@/assets/products/latte.jpg";
// ... (import các ảnh sản phẩm khác nếu cần)

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

const localImages: { match: RegExp; src: string }[] = [
  { match: /latte/i, src: imgLatte },
  // ... (thêm các mapping ảnh khác)
];

function pickImage(p: Product) {
  if (p.image_url) return p.image_url;
  const found = localImages.find((x) => x.match.test(p.name));
  if (found) return found.src;
  return `https://source.unsplash.com/400x300/?coffee,drink,${encodeURIComponent(p.name)}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <RouterLink to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column", transition: ".25s", "&:hover": { boxShadow: 6, transform: "translateY(-4px)" } }}>
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