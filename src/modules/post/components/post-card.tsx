import type { PostWithAuthorReputation } from "@/services/post";
import { DeletedPostCard } from "./deleted-post-card";
import { PostAuthorSidebar } from "./post-author-sidebar";
import { PostContent } from "./post-content";
import { PostFooter } from "./post-footer";
import { PostHeader } from "./post-header";

interface PostCardProps {
  post: PostWithAuthorReputation;
  isOwner: boolean;
  isModerator: boolean;
  baseUrl: string;
}

export function PostCard({
  post,
  isOwner,
  isModerator,
  baseUrl,
}: PostCardProps) {
  if (post.status === "DELETED") {
    return <DeletedPostCard postNumber={post.postNumber} />;
  }

  return (
    <div id={`post-${post.postNumber}`} className="scroll-mt-20">
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col md:flex-row">
          <PostAuthorSidebar author={post.author} />

          <div className="flex-1 min-w-0">
            <PostHeader
              post={post}
              isOwner={isOwner}
              isModerator={isModerator}
              baseUrl={baseUrl}
            />

            <PostContent post={post} />

            <PostFooter
              post={post}
              isOwner={isOwner}
              isModerator={isModerator}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
