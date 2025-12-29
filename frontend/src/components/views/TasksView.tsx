import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ListView from './ListView';
import CalendarView from './CalendarView';
import TimelineView from './TimelineView';
import CreateTaskDialog from '@/components/tasks/CreateTaskDialog';
import { useFilters } from '@/components/layout/DashboardLayout';
import type { TasksResponse, ViewMode } from '@/types';

export default function TasksView() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const { priorityFilter, statusFilter } = useFilters();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tasks', page, priorityFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '100', // Increase to show all tasks
      });
      
      if (priorityFilter.length > 0) {
        params.append('priority', priorityFilter.join(','));
      }
      if (statusFilter.length > 0) {
        params.append('status', statusFilter.join(','));
      }
      
      const response = await api.get<TasksResponse>(`/tasks?${params}`);
      return response.data;
    },
  });

  // Filter tasks locally based on selected filters
  const filteredTasks = (data?.tasks || []).filter((task: any) => {
    if (priorityFilter.length > 0 && !priorityFilter.includes(task.priority)) {
      return false;
    }
    if (statusFilter.length > 0 && !statusFilter.includes(task.status)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your tasks
          </p>
        </div>
        <Button onClick={() => {
          setSelectedDate(null);
          setCreateDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <ListView
            tasks={filteredTasks}
            isLoading={isLoading}
            pagination={data?.pagination}
            onPageChange={setPage}
            onRefetch={refetch}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView 
            tasks={filteredTasks} 
            onRefetch={refetch}
            onDateClick={(date) => {
              setSelectedDate(date);
              setCreateDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <TimelineView tasks={filteredTasks} onRefetch={refetch} />
        </TabsContent>
      </Tabs>

      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        initialDate={selectedDate}
        onSuccess={() => {
          setCreateDialogOpen(false);
          setSelectedDate(null);
          refetch();
        }}
      />
    </div>
  );
}
