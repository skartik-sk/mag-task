import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types';
import TaskDetailSheet from '@/components/tasks/TaskDetailSheet';

interface CalendarViewProps {
  tasks: Task[];
  onRefetch: () => void;
  onDateClick?: (date: Date) => void;
}

const priorityColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export default function CalendarView({ tasks, onRefetch, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const tasksOnDay = (day: Date) => {
    return tasks.filter((task) => isSameDay(new Date(task.dueDate), day));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-sm py-2">
            {day}
          </div>
        ))}
        
        {days.map((day) => {
          const dayTasks = tasksOnDay(day);
          return (
            <Card
              key={day.toString()}
              className={`min-h-24 p-2 cursor-pointer hover:bg-accent/50 transition-colors ${isToday(day) ? 'border-primary border-2' : ''}`}
              onClick={() => onDateClick?.(day)}
            >
              <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
              <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                {dayTasks.slice(0, 2).map((task) => (
                  <button
                    key={task._id}
                    onClick={() => setSelectedTask(task)}
                    className={`w-full text-left text-xs p-1 rounded ${
                      priorityColors[task.priority]
                    } text-white truncate hover:opacity-80`}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onSuccess={onRefetch}
        />
      )}
    </div>
  );
}
