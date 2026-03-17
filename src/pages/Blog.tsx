import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Link as LinkIcon, MessageSquare, Heart, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_url: string;
  published_at: string;
  likes_count: number;
  comments_count: number;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage) || 1;

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-[1000px] mx-auto px-4 py-12">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <div className="w-[100px] h-[100px] bg-[#5a3a22] rounded-full flex items-center justify-center shrink-0">
              {/* Horse Icon SVG Placeholder */}
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.5 7.5C19.5 7.5 18 6 16.5 6C15 6 13.5 7.5 13.5 7.5L12 9L10.5 7.5C10.5 7.5 9 6 7.5 6C6 6 4.5 7.5 4.5 7.5V10.5L12 18L19.5 10.5V7.5Z" />
                <path d="M12 18L4.5 10.5V19.5H19.5V10.5L12 18Z" opacity="0.5"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-[28px] font-bold text-[#333333] leading-none">Sticker Mule</h1>
                <span className="bg-[#777777] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PRO</span>
              </div>
              <p className="text-[#777777] text-[15px] mb-1">@stickermule</p>
              <div className="flex items-center gap-1 text-[#0066cc] text-[15px] mb-2">
                <LinkIcon className="w-4 h-4" />
                <a href="https://www.stickermule.com" target="_blank" rel="noopener noreferrer" className="hover:underline">www.stickermule.com</a>
              </div>
              <div className="flex items-center gap-4 text-[15px] text-[#333333]">
                <p><span className="font-bold">11</span> Following</p>
                <p><span className="font-bold">12.4K</span> Followers</p>
              </div>
            </div>
          </div>
          <button className="mt-6 md:mt-0 bg-[#0066cc] hover:bg-[#005bb5] text-white font-bold py-2 px-6 rounded transition-colors">
            Follow
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#eeeeee] mb-8">
          <button className="px-4 py-3 text-[15px] font-bold text-[#333333] border-b-2 border-[#f37021]">
            Published
          </button>
          <button className="px-4 py-3 text-[15px] font-medium text-[#777777] hover:text-[#333333] transition-colors">
            Analytics
          </button>
        </div>

        {/* Blog List */}
        <div className="space-y-12">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#f37021] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : currentPosts.length === 0 ? (
            <div className="text-center py-12 text-[#777777]">
              No posts published yet.
            </div>
          ) : (
            currentPosts.map((post) => (
              <div key={post.id} className="flex flex-col-reverse md:flex-row gap-6 md:gap-10 items-start">
                <div className="flex-1">
                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="text-[24px] font-bold text-[#333333] mb-3 leading-tight hover:text-[#0066cc] transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-[#555555] text-[16px] leading-[1.6] mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-[#777777] text-[14px]">
                    <span>{formatDate(post.published_at)}</span>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes_count}</span>
                    </div>
                  </div>
                </div>
                {post.thumbnail_url && (
                  <Link to={`/blog/${post.slug}`} className="w-full md:w-[320px] shrink-0">
                    <img 
                      src={post.thumbnail_url} 
                      alt={post.title} 
                      className="w-full h-[180px] object-cover rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                    />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && posts.length > 0 && (
          <div className="mt-16 flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-10 h-10 flex items-center justify-center border rounded text-[15px] font-medium transition-colors ${
                    currentPage === number 
                      ? 'bg-[#e6f0fa] border-[#0066cc] text-[#0066cc]' 
                      : 'border-[#cccccc] text-[#555555] hover:border-[#999999]'
                  }`}
                >
                  {number}
                </button>
              ))}
              {totalPages > 7 && (
                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  className="px-4 h-10 flex items-center justify-center border border-[#cccccc] rounded text-[15px] font-medium text-[#333333] hover:border-[#999999] transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
            <p className="text-[#777777] text-[14px]">
              Page <span className="font-bold text-[#333333]">{currentPage}</span> of {totalPages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
