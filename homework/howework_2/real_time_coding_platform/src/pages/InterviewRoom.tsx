import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviewRoom } from '@/hooks/useInterviewRoom';
import { executeCode } from '@/lib/codeExecution';
import CodeEditor from '@/components/CodeEditor';
import ConsoleOutput from '@/components/ConsoleOutput';
import InterviewHeader from '@/components/InterviewHeader';
import LanguageSelector from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Loader2 } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

const InterviewRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const {
    room,
    currentUser,
    isConnected,
    isLoading,
    joinRoom,
    updateCode,
    updateLanguage,
    addConsoleMessage,
    clearConsole,
    leaveRoom,
  } = useInterviewRoom(roomId);

  // Determine if user needs to join (not already connected as host or participant)
  const needsJoin = !isConnected || !currentUser;

  useEffect(() => {
    if (!isLoading && !room && roomId) {
      // Room doesn't exist
      navigate('/', { replace: true });
    }
  }, [isLoading, room, roomId, navigate]);

  const handleJoin = () => {
    if (!userName.trim() || !roomId) return;
    
    setIsJoining(true);
    const success = joinRoom(roomId, userName.trim());
    setIsJoining(false);
    
    if (!success) {
      navigate('/', { replace: true });
    }
  };

  const handleRunCode = useCallback(async () => {
    if (!room || !currentUser) return;

    setIsExecuting(true);
    addConsoleMessage('user', '', currentUser.name);

    const result = await executeCode(room.code, room.language.id);

    if (result.output) {
      addConsoleMessage('output', result.output);
    }
    if (result.error) {
      addConsoleMessage('error', result.error);
    }

    setIsExecuting(false);
  }, [room, currentUser, addConsoleMessage]);

  const handleLeave = () => {
    leaveRoom();
    navigate('/', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (needsJoin && room && !isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-card rounded-lg border border-border animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-2">Join Interview</h2>
          <p className="text-muted-foreground mb-6">
            Enter your name to join "{room.title}"
          </p>
          
          <div className="space-y-4">
            <Input
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="bg-secondary border-border"
            />
            <Button 
              onClick={handleJoin} 
              disabled={!userName.trim() || isJoining}
              className="w-full"
            >
              {isJoining ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Join Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!room || !currentUser) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <InterviewHeader
        title={room.title}
        participants={room.participants}
        roomId={room.id}
        onLeave={handleLeave}
      />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={65} minSize={40}>
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-editor-bg">
              <CodeEditor
                code={room.code}
                language={room.language.monacoId}
                onChange={updateCode}
              />
            </div>
            
            <div className="flex items-center justify-between px-4 py-3 bg-header border-t border-panel-border">
              <Button
                variant="run"
                onClick={handleRunCode}
                disabled={isExecuting || !room.language.canExecuteInBrowser}
                className="gap-2"
              >
                {isExecuting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Run
              </Button>

              <LanguageSelector
                selectedLanguage={room.language}
                onLanguageChange={updateLanguage}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-panel-border" />

        <ResizablePanel defaultSize={35} minSize={25}>
          <ConsoleOutput
            messages={room.consoleMessages}
            onClear={clearConsole}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default InterviewRoom;
