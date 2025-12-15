'use client';

import { usePosts } from '@/context/PostsContext';
import Link from 'next/link';
import { PenSquare, Plus, MessageCircle } from 'lucide-react';
import LikeButton from '@/components/LikeButton';
import BookmarkButton from '@/components/BookmarkButton';
import RightSidebar from '@/components/RightSidebar';
import { useState } from 'react';

export default function Home() {
  const { posts, user, getComments } = usePosts();
  const [activeTab, setActiveTab] = useState<'foryou' | 'featured'>('foryou');

  const getExcerpt = (text: string, length: number = 140) => {
    // Strip HTML tags first
    const strippedText = text.replace(/<[^>]*>/g, '');
    if (strippedText.length <= length) return strippedText;
    return strippedText.substring(0, length).trim() + '...';
  };

  // Filter out draft posts
  const publishedPosts = posts.filter(post => !post.isDraft);

  return (
    <div className="flex justify-center min-h-screen bg-white">
      <div className="flex w-full max-w-7xl">
        {/* Main Feed */}
        <main className="flex-1 min-w-0 py-8 md:pr-12">
          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-gray-100 mb-8 sticky top-0 bg-white/95 backdrop-blur-sm z-10 pt-2">
            <button
              onClick={() => setActiveTab('foryou')}
              className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'foryou' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              For you
              {activeTab === 'foryou' && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-900" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'featured' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              Featured
              {activeTab === 'featured' && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-900" />
              )}
            </button>
            <button className="ml-auto p-2 text-gray-400 hover:text-gray-900">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {publishedPosts.length === 0 ? (
            <div className="text-center py-32">
              <div className="mb-6">
                <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                  <PenSquare className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No stories yet</h2>
              <p className="text-gray-500 mb-6">
                Start creating amazing content
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Write a story
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {publishedPosts.map((post) => {
                const commentCount = getComments(post.id).length;

                return (
                  <article key={post.id} className="group border-b border-gray-100 pb-10 last:border-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                        {user?.email?.[0].toUpperCase() || 'A'}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {user?.email?.split('@')[0] || 'Author'}
                      </span>
                      <span className="text-gray-400 text-sm">·</span>
                      <span className="text-sm text-gray-500">{post.createdAt}</span>
                    </div>

                    <Link href={`/post/${post.id}`} className="flex justify-between gap-12 group-hover:opacity-100">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors line-clamp-2 leading-tight">
                          {post.title}
                        </h2>
                        <p className="text-gray-500 font-serif text-base mb-4 line-clamp-3 md:line-clamp-2 leading-relaxed hidden sm:block">
                          {getExcerpt(post.body)}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3">
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              Technology
                            </span>
                            <span className="text-xs text-gray-500">4 min read</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <BookmarkButton postId={post.id} />

                            {/* Comment Count */}
                            <div className="flex items-center gap-1 text-gray-500">
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-sm">{commentCount}</span>
                            </div>

                            <LikeButton postId={post.id} />
                          </div>
                        </div>
                      </div>

                      {post.imageUrl && (
                        <div className="w-24 h-24 md:w-40 md:h-28 flex-shrink-0">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      )}
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}
