import * as React from "react";
import { Grid, Paper, Typography, Box, Skeleton } from "@mui/material";

const backend = import.meta.env.VITE_BACKEND_URL;

export default function AdminHome() {
  const [loading, setLoading] = React.useState(true);
  const [metrics, setMetrics] = React.useState<any[] | null>(null);

  React.useEffect(() => {
    fetch(`${backend}/metrics/daily`)
      .then(r => (r.ok ? r.json() : []))
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Quản lý & thao tác nhanh
      </Typography>

      <Grid container spacing={2}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} md={3} key={i}><Skeleton variant="rounded" height={120} /></Grid>
          ))
        ) : (
          <>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Doanh thu hôm nay</Typography>
                <Typography variant="h5" fontWeight={800}>
                  {(metrics?.[0]?.total || 0).toLocaleString("vi-VN")} đ
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Đơn 7 ngày</Typography>
                <Typography variant="h5" fontWeight={800}>
                  {metrics?.length || 0}
                </Typography>
              </Paper>
            </Grid>
            {/* thêm card nếu muốn */}
          </>
        )}
      </Grid>
    </Box>
  );
}
