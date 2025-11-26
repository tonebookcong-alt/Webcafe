import * as React from "react";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import { useAuth } from "@/auth/AuthProvider";
import OrderDetailsDialog from "@/components/orders/OrderDetailsDialog"; // Import component Dialog

type Order = {
  id: string;
  total: number;
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled" | "paid";
  created_at: string;
};

const backend = import.meta.env.VITE_BACKEND_URL;

const renderStatusChip = (status: Order['status']) => {
  const colors: Record<Order['status'], "warning" | "info" | "primary" | "success" | "default"> = {
    pending: "warning",
    confirmed: "info",
    shipping: "primary",
    delivered: "success",
    paid: "success",
    cancelled: "default"
  };
  const labels: Record<Order['status'], string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đang chuẩn bị món",
    shipping: "Đang giao",
    delivered: "Đã giao",
    paid: "Đã thanh toán",
    cancelled: "Đã hủy"
  };
  return <Chip size="small" color={colors[status] || 'default'} label={labels[status] || status} />;
};

export default function MyOrders() {
  const { session } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // === PHẦN MỚI: State để quản lý Dialog ===
  const [openDetails, setOpenDetails] = React.useState(false);
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);

  const handleRowClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setOpenDetails(true);
  };
  // === KẾT THÚC PHẦN MỚI ===

  React.useEffect(() => {
    if (session) {
      const token = session.access_token;
      fetch(`${backend}/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch orders');
        }
        return res.json();
      })
      .then(setOrders)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  if (!session) {
    return (
      <Container sx={{ mt: 4, mb: 4 }}><Typography>Vui lòng đăng nhập để xem lịch sử mua hàng.</Typography></Container>
    );
  }

  return (
    <>
      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Lịch sử mua hàng</Typography>
        {error && <Typography color="error" sx={{ mb: 2 }}>Lỗi: {error}</Typography>}
        <Paper variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn hàng</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Tổng tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} align="center">Đang tải...</TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">Bạn chưa có đơn hàng nào.</TableCell></TableRow>
              ) : orders.map(order => (
                <TableRow 
                  key={order.id} 
                  hover 
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(order.id)} // THÊM MỚI: Sự kiện click
                >
                  <TableCell>#{order.id.slice(0, 8)}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleString("vi-VN")}</TableCell>
                  <TableCell>{renderStatusChip(order.status)}</TableCell>
                  <TableCell align="right">{order.total.toLocaleString("vi-VN")} đ</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>
      
      <OrderDetailsDialog 
        orderId={selectedOrderId}
        open={openDetails}
        onClose={() => setOpenDetails(false)}
      />
    </>
  );
}