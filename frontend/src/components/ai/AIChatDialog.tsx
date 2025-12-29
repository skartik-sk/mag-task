import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api';
import type { Task } from '@/types';

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatDialog({ open, onOpenChange }: AIChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you analyze your tasks, find upcoming deadlines, prioritize work, and answer questions about your task list. What would you like to know?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: tasksData } = useQuery({
    queryKey: ['tasks-for-ai'],
    queryFn: async () => {
      const response = await api.get('/tasks?limit=100');
      return response.data;
    },
    enabled: open,
  });

  const generateSmartResponse = (question: string, tasks: Task[]) => {
    const q = question.toLowerCase();
    
    if (q.includes('upcoming') || q.includes('deadline') || q.includes('due') || q.includes('next')) {
      const upcoming = tasks
        .filter(t => t.status !== 'completed')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
      
      if (upcoming.length === 0) {
        return "You don't have any pending tasks! Great job staying on top of things! 🎉";
      }
      
      const taskList = upcoming.map((t, i) => {
        const date = new Date(t.dueDate);
        const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const urgency = daysUntil < 2 ? '🔴 URGENT' : daysUntil < 7 ? '🟡' : '🟢';
        return `${i + 1}. ${urgency} ${t.title} - Due in ${daysUntil} days (${date.toLocaleDateString()}) [${t.priority}]`;
      }).join('\n');
      
      return `Here are your upcoming tasks:\n\n${taskList}\n\nFocus on the urgent ones first!`;
    }
    
    if (q.includes('priority') || q.includes('focus') || q.includes('important')) {
      const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
      const high = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
      
      if (urgent.length > 0) {
        return `🔴 You have ${urgent.length} URGENT ${urgent.length === 1 ? 'task' : 'tasks'}:\n\n${urgent.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}\n\nThese should be your top priority!`;
      } else if (high.length > 0) {
        return `You have ${high.length} high-priority ${high.length === 1 ? 'task' : 'tasks'}. Focus on:\n\n${high.slice(0, 3).map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`;
      } else {
        return "Great! You don't have any urgent or high-priority tasks pending. Keep up the good work! ✨";
      }
    }
    
    if (q.includes('how many') || q.includes('count') || q.includes('status') || q.includes('summary')) {
      const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length,
      };
      
      const completionRate = tasks.length > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;
      
      return `📊 Task Summary:\n\n` +
        `Total Tasks: ${stats.total}\n` +
        `✅ Completed: ${stats.completed}\n` +
        `🔄 In Progress: ${stats.inProgress}\n` +
        `⏳ Pending: ${stats.pending}\n` +
        `🔴 Urgent: ${stats.urgent}\n\n` +
        `Completion Rate: ${completionRate}%\n\n` +
        (stats.urgent > 0 ? `⚠️ You have ${stats.urgent} urgent ${stats.urgent === 1 ? 'task' : 'tasks'} needing attention!` : 'Keep up the great work!');
    }
    
    return `I can help you with:\n\n` +
      `• 📅 Upcoming deadlines - Ask "What's due soon?"\n` +
      `• 🎯 Priority suggestions - Ask "What should I focus on?"\n` +
      `• 📊 Task statistics - Ask "Show me my task summary"\n\n` +
      `What would you like to know?`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const tasks: Task[] = tasksData?.tasks || [];
      const response = generateSmartResponse(input, tasks);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Task Assistant
          </DialogTitle>
          <DialogDescription>
            Ask me about your tasks, deadlines, or priorities!
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 px-6 pb-6 pt-4 border-t">
          <Input
            placeholder="Ask about your tasks..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}