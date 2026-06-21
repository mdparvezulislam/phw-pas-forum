import { ContentRenderer } from "@/modules/editor/components";
import type { PostWithAuthor } from "@/modules/post/types";

interface PostContentProps {
  post: PostWithAuthor;
}

export function PostContent({ post }: PostContentProps) {
  // Prefer the structured TipTap JSON; fall back to legacy plain text.
  const content = post.contentJson ?? post.content;

  return (
    <div className="p-4">
      <ContentRenderer content={content} />
    </div>
  );
}
