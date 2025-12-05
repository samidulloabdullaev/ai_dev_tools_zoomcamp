import { Button } from '@/components/ui/button';
import { Participant } from '@/hooks/useInterviewRoom';
import { FileCode, Lock, Phone, Copy, Users, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface InterviewHeaderProps {
  title: string;
  participants: Participant[];
  roomId: string;
  onLeave: () => void;
}

const InterviewHeader = ({ title, participants, roomId, onLeave }: InterviewHeaderProps) => {
  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success('Room link copied to clipboard!');
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-header border-b border-panel-border">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="panel" size="sm" className="gap-2">
            <FileCode className="h-4 w-4" />
            Snippets
          </Button>
          <Button variant="panel" size="sm" className="gap-2">
            <Lock className="h-4 w-4" />
            Pad Privacy
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-md">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{participants.length}</span>
          <div className="flex -space-x-2">
            {participants.slice(0, 3).map((p, i) => (
              <div
                key={p.id}
                className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-medium text-accent-foreground border-2 border-secondary"
                title={p.name}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {participants.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-secondary">
                +{participants.length - 3}
              </div>
            )}
          </div>
        </div>

        <Button variant="panel" size="sm" className="gap-2" onClick={copyRoomLink}>
          <Copy className="h-4 w-4" />
          Copy Link
        </Button>

        <Button variant="outline" size="sm" className="gap-2 text-accent border-accent hover:bg-accent hover:text-accent-foreground">
          <Phone className="h-4 w-4" />
          Make Call
        </Button>

        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive" onClick={onLeave}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default InterviewHeader;
