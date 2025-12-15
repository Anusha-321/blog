'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePosts } from '@/context/PostsContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TopNav() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const router = useRouter();
    const { posts, user } = usePosts();

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = posts.filter(post => {
                const titleMatch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
                const bodyMatch = post.body.toLowerCase().includes(searchQuery.toLowerCase());
                // You can add author matching here if you have author info
                return titleMatch || bodyMatch;
            });
            setSearchResults(filtered.slice(0, 5)); // Limit to 5 results
            setShowResults(true);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [searchQuery, posts]);

    const handleClearSearch = () => {
        setSearchQuery('');
        setShowResults(false);
    };

    return (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40 md:left-64">
            <div className="max-w-4xl mx-auto px-4 py-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search posts by title or content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery && setShowResults(true)}
                        className="w-full pl-12 pr-10 py-3 bg-gray-50 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    {/* Search Results Dropdown */}
                    {showResults && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                            {searchResults.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/post/${post.id}`}
                                    onClick={() => {
                                        setShowResults(false);
                                        setSearchQuery('');
                                    }}
                                    className="block p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                                >
                                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2">
                                        {post.body.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                    </p>
                                    <div className="text-xs text-gray-400 mt-2">{post.createdAt}</div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {showResults && searchQuery && searchResults.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                            <p className="text-sm text-gray-500 text-center">No posts found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay to close search results */}
            {showResults && (
                <div
                    className="fixed inset-0 -z-10"
                    onClick={() => setShowResults(false)}
                />
            )}
        </div>
    );
}
