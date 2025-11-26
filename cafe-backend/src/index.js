import express from "express";
import cors from "cors";
import { supabase } from "./supabaseClient.js";

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------------------------------
// ROOT & HEALTH
// ------------------------------------------------------
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "cafe-backend",
    docs: ["/health", "/products", "/orders", "/admin/loyalty"],
  });
});

app.get("/health", async (_req, res) => {
  const { error } = await supabase.from("products").select("id").limit(1);
  if (error) return res.status(500).json({ status: "down", error: error.message });
  return res.json({ status: "up" });
});

// ------------------------------------------------------
// PRODUCTS CRUD
// ------------------------------------------------------
app.get("/products", async (req, res) => {
  try {
    const { q, is_active } = req.query;
    let query;

    if (q && q.trim()) {
      const searchTerm = q.trim();
      query = supabase.rpc('search_products', { search_term: searchTerm });
    } else {
      query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (typeof is_active !== "undefined") {
        query = query.eq("is_active", String(is_active) === "true");
      } else {
        query = query.eq("is_active", true);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    console.error("GET /products/:id error:", err);
    res.status(err?.code === "PGRST116" ? 404 : 500).json({ error: "Internal error" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const { name, price, is_active = true } = req.body || {};
    if (!name || typeof price !== "number" || price < 0) {
      return res.status(400).json({ error: "Invalid payload" });
    }
    const { data, error } = await supabase
      .from("products")
      .insert([{ name, price, is_active }])
      .select("*")
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("POST /products error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const payload = {};
    if (typeof req.body?.name === "string") payload.name = req.body.name;
    if (typeof req.body?.price === "number") payload.price = req.body.price;
    if (typeof req.body?.is_active === "boolean") payload.is_active = req.body.is_active;

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("PUT /products/:id error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("DELETE /products/:id error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// ------------------------------------------------------
// ORDERS
// ------------------------------------------------------
app.post("/orders", async (req, res) => {
  try {
   const { items, user_id, shipping_address } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items required" });
    }
    
    let tempNote;

    const productIds = items.map(i => i.product_id);
    const { data: products, error: pErr } = await supabase.from("products").select("id, name, price").in("id", productIds);
    if (pErr) throw pErr;

    const { data: recipes, error: rErr } = await supabase.from("product_recipes").select("product_id, ingredient_id, qty_per_unit").in("product_id", productIds);
    if (rErr) throw rErr;

    const ingredientsNeeded = new Map();
    for (const item of items) {
      const recipeForProduct = recipes.filter(r => r.product_id === item.product_id);
      for (const recipeItem of recipeForProduct) {
        const totalQtyNeeded = recipeItem.qty_per_unit * item.qty;
        const currentQty = ingredientsNeeded.get(recipeItem.ingredient_id) || 0;
        ingredientsNeeded.set(recipeItem.ingredient_id, currentQty + totalQtyNeeded);
      }
    }

    if (ingredientsNeeded.size > 0) {
      const ingredientIds = Array.from(ingredientsNeeded.keys());
      const { data: currentStock, error: sErr } = await supabase.from("ingredients").select("id, name, qty_on_hand").in("id", ingredientIds);
      if (sErr) throw sErr;

      for (const [id, needed] of ingredientsNeeded.entries()) {
        const stockItem = currentStock.find(s => s.id === id);
        if (!stockItem || stockItem.qty_on_hand < needed) {
          return res.status(400).json({ error: `Không đủ hàng cho nguyên liệu: ${stockItem?.name || 'ID ' + id}` });
        }
      }

      const stockUpdates = [];
      const stockMoveLogs = [];
      tempNote = `temp_order_${Date.now()}`;

      for (const [id, needed] of ingredientsNeeded.entries()) {
        const stockItem = currentStock.find(s => s.id === id);
        const newQty = stockItem.qty_on_hand - needed;
        stockUpdates.push(supabase.from("ingredients").update({ qty_on_hand: newQty }).eq("id", id));
        stockMoveLogs.push({ ingredient_id: id, type: "out", qty: needed, note: tempNote });
      }

      await Promise.all(stockUpdates);
      await supabase.from("stock_moves").insert(stockMoveLogs);
    }

    let total = 0;
    const orderItemsRows = items.map((i) => {
      const prod = products.find((p) => p.id === i.product_id);
      if (!prod) throw new Error("invalid product");
      total += prod.price * i.qty;
      return { product_id: prod.id, name_snapshot: prod.name, unit_price: prod.price, qty: i.qty, };
    });

    const insertOrder = { total, status: "pending", user_id: user_id, shipping_address: shipping_address };
    const { data: order, error: oErr } = await supabase.from("orders").insert(insertOrder).select().single();
    if (oErr) throw oErr;

    const withOrderId = orderItemsRows.map((r) => ({ ...r, order_id: order.id }));
    const { error: iErr } = await supabase.from("order_items").insert(withOrderId);
    if (iErr) throw iErr;

    if (ingredientsNeeded.size > 0) {
      await supabase.from("stock_moves").update({ note: `Order #${order.id.slice(0, 8)}` }).eq("note", tempNote);
    }

    res.json({ ok: true, order_id: order.id, total });
  } catch (err) {
    console.error("POST /orders error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/orders", async (_req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("id,total,status,created_at,paid_at")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderError) throw orderError;
    if (!order) return res.status(404).json({ error: "Order not found" });

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("qty, unit_price, name_snapshot")
      .eq("order_id", id);

    if (itemsError) throw itemsError;

    res.json({ ...order, items: items || [] });
  } catch (err) {
    console.error(`GET /orders/:id error:`, err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/my-orders", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data, error } = await supabase
      .from("orders")
      .select("id, total, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("GET /my-orders error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.patch("/admin/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ALLOWED_STATUSES = ["confirmed", "shipping", "delivered", "cancelled", "paid"];

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const payload = { status: status };
    if (status === "delivered" || status === "paid") {
      payload.paid_at = new Date().toISOString();
    }

    const { data: updatedOrder, error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", id)
      .select('*, user_id, total, points_awarded')
      .single();

    if (error) throw error;
    
    // --- LOGIC CỘNG ĐIỂM TỰ ĐỘNG ---
    if (status === 'delivered' && updatedOrder && !updatedOrder.points_awarded && updatedOrder.user_id) {
        try {
            const points = Math.floor(Number(updatedOrder.total || 0) / 100000);
            if (points > 0) {
                const { data: profile, error: pErr } = await supabase.from("profiles").select("points").eq("id", updatedOrder.user_id).single();
                if (pErr) throw pErr;

                const newPoints = (profile.points || 0) + points;

                await supabase.from("profiles").update({ points: newPoints }).eq("id", updatedOrder.user_id);
                await supabase.from("loyalty_ledger").insert([{ user_id: updatedOrder.user_id, change: points, reason: `Order #${updatedOrder.id.slice(0,8)}` }]);
                await supabase.from("orders").update({ points_awarded: true }).eq("id", updatedOrder.id);
            } else {
                 await supabase.from("orders").update({ points_awarded: true }).eq("id", updatedOrder.id);
            }
        } catch (loyaltyError) {
            console.error("Loyalty point award error:", loyaltyError);
        }
    }
    // --- KẾT THÚC LOGIC CỘNG ĐIỂM ---

    res.json({ ok: true, order: updatedOrder });
  } catch (err) {
    console.error(`PATCH /admin/orders/:id/status error:`, err);
    res.status(500).json({ error: "Internal error" });
  }
});


// ------------------------------------------------------
// SITE FEEDBACK (BÌNH LUẬN CHUNG)
// ------------------------------------------------------
app.get("/feedback", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("site_feedback")
      .select("id, user_id, content, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("GET /feedback error", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.post("/feedback", async (req, res) => {
  try {
    const { content } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: "Invalid user" });
    if (!content) return res.status(400).json({ error: "Content is required" });

    const { data, error } = await supabase
      .from("site_feedback")
      .insert([{ user_id: user.id, content, is_active: false }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("POST /feedback error", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/admin/feedback", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("site_feedback")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("GET /admin/feedback error", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.put("/admin/feedback/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        if (typeof is_active !== 'boolean') return res.status(400).json({ error: 'is_active must be a boolean' });

        const { data, error } = await supabase
            .from("site_feedback")
            .update({ is_active })
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("PUT /admin/feedback/:id error", err);
        res.status(500).json({ error: "Internal error" });
    }
});


// ------------------------------------------------------
// METRICS
// ------------------------------------------------------
app.get("/metrics/daily", async (_req, res) => {
  const { data, error } = await supabase.rpc("revenue_by_day", { days_back: 7 });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ------------------------------------------------------
// ADMIN: USERS (staff & members)
// ------------------------------------------------------
async function getProfilesMap(ids = []) {
  if (!ids.length) return new Map();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .in("id", ids);
  if (error) throw error;
  const map = new Map();
  (data || []).forEach((p) => map.set(p.id, p));
  return map;
}

app.get("/admin/users", async (req, res) => {
  try {
    const role = (req.query.role || "all").toString();
    const { data: usersPage, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listErr) throw listErr;
    const users = usersPage?.users || [];
    const ids = users.map((u) => u.id);
    const profilesMap = await getProfilesMap(ids);
    let rows = users.map((u) => {
      const p = profilesMap.get(u.id);
      return {
        id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at,
        role: p?.role || "customer", display_name: p?.display_name || null,
      };
    });
    if (role !== "all") rows = rows.filter((r) => r.role === role);
    res.json(rows);
  } catch (err) {
    console.error("GET /admin/users error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.patch("/admin/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};
    const ALLOW = ["admin", "staff", "customer"];
    if (!ALLOW.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id, role }, { onConflict: "id" })
      .select("id, role, display_name")
      .single();
    if (error) throw error;
    res.json({ ok: true, profile: data });
  } catch (err) {
    console.error("PATCH /admin/users/:id/role error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// ------------------------------------------------------
// INVENTORY
// ------------------------------------------------------
app.get("/inventory/ingredients", async (req, res) => {
  try {
    const { q, active = "true" } = req.query;
    let query = supabase
      .from("ingredients")
      .select("*")
      .order("created_at", { ascending: false });

    if (active !== "all") {
      query = query.eq("is_active", String(active) === "true");
    }
    if (q && q.trim()) {
      const s = q.trim();
      query = query.or(`name.ilike.%${s}%,unit.ilike.%${s}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("GET /inventory/ingredients error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.post("/inventory/ingredients", async (req, res) => {
  try {
    const { name, unit = "đơn vị", min_level = 0, qty_on_hand = 0 } = req.body || {};
    if (!name || !unit) return res.status(400).json({ error: "Invalid payload" });

    const { data, error } = await supabase
      .from("ingredients")
      .insert([{ name, unit, min_level, qty_on_hand }])
      .select("*")
      .single();
    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error("POST /inventory/ingredients error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.put("/inventory/ingredients/:id", async (req, res) => {
  try {
    const payload = {};
    const body = req.body || {};
    if (typeof body.name === "string") payload.name = body.name;
    if (typeof body.unit === "string") payload.unit = body.unit;
    if (typeof body.min_level === "number") payload.min_level = body.min_level;
    if (typeof body.is_active === "boolean") payload.is_active = body.is_active;
    if (typeof body.qty_on_hand === "number") payload.qty_on_hand = body.qty_on_hand;

    if (!Object.keys(payload).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const { data, error } = await supabase
      .from("ingredients")
      .update(payload)
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("PUT /inventory/ingredients/:id error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.delete("/inventory/ingredients/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ingredients")
      .update({ is_active: false })
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("DELETE /inventory/ingredients/:id error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.post("/inventory/ingredients/:id/move", async (req, res) => {
  try {
    const { type, qty, note } = req.body || {};
    if (!["in", "out"].includes(type) || typeof qty !== "number" || qty <= 0) {
      return res.status(400).json({ error: "Invalid move payload" });
    }

    const { data: ing, error: e1 } = await supabase
      .from("ingredients")
      .select("id, qty_on_hand")
      .eq("id", req.params.id)
      .single();
    if (e1) throw e1;
    if (!ing) return res.status(404).json({ error: "Ingredient not found" });

    const nextQty = type === "in" ? Number(ing.qty_on_hand) + qty : Number(ing.qty_on_hand) - qty;
    if (nextQty < 0) return res.status(400).json({ error: "Xuất vượt tồn kho" });

    const { error: e2 } = await supabase
      .from("stock_moves")
      .insert([{ ingredient_id: req.params.id, type, qty, note }]);
    if (e2) throw e2;

    const { data: updated, error: e3 } = await supabase
      .from("ingredients")
      .update({ qty_on_hand: nextQty })
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (e3) throw e3;

    res.json({ ok: true, ingredient: updated, qty_after: nextQty });
  } catch (err) {
    console.error("POST /inventory/ingredients/:id/move error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/inventory/moves", async (req, res) => {
  try {
    const { ingredient_id, limit = 50 } = req.query;
    let q = supabase.from("stock_moves").select("*").order("created_at", { ascending: false });
    if (ingredient_id) q = q.eq("ingredient_id", ingredient_id);
    const { data, error } = await q.limit(Number(limit));
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("GET /inventory/moves error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// ------------------------------------------------------
// ADMIN: LOYALTY
// ------------------------------------------------------
app.get("/admin/loyalty", async (_req, res) => {
  try {
    const { data: usersPage, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listErr) throw listErr;

    const users = usersPage?.users || [];
    const ids = users.map((u) => u.id);

    const { data: profiles, error: eProf } = await supabase.from("profiles").select("id, display_name, role, points").in("id", ids);
    if (eProf) throw eProf;

    const map = new Map((profiles || []).map((p) => [p.id, p]));
    const rows = users
      .map((u) => ({
        id: u.id, email: u.email,
        role: map.get(u.id)?.role || "customer",
        display_name: map.get(u.id)?.display_name || null,
        points: map.get(u.id)?.points ?? 0,
      }))
      .filter((r) => r.role === "customer");

    res.json(rows);
  } catch (err) {
    console.error("GET /admin/loyalty error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.post("/admin/loyalty/adjust", async (req, res) => {
  try {
    const { user_id, points, reason } = req.body;
    if (!user_id || typeof points !== 'number' || points === 0) {
      return res.status(400).json({ error: "Invalid payload: user_id and points are required." });
    }

    const { data: profile, error: pErr } = await supabase.from("profiles").select("points").eq("id", user_id).single();
    if (pErr) throw pErr;

    const currentPoints = Number(profile.points || 0);
    const newPoints = Math.max(0, currentPoints + points);

    const { error: uErr } = await supabase.from("profiles").update({ points: newPoints }).eq("id", user_id);
    if (uErr) throw uErr;

    const { error: lErr } = await supabase.from("loyalty_ledger").insert([{ user_id, change: points, reason: reason || "Admin adjustment" }]);
    if (lErr) throw lErr;

    res.json({ ok: true, points_before: currentPoints, points_after: newPoints });
  } catch (err) {
    console.error("POST /admin/loyalty/adjust error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// ------------------------------------------------------
// START SERVER
// ------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ cafe-backend chạy tại http://localhost:${PORT}`);
});

// ✅ THÊM: Lấy profile của user
app.get("/profiles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});