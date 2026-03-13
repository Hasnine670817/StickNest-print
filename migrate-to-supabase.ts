import Database from "better-sqlite3";
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

dotenv.config();

const db = new Database("database.db");

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
  console.log("Starting migration to Supabase...");

  // 1. Migrate Products
  const products = db.prepare("SELECT * FROM products").all() as any[];
  console.log(`Found ${products.length} products in SQLite.`);

  for (const product of products) {
    const { error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image_url: product.image_url,
        is_active: product.is_active === 1,
        created_at: product.created_at
      }]);
    
    if (error) {
      console.error(`Error migrating product ${product.name}:`, error.message);
    } else {
      console.log(`Migrated product: ${product.name}`);
    }
  }

  // 2. Migrate Coupons
  const coupons = db.prepare("SELECT * FROM coupons").all() as any[];
  for (const coupon of coupons) {
    const { error } = await supabase
      .from('coupons')
      .insert([{
        code: coupon.code,
        discount_percentage: coupon.discount_percentage,
        expiry_date: coupon.expiry_date,
        is_active: coupon.is_active === 1,
        created_at: coupon.created_at
      }]);
    if (error) console.error(`Error migrating coupon ${coupon.code}:`, error.message);
  }

  // 3. Migrate Settings
  const settings = db.prepare("SELECT * FROM settings").all() as any[];
  for (const setting of settings) {
    const { error } = await supabase
      .from('settings')
      .insert([{
        key: setting.key,
        value: setting.value,
        created_at: setting.created_at
      }]);
    if (error) console.error(`Error migrating setting ${setting.key}:`, error.message);
  }

  console.log("Migration finished!");
}

migrate();
