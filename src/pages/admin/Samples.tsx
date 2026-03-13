import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Search, 
  Filter, 
  Truck, 
  CheckCircle, 
  Clock, 
  User, 
  MapPin, 
  Package,
  MoreVertical,
  Mail,
  ExternalLink
} from 'lucide-react';

interface SampleRequest {
  id: number;
  customer_name: string;
  address: string;
  product_name: string;
  status: string;
  created_at: string;
}

export default function Samples() {
  const [samples, setSamples] = useState<SampleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('samples')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        ...item,
        customer_name: item.profiles?.full_name || 'Unknown',
        customer_email: item.profiles?.email || 'Unknown'
      })) || [];
      
      setSamples(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase.from('samples').update({ status }).eq('id', id);
      if (!error) fetchSamples();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sample Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage free sample requests from potential customers</p>
        </div>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Bulk Email Labels
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by customer or product..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Shipped</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Samples Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Requested Product</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#f37021] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-500">Loading samples...</p>
                    </div>
                  </td>
                </tr>
              ) : samples.map((sample) => (
                <tr key={sample.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">#{sample.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {(sample.customer_name || '?').charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{sample.customer_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 max-w-[200px]">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-gray-600 line-clamp-2">{sample.address || 'No address provided'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{sample.product_name || 'Unknown Product'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      sample.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {sample.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {new Date(sample.created_at || 0).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {sample.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus(sample.id, 'shipped')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                        >
                          <Truck className="w-4 h-4" /> Mark Shipped
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {samples.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No sample requests</h3>
            <p className="text-gray-500">When users request samples, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
