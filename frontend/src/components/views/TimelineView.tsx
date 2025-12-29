import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types';
import TaskDetailSheet from '@/components/tasks/TaskDetailSheet';

interface TimelineViewProps {
  tasks: Task[];
  onRefetch: () => void;
}

const priorityColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export default function TimelineView({ tasks, onRefetch }: TimelineViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const groupedTasks = sortedTasks.reduce((acc, task) => {
    const date = format(parseISO(task.dueDate), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedTasks).map(([date, dayTasks]) => (
        <div key={date} className="relative">
          <div className="sticky top-20 z-10 bg-background py-2 mb-4">
            <h3 className="text-lg font-semibold">
              {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
            </h3>
          </div>
          
          <div className="space-y-3 pl-6 border-l-2 border-border">
            {dayTasks.map((task) => (
              <div key={task._id} className="relative">
                <div className="absolute -left-[26px] top-3 w-3 h-3 rounded-full bg-primary border-4 border-background" />
                <Card
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={`${priorityColors[task.priority]} text-white border-0`}
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}

      {sortedTasks.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No tasks to display</p>
        </Card>
      )}

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
