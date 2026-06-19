interface ForumHeaderProps {
  title: string;
  description: string | null;
  icon: string | null;
}

export function ForumHeader({ title, description, icon }: ForumHeaderProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-card p-6">
      {icon && (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="mt-1 text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
