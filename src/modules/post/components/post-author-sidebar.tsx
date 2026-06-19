import Image from "next/image";
import { formatDate } from "@/lib/utils";

interface PostAuthorSidebarProps {
  author: {
    id: string;
    username: string | null;
    displayName: string | null;
    image: string | null;
    createdAt: Date;
  };
}

export function PostAuthorSidebar({ author }: PostAuthorSidebarProps) {
  return (
    <div className="w-full shrink-0 border-b bg-muted/30 p-4 md:w-48 md:border-b-0 md:border-r">
      <div className="flex items-center gap-3 md:flex-col md:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl text-primary">
          {author.image ? (
            <Image
              src={author.image}
              alt=""
              width={48}
              height={48}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            (author.displayName ?? author.username ?? "U")
              .charAt(0)
              .toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <div className="font-semibold truncate">
            {author.displayName ?? author.username}
          </div>
          <div className="text-xs text-muted-foreground">
            @{author.username}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Joined {formatDate(author.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
