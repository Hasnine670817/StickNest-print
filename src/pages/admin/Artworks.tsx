import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  Image as ImageIcon,
  Clock,
  User,
  ExternalLink,
  MessageSquare,
  ShoppingCart
} from 'lucide-react';

interface Artwork {
  id: number | string;
  user_id: string;
  order_id?: number;
  cart_item_id?: string;
  file_url: string;
  file_type: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  source?: 'order' | 'cart' | 'manual';
}

export default function Artworks() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; artworkId: number | string | null; reason: string }>({
    isOpen: false,
    artworkId: null,
    reason: ''
  });

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      // 1. Fetch from order_items table (Ordered artworks)
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('id, order_id, artwork')
        .not('artwork', 'is', null);

      if (itemsError) throw itemsError;

      // 2. Fetch from cart_items table (Artworks in cart - before ordering)
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('id, user_id, artwork, created_at')
        .not('artwork', 'is', null);

      if (cartError) {
        console.warn('Error fetching cart items:', cartError);
      }

      // 3. Fetch from artworks table (Legacy / Other)
      const { data: artworksData, error: artworksError } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (artworksError) {
        console.warn('Error fetching artworks table:', artworksError);
      }

      // 4. Fetch profiles and orders for context
      const orderIds = [...new Set(orderItems?.map(i => i.order_id).filter(Boolean) || [])];
      const userIds = [...new Set([
        ...(artworksData?.map(a => a.user_id).filter(Boolean) || []),
        ...(cartItems?.map(c => c.user_id).filter(Boolean) || [])
      ].filter(Boolean))];

      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds);
        profiles = data || [];
      }

      let orders: any[] = [];
      if (orderIds.length > 0) {
        const { data } = await supabase.from('orders').select('id, user_id, created_at').in('id', orderIds);
        orders = data || [];
        
        const orderUserIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))];
        if (orderUserIds.length > 0) {
          const { data: orderProfiles } = await supabase.from('profiles').select('id, full_name, email').in('id', orderUserIds);
          if (orderProfiles) {
            orderProfiles.forEach(p => {
              if (!profiles.find(existing => existing.id === p.id)) {
                profiles.push(p);
              }
            });
          }
        }
      }

      const formattedArtworks: Artwork[] = [];

      // Add from order items (Highest priority - actual orders)
      orderItems?.forEach((item: any) => {
        const order = orders.find(o => o.id === item.order_id);
        const profile = order ? profiles.find(p => p.id === order.user_id) : null;
        
        // Look for status in artworks table - match by file_url or order_id
        const artworkStatusData = artworksData?.find(a => 
          a.file_url === item.artwork || (a.order_id === item.order_id && a.file_url === item.artwork)
        );
        
        formattedArtworks.push({
          id: item.id,
          user_id: order?.user_id || '',
          order_id: item.order_id,
          file_url: item.artwork,
          file_type: 'image/png',
          status: artworkStatusData?.status || 'pending',
          rejection_reason: artworkStatusData?.rejection_reason,
          created_at: order?.created_at || new Date().toISOString(),
          customer_name: profile?.full_name || 'Guest',
          customer_email: profile?.email || 'No email',
          source: 'order'
        });
      });

      // Add from cart items (In cart - before ordering)
      cartItems?.forEach((item: any) => {
        // Only add if not already added via order (same URL)
        if (!formattedArtworks.find(a => a.file_url === item.artwork)) {
          const profile = profiles.find(p => p.id === item.user_id);
          const artworkStatusData = artworksData?.find(a => a.file_url === item.artwork);
          
          formattedArtworks.push({
            id: item.id,
            user_id: item.user_id,
            cart_item_id: item.id,
            file_url: item.artwork,
            file_type: 'image/png',
            status: artworkStatusData?.status || 'in-cart',
            rejection_reason: artworkStatusData?.rejection_reason,
            created_at: item.created_at || new Date().toISOString(),
            customer_name: profile?.full_name || 'Guest',
            customer_email: profile?.email || 'No email',
            source: 'cart'
          });
        }
      });

      // Add from artworks table (Legacy / Manual)
      artworksData?.forEach(item => {
        if (!formattedArtworks.find(a => a.file_url === item.file_url)) {
          const profile = profiles.find(p => p.id === item.user_id);
          formattedArtworks.push({
            ...item,
            customer_name: profile?.full_name || 'Unknown',
            customer_email: profile?.email || 'Unknown',
            source: 'manual'
          });
        }
      });
      
      setArtworks(formattedArtworks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error('Error fetching artworks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: number | string, status: string, reason?: string) => {
    try {
      const artwork = artworks.find(a => String(a.id) === String(id));
      if (!artwork) {
        console.error('Artwork not found for ID:', id);
        return;
      }

      // Optimistically update local state to show change immediately
      setArtworks(prev => prev.map(a => 
        a.file_url === artwork.file_url ? { ...a, status, rejection_reason: reason || null } : a
      ));
      
      setRejectionModal({ isOpen: false, artworkId: null, reason: '' });

      // Try to find existing record by file_url or order_id
      const { data: existingArtworks, error: fetchError } = await supabase
        .from('artworks')
        .select('id')
        .eq('file_url', artwork.file_url);

      if (fetchError) console.error('Error checking existing artwork:', fetchError);

      if (existingArtworks && existingArtworks.length > 0) {
        // Update all matching records
        const idsToUpdate = existingArtworks.map(a => a.id);
        const { error: updateError } = await supabase
          .from('artworks')
          .update({ 
            status,
            rejection_reason: reason || null,
            order_id: artwork.order_id || null,
            updated_at: new Date().toISOString()
          })
          .in('id', idsToUpdate);
        
        if (updateError) console.error('Error updating artwork status:', updateError);
      } else {
        // Insert new record as source of truth for this artwork
        const { error: insertError } = await supabase
          .from('artworks')
          .insert([{
            user_id: artwork.user_id || null,
            order_id: artwork.order_id || null,
            file_url: artwork.file_url,
            status,
            rejection_reason: reason || null,
            created_at: new Date().toISOString()
          }]);
        
        if (insertError) console.error('Error inserting artwork status:', insertError);
      }

      // Update order status if needed
      if (artwork.order_id) {
        if (status === 'approved') {
          await supabase.from('orders').update({ status: 'printing' }).eq('id', artwork.order_id);
        } else if (status === 'rejected') {
          await supabase.from('orders').update({ status: 'pending' }).eq('id', artwork.order_id);
        }
      }
      
      // Fetch fresh data in background to ensure everything is in sync
      await fetchArtworks(true);
    } catch (err) {
      console.error('Error in updateStatus:', err);
      fetchArtworks(true);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'artwork.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback to opening in new tab
      window.open(url, '_blank');
    }
  };

  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = 
      artwork.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.order_id?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'All Statuses' || artwork.status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artwork Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve customer uploaded designs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by customer, order ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#f37021]"
          >
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>In-Cart</option>
          </select>
          <button 
            onClick={() => fetchArtworks()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <Clock className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Artworks Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 border-4 border-[#f37021] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading artworks...</p>
        </div>
      ) : filteredArtworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtworks.map((artwork) => (
            <div key={`${artwork.id}-${artwork.order_id || 'manual'}`} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:border-[#f37021] transition-all flex flex-col">
              <div className="aspect-square relative bg-gray-100 flex items-center justify-center overflow-hidden">
                {(artwork.file_type || '').startsWith('image') || 
                 artwork.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                 artwork.file_url.startsWith('data:image') ||
                 !artwork.file_type || 
                 artwork.file_url.includes('picsum.photos') ? (
                  <img 
                    src={artwork.file_url} 
                    alt="Artwork" 
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <FileText className="w-16 h-16" />
                    <span className="text-xs font-bold uppercase">{(artwork.file_type || '').split('/')[1] || 'FILE'}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={() => setSelectedArtwork(artwork)}
                    className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDownload(artwork.file_url, `artwork-order-${artwork.order_id}.png`)}
                    className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                    artwork.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    artwork.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                    artwork.status === 'in-cart' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {artwork.status || 'pending'}
                  </span>
                  {artwork.source === 'cart' && (
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 text-[8px] font-bold uppercase w-fit">
                      In Cart
                    </span>
                  )}
                </div>
                {artwork.order_id && (
                  <div className="absolute top-3 right-3">
                    <button 
                      onClick={() => navigate('/admin/orders')}
                      className="p-1.5 bg-white/90 backdrop-blur rounded-lg text-gray-700 hover:text-[#f37021] shadow-sm transition-colors"
                      title="View Order"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#f37021] flex items-center justify-center font-bold text-xs">
                    {(artwork.customer_name || '?').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{artwork.customer_name || 'Unknown'}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(artwork.created_at || 0).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {artwork.rejection_reason && artwork.status === 'rejected' && (
                  <div className="mb-4 p-2 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-[10px] font-bold text-red-700 uppercase mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Reason:
                    </p>
                    <p className="text-xs text-red-600 italic">"{artwork.rejection_reason}"</p>
                  </div>
                )}

                <div className="mt-auto flex gap-2">
                  <button 
                    onClick={() => updateStatus(artwork.id, 'approved')}
                    disabled={artwork.status === 'approved'}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => setRejectionModal({ isOpen: true, artworkId: artwork.id, reason: '' })}
                    disabled={artwork.status === 'rejected'}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No artworks found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'All Statuses' 
              ? 'Try adjusting your filters or search terms.' 
              : 'When users upload designs, they will appear here for review.'}
          </p>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Reject Artwork</h3>
              <p className="text-xs text-gray-500 mt-1">Provide a reason for the customer to fix their design.</p>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rejection Reason</label>
                <textarea 
                  value={rejectionModal.reason}
                  onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Image resolution is too low, please upload a high-quality vector file."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none h-32 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setRejectionModal({ isOpen: false, artworkId: null, reason: '' })}
                  className="py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => rejectionModal.artworkId && updateStatus(rejectionModal.artworkId, 'rejected', rejectionModal.reason)}
                  disabled={!rejectionModal.reason.trim()}
                  className="py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedArtwork && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-12" onClick={() => setSelectedArtwork(null)}>
          <button className="absolute top-6 right-6 text-white hover:text-gray-300">
            <XCircle className="w-10 h-10" />
          </button>
          <div className="max-w-4xl w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            {(selectedArtwork.file_type || '').startsWith('image') || selectedArtwork.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || !selectedArtwork.file_type || selectedArtwork.file_url.includes('picsum.photos') ? (
              <img src={selectedArtwork.file_url} alt="Preview" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="bg-white p-12 rounded-2xl flex flex-col items-center gap-4">
                <FileText className="w-32 h-32 text-gray-200" />
                <p className="text-xl font-bold text-gray-900">File Preview Not Available</p>
                <button 
                  onClick={() => handleDownload(selectedArtwork.file_url, `artwork-order-${selectedArtwork.order_id}.png`)}
                  className="px-6 py-3 bg-[#f37021] text-white rounded-xl font-bold flex items-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download to View
                </button>
              </div>
            )}
            <div className="mt-8 bg-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-8 text-white">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Customer</p>
                <p className="font-bold">{selectedArtwork.customer_name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">File Type</p>
                <p className="font-bold">{(selectedArtwork.file_type || '').split('/')[1]?.toUpperCase() || 'IMAGE'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Uploaded On</p>
                <p className="font-bold">{new Date(selectedArtwork.created_at || 0).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
