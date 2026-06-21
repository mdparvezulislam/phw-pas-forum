import type { Badge } from "@/db/schema/badges";
import type {
  PostReportReason,
  PostReportStatus,
} from "@/db/schema/post-reports";
import type { Post } from "@/db/schema/posts";
import type { UserLevel } from "@/db/schema/user-levels";
import type { UserReputation } from "@/db/schema/user-reputation";

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

export interface PostWithDetails extends PostWithAuthor {
  author: {
    id: string;
    username: string | null;
    displayName: string | null;
    image: string | null;
    createdAt: Date;
    reputation?: UserReputation | null;
    level?: UserLevel | null;
    badges?: Badge[];
  };
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

export interface PostWithReactions extends Post {
  reactions?: Array<{
    type: string;
    count: number;
    hasReacted: boolean;
  }>;
}
