import type { ReactNode } from 'react';
import { useState, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ListTodo,
  LogOut,
  Menu,
  CheckSquare,
  Sparkles,
  User,
  Settings,
  Filter,
} from 'lucide-react';
import AIChatDialog from '@/components/ai/AIChatDialog';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface FilterContextType {
  priorityFilter: string[];
  statusFilter: string[];
  setPriorityFilter: (value: string[]) => void;
  setStatusFilter: (value: string[]) => void;
  togglePriority: (value: string) => void;
  toggleStatus: (value: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within DashboardLayout');
  }
  return context;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const togglePriority = (value: string) => {
    setPriorityFilter(prev =>
      prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
    );
  };

  const toggleStatus = (value: string) => {
    setStatusFilter(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <ListTodo className="w-5 h-5" />, label: 'All Tasks', path: '/dashboard/tasks' },
  ];

  const filterOptions = {
    priority: [
      { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
      { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
      { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
    ],
    status: [
      { value: 'pending', label: 'Pending' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
    ],
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl">Task Manager</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              navigate(item.path);
              setMobileMenuOpen(false);
            }}
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
          </Button>
        ))}

        {/* Filters Section - Only show on tasks page */}
        {location.pathname.includes('/tasks') && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filters</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-medium px-2">Priority</p>
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.priority.map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      size="sm"
                      onClick={() => togglePriority(option.value)}
                      className={`${priorityFilter.includes(option.value) ? option.color : ''} hover:opacity-80 border-border transition-colors`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium px-2">Status</p>
                <div className="flex flex-col gap-1">
                  {filterOptions.status.map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(option.value)}
                      className={`justify-center border-border hover:bg-accent transition-colors ${
                        statusFilter.includes(option.value) ? 'bg-accent' : ''
                      }`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <Separator className="my-4" />
          </>
        )}

        {/* AI Assistant Button */}
        <Button
          variant="outline"
          className="w-full justify-start border-primary/20 hover:bg-primary/10"
          onClick={() => {
            setAiChatOpen(true);
            setMobileMenuOpen(false);
          }}
        >
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="ml-2">AI Assistant</span>
        </Button>
      </nav>

      {/* User Section at Bottom */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user && getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              navigate('/dashboard/settings');
              setMobileMenuOpen(false);
            }}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              navigate('/dashboard/settings');
              setMobileMenuOpen(false);
            }}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <FilterContext.Provider value={{
      priorityFilter,
      statusFilter,
      setPriorityFilter,
      setStatusFilter,
      togglePriority,
      toggleStatus,
    }}>
      <div className="min-h-screen bg-background">
        {/* Mobile Header ONLY */}
        <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-primary" />
                <span className="font-bold text-xl">Tasks</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user && getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Sidebar - Desktop (NO HEADER) */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col border-r bg-background">
            <SidebarContent />
          </div>
        </div>

        {/* Main Content - No padding top on desktop */}
        <main className="lg:pl-72 lg:pt-0 pt-16">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>

        {/* AI Chat Dialog */}
        <AIChatDialog open={aiChatOpen} onOpenChange={setAiChatOpen} />
      </div>
    </FilterContext.Provider>
  );
}
