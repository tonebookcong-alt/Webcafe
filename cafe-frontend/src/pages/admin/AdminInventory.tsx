// src/pages/admin/AdminInventory.tsx - PHIÊN BẢN HOÀN CHỈNH

import * as React from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, IconButton, Tooltip
} from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';

type Ingredient = { id: string; name: string; unit: string; qty_on_hand: number; min_level: number; is_active: boolean; created_at?: string; };
const backend = import.meta.env.VITE_BACKEND_URL;

export default function AdminInventory() {
  const [rows, setRows] = React.useState<Ingredient[]>([]);
  
  // State cho dialog "Thêm mới nguyên liệu"
  const [newFormOpen, setNewFormOpen] = React.useState(false);
  const [newForm, setNewForm] = React.useState<Partial<Ingredient>>({ name: "", unit: "đơn vị", min_level: 0, qty_on_hand: 0 });

  // State cho dialog "Nhập/Xuất kho"
  const [stockMoveOpen, setStockMoveOpen] = React.useState(false);
  const [selectedIngredient, setSelectedIngredient] = React.useState<Ingredient | null>(null);
  const [stockMoveForm, setStockMoveForm] = React.useState({ type: 'in' as 'in' | 'out', qty: 0, note: '' });

  // State cho dialog "Sửa mức tối thiểu"
  const [editMinLevelOpen, setEditMinLevelOpen] = React.useState(false);
  const [minLevelForm, setMinLevelForm] = React.useState(0);

  const load = React.useCallback(() => {
    fetch(`${backend}/inventory/ingredients`).then(r => r.json()).then(setRows).catch(() => setRows([]));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleSaveNew = async () => { /* ... giữ nguyên ... */ };
  
  // Mở dialog Nhập/Xuất kho
  const openStockMoveDialog = (type: 'in' | 'out', ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setStockMoveForm({ type, qty: 0, note: '' });
    setStockMoveOpen(true);
  };

  // Mở dialog Sửa mức tối thiểu
  const openEditMinLevelDialog = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setMinLevelForm(ingredient.min_level);
    setEditMinLevelOpen(true);
  };

  // Lưu thay đổi khi Nhập/Xuất kho
  const handleSaveStockMove = async () => {
    if (!selectedIngredient || stockMoveForm.qty <= 0) {
      alert("Vui lòng nhập số lượng lớn hơn 0");
      return;
    }
    await fetch(`${backend}/inventory/ingredients/${selectedIngredient.id}/move`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: stockMoveForm.type,
        qty: stockMoveForm.qty,
        note: stockMoveForm.note || `Thao tác ${stockMoveForm.type === 'in' ? 'nhập' : 'xuất'} kho thủ công`
      })
    });
    setStockMoveOpen(false); load();
  };
  
  // Lưu thay đổi Mức tối thiểu
  const handleUpdateMinLevel = async () => {
    if (!selectedIngredient || minLevelForm < 0) {
      alert("Mức tối thiểu không hợp lệ");
      return;
    }
    await fetch(`${backend}/inventory/ingredients/${selectedIngredient.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ min_level: minLevelForm })
    });
    setEditMinLevelOpen(false); load();
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Kho nguyên liệu</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField size="small" disabled placeholder="(tìm kiếm nhanh – optional)" />
        <Button variant="contained" onClick={() => setNewFormOpen(true)}>Thêm nguyên liệu</Button>
        <Button variant="outlined" onClick={load}>Làm mới</Button>
      </Stack>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tên</TableCell>
              <TableCell>Đơn vị</TableCell>
              <TableCell align="right">Tồn</TableCell>
              <TableCell align="right">Mức tối thiểu</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => {
              const isLowStock = r.qty_on_hand <= r.min_level;
              return (
                <TableRow key={r.id} hover>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.unit}</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ color: isLowStock ? 'error.main' : 'text.primary', fontWeight: isLowStock ? 'bold' : 'normal' }}
                  >
                    {isLowStock && <WarningAmberIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />}
                    {r.qty_on_hand}
                  </TableCell>
                  <TableCell align="right">
                    {r.min_level}
                    <Tooltip title="Chỉnh sửa mức tối thiểu">
                      <IconButton size="small" sx={{ ml: 0.5 }} onClick={() => openEditMinLevelDialog(r)}>
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{r.is_active ? "active" : "inactive"}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button size="small" variant="text" color="success" onClick={() => openStockMoveDialog('in', r)}>
                        Nhập
                      </Button>
                      <Button size="small" variant="text" color="error" onClick={() => openStockMoveDialog('out', r)}>
                        Xuất
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
            {!rows.length && <TableRow><TableCell colSpan={6} align="center">Không có dữ liệu</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog cho chức năng "Thêm mới nguyên liệu" */}
      <Dialog open={newFormOpen} onClose={() => setNewFormOpen(false)} maxWidth="sm" fullWidth>
        {/* ...Nội dung dialog này giữ nguyên... */}
      </Dialog>
      
      {/* Dialog cho chức năng "Nhập/Xuất kho" */}
      <Dialog open={stockMoveOpen} onClose={() => setStockMoveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {stockMoveForm.type === 'in' ? 'Nhập thêm kho cho: ' : 'Xuất kho thủ công: '} 
          {selectedIngredient?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">Số lượng tồn hiện tại: {selectedIngredient?.qty_on_hand} {selectedIngredient?.unit}</Alert>
            <TextField 
              autoFocus
              label={`Số lượng ${stockMoveForm.type === 'in' ? 'nhập thêm' : 'cần xuất'}`} 
              type="number" 
              value={stockMoveForm.qty} 
              onChange={e => setStockMoveForm({...stockMoveForm, qty: Number(e.target.value)})} 
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField 
              label="Ghi chú (tùy chọn)" 
              value={stockMoveForm.note}
              onChange={e => setStockMoveForm({...stockMoveForm, note: e.target.value})}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockMoveOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveStockMove}>Xác nhận</Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog cho chức năng "Sửa mức tối thiểu" */}
      <Dialog open={editMinLevelOpen} onClose={() => setEditMinLevelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Sửa mức tối thiểu cho: {selectedIngredient?.name}</DialogTitle>
        <DialogContent>
            <TextField 
                autoFocus
                margin="dense"
                label="Mức tồn kho tối thiểu mới"
                type="number"
                fullWidth
                variant="standard"
                value={minLevelForm}
                onChange={(e) => setMinLevelForm(Number(e.target.value))}
                InputProps={{ inputProps: { min: 0 } }}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setEditMinLevelOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleUpdateMinLevel}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}