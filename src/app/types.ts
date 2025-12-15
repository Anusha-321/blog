export interface BlogPost {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  createdAt: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  isDraft?: boolean;
  userId?: string;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  userEmail?: string;
  replies?: Comment[];
}

export interface Bookmark {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}
