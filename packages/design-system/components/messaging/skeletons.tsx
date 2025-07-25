import { cn } from '../../lib/utils';
import { Skeleton } from '../ui/skeleton';

// Message list skeleton
export function MessageListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Conversation skeleton
export function ConversationSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              i % 3 === 0 ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "space-y-2 max-w-xs",
              i % 3 === 0 ? "items-end" : "items-start"
            )}>
              <Skeleton className="h-4 w-20" />
              <Skeleton className={cn(
                "h-10 rounded-lg",
                i % 3 === 0 ? "w-32" : "w-40"
              )} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

// Chat input skeleton
export function ChatInputSkeleton() {
  return (
    <div className="flex items-center space-x-2 p-4 border-t">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-10 flex-1 rounded-lg" />
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
  );
}

// Message bubble skeleton
export function MessageBubbleSkeleton({ 
  isOwn = false 
}: { 
  isOwn?: boolean 
}) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-xs space-y-1",
        isOwn ? "items-end" : "items-start"
      )}>
        <Skeleton className="h-3 w-16" />
        <Skeleton className={cn(
          "h-10 rounded-lg",
          isOwn ? "w-32" : "w-40"
        )} />
      </div>
    </div>
  );
}