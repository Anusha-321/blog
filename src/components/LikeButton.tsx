'use client';

import { Heart } from 'lucide-react';
import { usePosts } from '@/context/PostsContext';

interface LikeButtonProps {
    postId: string;
}

export default function LikeButton({ postId }: LikeButtonProps) {
    const { user, isPostLiked, getLikeCount, likePost, unlikePost } = usePosts();

    const liked = isPostLiked(postId);
    const count = getLikeCount(postId);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert('Please sign in to like posts');
            return;
        }

        if (liked) {
            await unlikePost(postId);
        } else {
            await likePost(postId);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${liked
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
        >
            <Heart
                className={`w-5 h-5 ${liked ? 'fill-red-600' : ''}`}
            />
            <span className="font-medium">{count}</span>
        </button>
    );
}
