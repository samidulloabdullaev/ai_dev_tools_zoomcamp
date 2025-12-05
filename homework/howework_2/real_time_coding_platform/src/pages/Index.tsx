import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewRoom, checkRoomExists } from '@/hooks/useInterviewRoom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code2, Users, Zap, Share2, Play, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinError, setJoinError] = useState('');
  const { createRoom } = useInterviewRoom();

  const handleCreateRoom = () => {
    if (!hostName.trim()) return;
    const roomId = createRoom(hostName.trim(), sessionTitle.trim() || 'Interview Session');
    navigate(`/room/${roomId}`);
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) return;
    
    const roomExists = checkRoomExists(joinRoomId.trim());
    if (!roomExists) {
      setJoinError('Room not found. Please check the room ID and try again.');
      toast.error('Room not found', {
        description: 'The room ID you entered does not exist or the session has ended.',
      });
      return;
    }
    
    setJoinError('');
    navigate(`/room/${joinRoomId.trim()}`);
  };

  const features = [
    {
      icon: Code2,
      title: 'Syntax Highlighting',
      description: 'Support for JavaScript, TypeScript, Python, Java, C++, and Go',
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'See code changes instantly as candidates type',
    },
    {
      icon: Zap,
      title: 'In-Browser Execution',
      description: 'Run JavaScript and TypeScript code directly in the browser',
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description: 'Share a simple link to invite candidates to your session',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Real-time Collaborative Coding</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Conduct Technical Interviews
              <br />
              <span className="text-primary">Like Never Before</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A powerful platform for live coding interviews. Share a link, collaborate in real-time, 
              and evaluate candidates with instant code execution.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Create Session Card */}
            <div className="bg-card border border-border rounded-xl p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Start New Session</h2>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder="Your name"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="bg-secondary border-border"
                />
                <Input
                  placeholder="Session title (optional)"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="bg-secondary border-border"
                />
                <Button 
                  onClick={handleCreateRoom}
                  disabled={!hostName.trim()}
                  className="w-full gap-2"
                >
                  Create Interview Room
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Join Session Card */}
            <div className="bg-card border border-border rounded-xl p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Join Session</h2>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder="Enter room ID"
                  value={joinRoomId}
                  onChange={(e) => {
                    setJoinRoomId(e.target.value);
                    setJoinError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  className={`bg-secondary border-border ${joinError ? 'border-destructive' : ''}`}
                />
                {joinError ? (
                  <p className="text-sm text-destructive">{joinError}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Paste the room ID or link shared by your interviewer
                  </p>
                )}
                <Button 
                  onClick={handleJoinRoom}
                  disabled={!joinRoomId.trim()}
                  variant="outline"
                  className="w-full gap-2"
                >
                  Join Room
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">
          Everything You Need for Technical Interviews
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Built for seamless technical interviews. Real-time collaboration made simple.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
