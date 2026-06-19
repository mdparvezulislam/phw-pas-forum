import type { PostWithAuthor } from "@/modules/post/types";

interface PostContentProps {
  post: PostWithAuthor;
}

export function PostContent({ post }: PostContentProps) {
  return (
    <div className="p-4">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {post.content}
      </div>
    </div>
  );
}
