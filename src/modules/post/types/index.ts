import type { Post, PostStatus } from "@/db/schema/posts";
import type { PostReportStatus, PostReportReason } from "@/db/schema/post-reports";

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    username: string | null;
    displayName: string | null;
    image: string | null;
    createdAt: Date;
  };
}

export interface PostWithRelations extends PostWithAuthor {
  isEdited: boolean;
  editedAt: Date | null;
  history?: PostEditHistoryItem[];
}

export interface PostEditHistoryItem {
  id: string;
  postId: string;
  previousContent: string;
  editedBy: string;
  editedAt: Date;
  reason: string | null;
  editor: {
    id: string;
    username: string | null;
    displayName: string | null;
  };
}

export interface PostReportWithRelations {
  id: string;
  postId: string;
  reporterId: string;
  reason: PostReportReason;
  description: string | null;
  status: PostReportStatus;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  post: {
    id: string;
    content: string;
    postNumber: number;
    thread: {
      id: string;
      title: string;
      slug: string;
    };
    author: {
      id: string;
      username: string | null;
      displayName: string | null;
    };
  };
  reporter: {
    id: string;
    username: string | null;
    displayName: string | null;
  };
}
