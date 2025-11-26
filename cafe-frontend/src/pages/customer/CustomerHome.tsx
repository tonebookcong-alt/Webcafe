// src/pages/customer/CustomerHome.tsx

import * as React from "react";
import { Grid, Typography, Container, Box, TextField, InputAdornment, Paper } from "@mui/material"; // Thêm Paper
import SearchIcon from '@mui/icons-material/Search';
import SiteFeedbackSection from "@/components/feedback/SiteFeedbackSection";
import ProductCard from "@/components/site/ProductCard";
import { useAuth } from "@/auth/AuthProvider"; // THÊM MỚI: Import useAuth
import LoyaltyIcon from '@mui/icons-material/Loyalty'; // THÊM MỚI: Import Icon

// --- IMPORT ẢNH LOCAL ---
import heroMain from "@/assets/images/hero.jpg";
import heroFallback from "@/assets/images/hero-fallback.jpg";
import imgLatte from "@/assets/products/latte.jpg";
import imgCappuccino from "@/assets/products/cappuccino.jpg";
import imgEspresso from "@/assets/products/espresso.jpg";
import imgMatcha from "@/assets/products/matcha-latte.jpg";
import imgNuocCam from "@/assets/products/nuoc-ep-cam.jpg";
import imgCotDua from "@/assets/products/ca-phe-cot-dua.jpg";
import imgTSChanChau from "@/assets/products/tra-sua-tran-chau.jpg";
import imgTXBacHa from "@/assets/products/tra-xanh-bac-ha.jpg";
import imgTDCS from "@/assets/products/tra-dao-cam-sa.jpg";
import imgBacXiu from "@/assets/products/bac-xiu.jpg";
import imgSinhTo from "@/assets/products/sinh-to-xoai.jpg";
import imgCaPheSua from "@/assets/products/ca-phe-sua.jpg";

type Product = { id: string; name: string; price: number; image_url?: string };
const backend = import.meta.env.VITE_BACKEND_URL;

const localImages: { match: RegExp; src: string }[] = [
  { match: /latte/i, src: imgLatte },
  { match: /cappuccino/i, src: imgCappuccino },
  { match: /espresso/i, src: imgEspresso },
  { match: /matcha/i, src: imgMatcha },
  { match: /nước ép cam|nuoc ep cam/i, src: imgNuocCam },
  { match: /cốt dừa|cot dua/i, src: imgCotDua },
  { match: /trà sữa trân châu|tran chau/i, src: imgTSChanChau },
  { match: /trà xanh bạc hà|bac ha/i, src: imgTXBacHa },
  { match: /trà đào cam sả|dao cam sa/i, src: imgTDCS },
  { match: /bạc xỉu|bac xiu/i, src: imgBacXiu },
  { match: /sinh tố|sinh to/i, src: imgSinhTo },
  { match: /cà phê sữa|ca phe sua/i, src: imgCaPheSua },
];

function pickImage(p: Product) {
  if (p.image_url) return p.image_url;
  const found = localImages.find((x) => x.match.test(p.name));
  if (found) return found.src;
  return `https://source.unsplash.com/400x300/?coffee,drink,${encodeURIComponent(p.name)}`;
}

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
  
  const { profile } = useAuth(); // THÊM MỚI: Lấy profile từ AuthContext

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
        
        {/* === PHẦN THÊM MỚI: HIỂN THỊ ĐIỂM TÍCH LŨY === */}
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
        {/* === KẾT THÚC PHẦN THÊM MỚI === */}

        <Typography variant="h4" fontWeight={700} gutterBottom>☕ Menu Serenite</Typography>
        <Box sx={{ mb: 3, maxWidth: '500px' }}>
            <TextField
                fullWidth variant="outlined" placeholder="Tìm kiếm món ăn..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            />
        </Box>
        {err && <Typography color="error" sx={{ mb: 2 }}>Lỗi tải dữ liệu: {err}</Typography>}
        <Grid container spacing={3}>
          {loading ? <Typography sx={{ p: 3, width: '100%' }}>Đang tải menu...</Typography>
          : items.length === 0 ? <Typography sx={{ p: 3, width: '100%' }}>Không tìm thấy sản phẩm nào.</Typography>
          : (
            items.map((p) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                <ProductCard product={p} />
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