import * as React from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import heroMain from "@/assets/images/hero.jpg";
import heroFallback from "@/assets/images/hero-fallback.jpg";

type Props = {
  height?: number;
};

export default function Hero({ height = 360 }: Props) {
  const [bg, setBg] = React.useState<string>(heroFallback);

  React.useEffect(() => {
    const img = new Image();
    img.src = heroMain;
    img.onload = () => setBg(heroMain);
    img.onerror = () => setBg(heroFallback);
  }, []);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        height,
        bgcolor: "grey.900",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: { xs: 0, md: 2 },
        overflow: "hidden",
      }}
    >
      <span className="hero-overlay" />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={1}>
          <Typography variant="h3" fontWeight={800}>
            Không chỉ là uống — đó là thưởng thức
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 900 }}>
            Chúng tôi chọn lọc hạt cà phê, trà và nguyên liệu tươi mới, rang xay – pha chế chuẩn,
            để mỗi ly mang lại trải nghiệm thư thái nhất.
          </Typography>
          <Box>
            <Button component="a" href="#menu" size="large" variant="contained">
              Xem menu
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
