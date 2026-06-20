import { MessageSquare } from "lucide-react";

export default function ConversationsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-muted/10">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MessageSquare className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">No conversation selected</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        Select an existing conversation from the sidebar or click the plus icon to start a new chat with members of the community.
      </p>
    </div>
  );
}
