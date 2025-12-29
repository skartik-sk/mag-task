import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckCircle2,
  Calendar,
  Users,
  Target,
  Search,
  ListTodo,
  ArrowRight,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ListTodo className="w-6 h-6" />,
      title: 'Task Management',
      description: 'Create, edit, and organize tasks with ease. Keep everything in one place.',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Multiple Views',
      description: 'Switch between Calendar, Timeline, and List views for different perspectives.',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Priority System',
      description: 'Color-coded priority levels help you focus on what matters most.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Collaboration',
      description: 'Assign tasks to team members and work together seamlessly.',
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Smart Search',
      description: 'Find team members by email and add them instantly.',
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: 'Status Tracking',
      description: 'Track progress from pending to completion effortlessly.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full border-b border-border/40">
        <div className="max-w-[1060px] mx-auto px-4">
          <nav className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-8">
              <div className="text-foreground font-semibold text-lg">Task Manager</div>
            </div>
            <Button variant="ghost" onClick={() => navigate('/login')} className="rounded-full">
              Log in
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        <div className="max-w-[1060px] mx-auto px-4">
          <div className="flex flex-col items-center gap-12">
            <div className="max-w-[937px] flex flex-col items-center gap-3">
              <div className="flex flex-col items-center gap-6">
                <h1 className="max-w-[800px] text-center text-foreground text-5xl md:text-[80px] font-normal leading-tight md:leading-[96px] font-serif">
                  Effortless task management for modern teams
                </h1>
                
                <p className="max-w-[600px] text-center text-muted-foreground text-lg font-medium leading-7">
                  Streamline your workflow with seamless collaboration, multiple views, and intelligent priority management.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="h-12 px-12 font-medium text-sm shadow-md"
              >
                Start for free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="h-12 px-12 font-medium text-sm"
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="border-t border-border py-20">
        <div className="max-w-[1060px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Everything you need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you stay organized and productive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-foreground text-base font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border py-20">
        <div className="max-w-[1060px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">Get started in four simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '01', title: 'Sign Up', description: 'Create your account with just an email' },
              { number: '02', title: 'Create Tasks', description: 'Add your first task in seconds' },
              { number: '03', title: 'Collaborate', description: 'Invite team members to collaborate' },
              { number: '04', title: 'Track Progress', description: 'Monitor and complete your tasks' },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary/20 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/3 -right-4 w-8 h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-20">
        <div className="max-w-[1060px] mx-auto px-4">
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="text-3xl md:text-5xl font-serif max-w-2xl">
              Ready to transform your workflow?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Join teams who trust Task Manager for their daily productivity
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="h-12 px-12 rounded-full font-medium text-sm shadow-md"
            >
              Get started today
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-[1060px] mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">&copy; 2024 Task Manager. Built with Vintage Paper theme.</p>
        </div>
      </footer>
    </div>
  );
}
