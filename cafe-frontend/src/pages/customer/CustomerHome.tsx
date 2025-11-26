// src/pages/customer/CustomerHome.tsx

import * as React from "react";
import { Grid, Typography, Container, Box, TextField, InputAdornment, Paper } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import SiteFeedbackSection from "@/components/feedback/SiteFeedbackSection";
import ProductCard from "@/components/site/ProductCard";
import { useAuth } from "@/auth/AuthProvider";
import LoyaltyIcon from '@mui/icons-material/Loyalty';

import heroMain from "@/assets/images/hero.jpg";
import heroFallback from "@/assets/images/hero-fallback.jpg";

// --- CẤU HÌNH ẢNH SẢN PHẨM ---
// Sử dụng ảnh fallback làm ảnh mặc định nếu không tìm thấy ảnh sản phẩm
const PLACEHOLDER_IMAGE = heroFallback;

// BẢNG ÁNH XẠ CHÍNH XÁC TỪ TÊN DB SANG TÊN FILE ẢNH
// Khóa (bên trái): Tên sản phẩm chính xác trong Database (có dấu)
// Giá trị (bên phải): Tên file ảnh chính xác trong thư mục public/products/ (không dấu)
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
  // Lưu ý: "Trà đào cam sả" có 2 dòng trong DB , 
  // nhưng chỉ cần 1 dòng map này là đủ để hiển thị ảnh cho cả hai.
};

type Product = { id: string; name: string; price: number; image_url?: string };
const backend = import.meta.env.VITE_BACKEND_URL;

// Hàm chọn ảnh mới, sử dụng bảng ánh xạ trực tiếp
function pickImage(p: Product) {
  // 1. Ưu tiên ảnh từ backend nếu có (ví dụ: link ảnh online)
  if (p.image_url) return p.image_url;

  // 2. Tìm tên file trong bảng ánh xạ dựa trên tên sản phẩm
  // Sử dụng tên sản phẩm làm khóa để tra cứu
  const localFileName = productImageMap[p.name];

  if (localFileName) {
    // Nếu tìm thấy, trả về đường dẫn đến ảnh trong thư mục public
    return `/products/${localFileName}`;
  }

  // 3. Fallback: Nếu không có ảnh nào phù hợp, dùng ảnh placeholder nội bộ
  // để đảm bảo khung hình không bị vỡ và các thẻ bằng nhau.
  return PLACEHOLDER_IMAGE;
}
// --- KẾT THÚC CẤU HÌNH ẢNH ---


function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function CustomerHome() {
  const [items, setItems] = React.useState<Product[]>([]);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const { profile } = useAuth();

  React.useEffect(() => {
    setLoading(true);
    const url = new URL(`${backend}/products`);
    if (debouncedSearchTerm) {
      url.searchParams.append('q', debouncedSearchTerm);
    }

    fetch(url.toString())
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then(setItems)
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, [debouncedSearchTerm]);

  const [bg, setBg] = React.useState(heroFallback);
  React.useEffect(() => {
    const img = new Image();
    img.src = heroMain;
    img.onload = () => setBg(heroMain);
  }, []);

  return (
    <>
      <Box sx={{ position: "relative", height: 300, backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center", mb: 4 }}>
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,.35)" }} />
        <Container sx={{ position: "relative", zIndex: 1, height: 1, display: "flex", alignItems: "center" }}>
          <Box>
            <Typography variant="h3" fontWeight={800} color="#fff">Không chỉ là uống — đó là thưởng thức</Typography>
            <Typography color="#fff" sx={{ mt: 1, maxWidth: 700 }}>Chúng tôi chọn lọc hạt cà phê, trà và nguyên liệu tươi mới, rang xay – pha chế chuẩn, để mỗi ly mang lại trải nghiệm thú vị nhất.</Typography>
          </Box>
        </Container>
      </Box>

      <Container sx={{ mb: 6 }}>
        
        {/* === PHẦN HIỂN THỊ ĐIỂM TÍCH LŨY === */}
        {profile && (
          <Paper sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3, background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
            <LoyaltyIcon color="primary" sx={{ fontSize: 50 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>Điểm tích lũy của bạn</Typography>
              <Typography variant="h4" color="primary.main" fontWeight={800}>
                {profile.points || 0} điểm
              </Typography>
            </Box>
          </Paper>
        )}
        {/* === KẾT THÚC PHẦN HIỂN THỊ ĐIỂM === */}

        <Typography variant="h4" fontWeight={700} gutterBottom>☕ Menu Serenite</Typography>
        <Box sx={{ mb: 3, maxWidth: '500px' }}>
            <TextField
                fullWidth variant="outlined" placeholder="Tìm kiếm món ăn..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            />
        </Box>
        {err && <Typography color="error" sx={{ mb: 2 }}>Lỗi tải dữ liệu: {err}</Typography>}
        <Grid container spacing={3} alignItems="stretch">
          {loading ? <Typography sx={{ p: 3, width: '100%' }}>Đang tải menu...</Typography>
          : items.length === 0 ? <Typography sx={{ p: 3, width: '100%' }}>Không tìm thấy sản phẩm nào.</Typography>
          : (
            items.map((p) => (
              // TRUYỀN HÀM pickImage VÀO ProductCard ĐỂ SỬ DỤNG
              <Grid item xs={12} sm={6} md={4} lg={3} key={p.id} sx={{ display: 'flex' }}>
                <ProductCard product={p} pickImage={pickImage} />
              </Grid>
            ))
          )}
        </Grid>
      </Container>
      
      <Container sx={{ mb: 6 }}>
        <SiteFeedbackSection />
      </Container>
    </>
  );
}