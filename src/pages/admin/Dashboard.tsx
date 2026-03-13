import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Jan', sales: 4000, revenue: 2400 },
  { name: 'Feb', sales: 3000, revenue: 1398 },
  { name: 'Mar', sales: 2000, revenue: 9800 },
  { name: 'Apr', sales: 2780, revenue: 3908 },
  { name: 'May', sales: 1890, revenue: 4800 },
  { name: 'Jun', sales: 2390, revenue: 3800 },
  { name: 'Jul', sales: 3490, revenue: 4300 },
];

const topProducts = [
  { name: 'Die Cut Stickers', sales: 1240, growth: '+12.5%', image: 'https://picsum.photos/seed/sticker1/100/100' },
  { name: 'Vinyl Lettering', sales: 890, growth: '+8.2%', image: 'https://picsum.photos/seed/sticker2/100/100' },
  { name: 'Clear Stickers', sales: 750, growth: '-2.4%', image: 'https://picsum.photos/seed/sticker3/100/100' },
  { name: 'Holographic Stickers', sales: 620, growth: '+15.1%', image: 'https://picsum.photos/seed/sticker4/100/100' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count: pendingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        
        // Calculate total revenue from all orders
        const { data: allOrdersData } = await supabase.from('orders').select('total_price');
        const totalRevenue = allOrdersData?.reduce((sum, order) => sum + Number(order.total_price || 0), 0) || 0;

        const { data: recentOrdersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (ordersError) throw ordersError;

        let formattedOrders: any[] = [];

        if (recentOrdersData && recentOrdersData.length > 0) {

          // Fetch profiles
          const userIds = [...new Set(recentOrdersData.map(o => o.user_id).filter(Boolean))];
          let profilesData: any[] = [];
          if (userIds.length > 0) {
            const { data } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', userIds);
            profilesData = data || [];
          }

          // Fetch order items
          const orderIds = recentOrdersData.map(o => o.id);
          let itemsData: any[] = [];
          if (orderIds.length > 0) {
            const { data } = await supabase
              .from('order_items')
              .select('order_id, name, quantity')
              .in('order_id', orderIds);
            itemsData = data || [];
          }

          formattedOrders = recentOrdersData.map(order => {
            const profile = profilesData.find(p => p.id === order.user_id);
            const items = itemsData.filter(i => i.order_id === order.id);
            const itemsSummary = items.map(i => `${i.quantity}x ${i.name}`).join(', ');

            return {
              ...order,
              customer_name: profile?.full_name || 'Guest',
              items_summary: itemsSummary || 'No items'
            };
          });
        }

        setStats({
          totalRevenue: totalRevenue,
          totalOrders: ordersCount || 0,
          totalUsers: usersCount || 0,
          pendingOrders: pendingCount || 0
        });
        
        setRecentOrders(formattedOrders);

        // Dynamic chart data (Last 7 days revenue)
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const { data: chartOrders } = await supabase
          .from('orders')
          .select('total_price, created_at')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const dailyRevenue = last7Days.map(date => {
          const dayTotal = chartOrders
            ?.filter(order => order.created_at.startsWith(date))
            .reduce((sum, order) => sum + Number(order.total_price || 0), 0) || 0;
          
          return {
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: dayTotal
          };
        });

        setChartData(dailyRevenue);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#f37021] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${(stats.totalRevenue || 0).toLocaleString()}`} 
          change="+12.5%" 
          isPositive={true} 
          icon={TrendingUp} 
          color="blue"
        />
        <StatCard 
          title="Total Orders" 
          value={(stats.totalOrders || 0).toString()} 
          change="+8.2%" 
          isPositive={true} 
          icon={ShoppingCart} 
          color="orange"
        />
        <StatCard 
          title="Total Users" 
          value={(stats.totalUsers || 0).toString()} 
          change="+5.1%" 
          isPositive={true} 
          icon={Users} 
          color="green"
        />
        <StatCard 
          title="Pending Orders" 
          value={(stats.pendingOrders || 0).toString()} 
          change="-2.4%" 
          isPositive={false} 
          icon={Clock} 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Revenue Analytics</h2>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f37021" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f37021" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f37021" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 text-sm font-medium text-[#f37021] hover:underline"
          >
            View All Orders <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#ORD-{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.customer_name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[200px]">{order.items_summary || 'No items'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">${(order.total_price || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.created_at || 0).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isPositive, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
    </div>
  );
}
