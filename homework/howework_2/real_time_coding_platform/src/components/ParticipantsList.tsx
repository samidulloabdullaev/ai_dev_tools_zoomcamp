import { Participant } from '@/hooks/useInterviewRoom';
import { Crown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantsListProps {
  participants: Participant[];
  currentUserId?: string;
}

const ParticipantsList = ({ participants, currentUserId }: ParticipantsListProps) => {
  return (
    <div className="flex flex-col gap-1">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
            participant.id === currentUserId ? "bg-primary/10" : "hover:bg-secondary"
          )}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <User className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-foreground truncate">
                {participant.name}
              </span>
              {participant.isHost && (
                <Crown className="h-3.5 w-3.5 text-yellow-500" />
              )}
              {participant.id === currentUserId && (
                <span className="text-xs text-muted-foreground">(you)</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParticipantsList;
