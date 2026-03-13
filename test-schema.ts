import { supabase } from './src/lib/supabase';

async function check() {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log("Data:", JSON.stringify(data, null, 2));
  }
}
check();
