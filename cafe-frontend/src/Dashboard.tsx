import { useEffect, useState } from "react";

type Row = { yyyymmdd: string; revenue: number; orders_count: number };

export default function Dashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const backend = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetch(`${backend}/metrics/daily`)
      .then(r => r.json())
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [backend]);

  if (loading) return <div>Đang tải dashboard…</div>;

  const total = rows.reduce((s, r) => s + r.revenue, 0);

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Doanh thu 7 ngày gần nhất</h2>
      <div>Tổng: {Intl.NumberFormat('vi-VN').format(total)} đ</div>
      <ul>
        {rows.map(r => (
          <li key={r.yyyymmdd}>
            {r.yyyymmdd} — {Intl.NumberFormat('vi-VN').format(r.revenue)} đ ({r.orders_count} đơn)
          </li>
        ))}
      </ul>
    </div>
  );
}
