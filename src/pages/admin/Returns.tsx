import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, CheckCircle, XCircle, Clock, Image as ImageIcon, X } from 'lucide-react';

interface ReturnRequest {
  id: string;
  user_id: string;
  order_number: string;
  comments: string;
  photo_url: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export default function AdminReturns() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      // Fetch returns
      const { data: returnsData, error: returnsError } = await supabase
        .from('returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (returnsError) throw returnsError;

      if (!returnsData || returnsData.length === 0) {
        setReturns([]);
        return;
      }

      // Collect unique user IDs
      const userIds = [...new Set(returnsData.map(r => r.user_id).filter(Boolean))];

      // Fetch profiles
      let profilesData: any[] = [];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
          
        if (!profilesError && profiles) {
          profilesData = profiles;
        }
      }

      // Map profiles to returns
      const mappedReturns = returnsData.map(ret => {
        const profile = profilesData.find(p => p.id === ret.user_id);
        return {
          ...ret,
          profiles: profile ? {
            full_name: profile.full_name,
            email: profile.email
          } : undefined
        };
      });

      setReturns(mappedReturns);
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const { error } = await supabase
        .from('returns')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setReturns(returns.map(r => r.id === id ? { ...r, status: newStatus } : r));
      
      // Update selected return if modal is open
      if (selectedReturn && selectedReturn.id === id) {
        setSelectedReturn({ ...selectedReturn, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openModal = (ret: ReturnRequest) => {
    setSelectedReturn(ret);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReturn(null);
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1 justify-center"><Clock className="w-3 h-3" /> Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1 justify-center"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1 justify-center"><XCircle className="w-3 h-3" /> Rejected</span>;
      case 'resolved':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1 justify-center"><CheckCircle className="w-3 h-3" /> Resolved</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium justify-center">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
        <button 
          onClick={fetchReturns}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-sm font-semibold text-gray-600">Order No.</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Customer</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-[#f37021] border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading return requests...
                    </div>
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No return requests found.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className="font-medium text-gray-900">#{ret.order_number}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{ret.profiles?.full_name || 'Guest User'}</p>
                        {ret.profiles?.email && <p className="text-gray-500 text-xs">{ret.profiles.email}</p>}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(ret.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(ret.status)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openModal(ret)}
                        className="inline-flex items-center gap-1 text-[#0066cc] hover:text-[#0052a3] font-medium text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Return Request <span className="text-[#f37021]">#{selectedReturn.order_number}</span>
              </h2>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customer Info</h3>
                  <p className="font-medium text-gray-900">{selectedReturn.profiles?.full_name || 'Guest User'}</p>
                  {selectedReturn.profiles?.email && <p className="text-sm text-gray-600">{selectedReturn.profiles.email}</p>}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Request Date</h3>
                  <p className="font-medium text-gray-900">{new Date(selectedReturn.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Status</h3>
                  <div className="flex gap-2">
                    {selectedReturn.status !== 'approved' && (
                      <button
                        onClick={() => updateStatus(selectedReturn.id, 'approved')}
                        disabled={updatingId === selectedReturn.id}
                        className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded text-sm font-medium transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {selectedReturn.status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(selectedReturn.id, 'rejected')}
                        disabled={updatingId === selectedReturn.id}
                        className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded text-sm font-medium transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    {selectedReturn.status !== 'resolved' && (
                      <button
                        onClick={() => updateStatus(selectedReturn.id, 'resolved')}
                        disabled={updatingId === selectedReturn.id}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded text-sm font-medium transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedReturn.status)}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Comments</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 whitespace-pre-wrap text-sm">
                  {selectedReturn.comments}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" /> Attached Photo
                </h3>
                <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center min-h-[200px]">
                  {selectedReturn.photo_url ? (
                    <a href={selectedReturn.photo_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                      <img 
                        src={selectedReturn.photo_url} 
                        alt="Return attachment" 
                        className="w-full h-auto max-h-[400px] object-contain hover:opacity-90 transition-opacity cursor-zoom-in"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                        }}
                      />
                    </a>
                  ) : (
                    <p className="text-gray-500 text-sm">No photo attached</p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Click image to view full size</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
