'use client';

import { Bookmark } from 'lucide-react';
import { usePosts } from '@/context/PostsContext';

interface BookmarkButtonProps {
    postId: string;
}

export default function BookmarkButton({ postId }: BookmarkButtonProps) {
    const { user, isPostBookmarked, bookmarkPost, unbookmarkPost } = usePosts();

    const bookmarked = isPostBookmarked(postId);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert('Please sign in to bookmark posts');
            return;
        }

        if (bookmarked) {
            await unbookmarkPost(postId);
        } else {
            await bookmarkPost(postId);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${bookmarked
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark for later'}
        >
            <Bookmark
                className={`w-5 h-5 ${bookmarked ? 'fill-blue-600' : ''}`}
            />
            {bookmarked && <span className="text-sm font-medium">Saved</span>}
        </button>
    );
}
