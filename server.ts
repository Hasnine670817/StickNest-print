import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client for backend
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes using Supabase
  app.get("/api/products", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: pendingOrdersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('total_price')
        .order('created_at', { ascending: false })
        .limit(100);

      const totalSales = recentOrders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;

      res.json({
        totalSales,
        totalOrders: ordersCount || 0,
        totalUsers: usersCount || 0,
        pendingOrders: pendingOrdersCount || 0
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/orders", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Flatten the response to match the expected format
      const orders = data.map(order => ({
        ...order,
        customer_name: order.profiles?.full_name,
        customer_email: order.profiles?.email
      }));

      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/chart-data", async (req, res) => {
    try {
      // Simple monthly aggregation for the last 12 months
      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total_price');
      
      if (error) throw error;

      const monthlyData: { [key: string]: number } = {};
      data.forEach(order => {
        const month = new Date(order.created_at).getMonth() + 1;
        monthlyData[month] = (monthlyData[month] || 0) + Number(order.total_price);
      });

      const result = Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue
      }));

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/admin/orders/:orderId/status", async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
