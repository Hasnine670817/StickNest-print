import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageSquare, Heart, ArrowLeft, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail_url: string;
  published_at: string;
  likes_count: number;
  comments_count: number;
}

interface BlogComment {
  id: string;
  blog_id: string;
  content: string;
  created_at: string;
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [morePosts, setMorePosts] = useState<BlogPost[]>([]);
  const [isLiking, setIsLiking] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [hasLiked, setHasLiked] = useState(false);
  const { user } = useAuth();
  
  // Get or create a guest ID for non-logged in users to track their likes
  const getUserId = () => {
    if (user) return user.id;
    let guestId = localStorage.getItem('guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guest_id', guestId);
    }
    return guestId;
  };

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (post) {
        const userId = getUserId();
        try {
          const { data, error } = await supabase
            .from('blog_likes')
            .select('id')
            .eq('blog_id', post.id)
            .eq('user_id', userId)
            .maybeSingle();
            
          if (data) {
            setHasLiked(true);
          } else {
            setHasLiked(false);
          }
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      }
    };
    
    checkLikeStatus();
  }, [post?.id, user?.id]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', postSlug)
        .single();

      if (error) throw error;
      setPost(data);

      // Fetch comments
      if (data) {
        const { data: commentsData } = await supabase
          .from('blog_comments')
          .select('*')
          .eq('blog_id', data.id)
          .order('created_at', { ascending: false });
          
        if (commentsData) {
          setComments(commentsData);
        }
      }

      // Fetch more posts
      if (data) {
        const { data: moreData } = await supabase
          .from('blogs')
          .select('*')
          .neq('id', data.id)
          .order('published_at', { ascending: false })
          .limit(4);
        
        if (moreData) {
          setMorePosts(moreData);
        }
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post || isLiking) return;
    
    try {
      setIsLiking(true);
      const userId = getUserId();
      
      if (hasLiked) {
        // Remove like
        const { error: deleteError } = await supabase
          .from('blog_likes')
          .delete()
          .eq('blog_id', post.id)
          .eq('user_id', userId);
          
        if (deleteError) throw deleteError;
        
        const newLikesCount = Math.max(0, post.likes_count - 1);
        await supabase.from('blogs').update({ likes_count: newLikesCount }).eq('id', post.id);
        
        setPost({ ...post, likes_count: newLikesCount });
        setHasLiked(false);
      } else {
        // Add like
        const { error: insertError } = await supabase
          .from('blog_likes')
          .insert([{ blog_id: post.id, user_id: userId }]);
          
        if (insertError) throw insertError;
        
        const newLikesCount = post.likes_count + 1;
        await supabase.from('blogs').update({ likes_count: newLikesCount }).eq('id', post.id);
        
        setPost({ ...post, likes_count: newLikesCount });
        setHasLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!post || !commentText.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      
      // Insert the comment into blog_comments table
      const { data: newComment, error: commentError } = await supabase
        .from('blog_comments')
        .insert([{ blog_id: post.id, content: commentText }])
        .select()
        .single();

      if (commentError) throw commentError;

      const newCommentsCount = post.comments_count + 1;
      
      const { error } = await supabase
        .from('blogs')
        .update({ comments_count: newCommentsCount })
        .eq('id', post.id);

      if (error) throw error;

      setComments([newComment, ...comments]);
      setPost({ ...post, comments_count: newCommentsCount });
      setCommentText(''); // Clear the input
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || 'Check out this blog post!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#f37021] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold text-[#333333] mb-4">Post Not Found</h1>
        <p className="text-[#777777] mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
        <Link to="/blog" className="bg-[#0066cc] hover:bg-[#005bb5] text-white font-bold py-3 px-8 rounded transition-colors">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans pb-24">
      <div className="max-w-[800px] mx-auto px-4 pt-8">
        
        {/* Back Link */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-[#555555] hover:text-[#333333] mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Title */}
        <h1 className="text-[32px] md:text-[40px] font-bold text-[#333333] leading-tight mb-6">
          {post.title}
        </h1>

        {/* Author & Meta */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#5a3a22] rounded-full flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.5 7.5C19.5 7.5 18 6 16.5 6C15 6 13.5 7.5 13.5 7.5L12 9L10.5 7.5C10.5 7.5 9 6 7.5 6C6 6 4.5 7.5 4.5 7.5V10.5L12 18L19.5 10.5V7.5Z" />
              <path d="M12 18L4.5 10.5V19.5H19.5V10.5L12 18Z" opacity="0.5"/>
            </svg>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-[#777777]">
            <span className="font-bold text-[#333333]">Sticker Mule</span>
            <span>{formatDate(post.published_at)}</span>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{post.comments_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current text-red-500' : ''}`} />
              <span>{post.likes_count}</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Image */}
        {post.thumbnail_url && (
          <div className="mb-10">
            <img 
              src={post.thumbnail_url} 
              alt={post.title} 
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-[#333333] prose-p:text-[#333333] prose-a:text-[#0066cc] leading-[1.8] mb-12">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-2 border border-[#cccccc] rounded hover:border-[#999999] transition-colors text-[#555555]"
            >
              <MessageSquare className="w-4 h-4" /> {post.comments_count}
            </button>
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 px-4 py-2 border rounded transition-colors disabled:opacity-50 ${
                hasLiked 
                  ? 'border-red-500 text-red-500 bg-red-50 hover:bg-red-100' 
                  : 'border-[#cccccc] text-[#555555] hover:border-[#999999]'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current text-red-500' : ''}`} /> {post.likes_count}
            </button>
          </div>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 border border-[#cccccc] rounded hover:border-[#999999] transition-colors text-[#555555]"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* Comments Section */}
        <div id="comment-section" className="mb-20">
          <h2 className="text-[28px] font-bold text-[#333333] mb-6">{post.comments_count} comments</h2>
          <div className="mb-10">
            <label className="block text-[14px] font-bold text-[#333333] mb-2">Leave a comment</label>
            <textarea 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full border border-[#cccccc] rounded p-3 min-h-[100px] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-all text-[15px] mb-3"
              placeholder="Share your thoughts or inquiries..."
            ></textarea>
            <div className="flex justify-end">
              <button 
                onClick={handleCommentSubmit}
                disabled={isSubmittingComment || !commentText.trim()}
                className="bg-[#0066cc] hover:bg-[#005bb5] text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingComment ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </div>
          
          {comments.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-[#cccccc]">
                <MessageSquare className="w-12 h-12" />
              </div>
              <h3 className="text-[18px] font-bold text-[#333333] mb-2">No comments yet.</h3>
              <p className="text-[#777777] text-[15px]">Be the first to share your thoughts or inquiries.</p>
            </div>
          ) : (
            <div className="space-y-6 mt-8">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-[#eeeeee] pb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#f37021] text-white rounded-full flex items-center justify-center font-bold text-lg">
                      G
                    </div>
                    <div>
                      <p className="font-bold text-[#333333] text-[15px]">Guest</p>
                      <p className="text-[#777777] text-[13px]">{formatDate(comment.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-[#444444] text-[15px] leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* More from Sticker Mule */}
        {morePosts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[24px] font-bold text-[#333333]">More from Sticker Mule</h2>
              <Link to="/blog" className="text-[#0066cc] font-bold text-[14px] hover:underline">
                View all
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {morePosts.map(morePost => (
                <div key={morePost.id} className="group">
                  <Link to={`/blog/${morePost.slug}`} className="block mb-4 overflow-hidden rounded-lg">
                    {morePost.thumbnail_url ? (
                      <img 
                        src={morePost.thumbnail_url} 
                        alt={morePost.title} 
                        className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </Link>
                  <Link to={`/blog/${morePost.slug}`}>
                    <h3 className="text-[20px] font-bold text-[#333333] leading-tight group-hover:text-[#0066cc] transition-colors">
                      {morePost.title}
                    </h3>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
