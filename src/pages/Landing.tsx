import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calculator, Clock } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            CPM and PERT WebApp
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Software Engineering Project by{' '}
            <span className="font-semibold text-foreground">Tanish Singh</span>,{' '}
            <span className="font-semibold text-foreground">Ayushi Nahar</span>, and{' '}
            <span className="font-semibold text-foreground">Ritik Thakur</span>
          </p>
        </div>

        {/* Main Buttons Section */}
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          {/* CPM Button Card */}
          <button
            onClick={() => navigate('/cpm')}
            className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-8 transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1"
          >
            <div className="relative z-10 space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Calculator className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground">CPM</h2>
              <p className="text-muted-foreground">
                Critical Path Method for project scheduling with single duration estimates
              </p>
              <div className="pt-2">
                <span className="text-sm font-medium text-primary group-hover:underline">
                  Launch CPM Calculator →
                </span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* PERT Button Card */}
          <button
            onClick={() => navigate('/pert')}
            className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-8 transition-all duration-300 hover:border-accent hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1"
          >
            <div className="relative z-10 space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Clock className="h-12 w-12 text-accent" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground">PERT</h2>
              <p className="text-muted-foreground">
                Program Evaluation and Review Technique with three-time estimates
              </p>
              <div className="pt-2">
                <span className="text-sm font-medium text-accent group-hover:underline">
                  Launch PERT Calculator →
                </span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground animate-in fade-in duration-700 delay-300">
          <p>
            Developed as a Software Engineering Project by Tanish Singh, Ayushi Nahar, and Ritik Thakur
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
