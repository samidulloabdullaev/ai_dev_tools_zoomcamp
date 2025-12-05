import { useRef, useEffect } from 'react';
import { ConsoleMessage } from '@/hooks/useInterviewRoom';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface ConsoleOutputProps {
  messages: ConsoleMessage[];
  onClear: () => void;
}

const ConsoleOutput = ({ messages, onClear }: ConsoleOutputProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-console-bg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border">
        <span className="text-sm font-medium text-foreground">Console</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="h-7 px-2 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm scrollbar-thin"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "mb-2 leading-relaxed animate-fade-in",
              message.type === 'error' && "text-destructive",
              message.type === 'info' && "text-syntax-comment",
              message.type === 'output' && "text-foreground",
              message.type === 'user' && "text-accent"
            )}
          >
            {message.type === 'info' && (
              <span className="inline-flex items-center gap-2">
                <span className="status-indicator status-online" />
                <span>{message.content}</span>
              </span>
            )}
            {message.type !== 'info' && (
              <>
                {message.author && (
                  <span className="text-accent mr-2">
                    {message.type === 'user' ? '▸' : ''} Compiling started by {message.author}
                  </span>
                )}
                {message.type === 'output' && (
                  <pre className="whitespace-pre-wrap">{message.content}</pre>
                )}
                {message.type === 'error' && (
                  <span className="text-destructive">Error: {message.content}</span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsoleOutput;
