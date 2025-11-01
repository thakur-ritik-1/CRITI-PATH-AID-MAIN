import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PERTActivity, ComputedPERTActivity } from '@/types/pert';
import { CPMResult, TimeUnit } from '@/types/activity';
import { PERTActivityTable } from '@/components/PERTActivityTable';
import { PERTResultsTable } from '@/components/PERTResultsTable';
import { NetworkDiagram } from '@/components/NetworkDiagram';
import { GanttChart } from '@/components/GanttChart';
import { PERTCalculator } from '@/utils/pertCalculator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Network, 
  BarChart3, 
  Table, 
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

const SAMPLE_PERT: PERTActivity[] = [
  { id: 'A', name: 'Task A', optimistic: 1, mostLikely: 2, pessimistic: 3, predecessors: [] },
  { id: 'B', name: 'Task B', optimistic: 2, mostLikely: 3, pessimistic: 4, predecessors: [] },
  { id: 'C', name: 'Task C', optimistic: 1, mostLikely: 2, pessimistic: 9, predecessors: ['A'] },
  { id: 'D', name: 'Task D', optimistic: 2, mostLikely: 4, pessimistic: 6, predecessors: ['A', 'B'] },
  { id: 'E', name: 'Task E', optimistic: 1, mostLikely: 3, pessimistic: 5, predecessors: ['C', 'D'] },
];

const PERT = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<PERTActivity[]>(SAMPLE_PERT);
  const [result, setResult] = useState<(CPMResult & { pertActivities: ComputedPERTActivity[] }) | null>(null);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('days');
  const [activeTab, setActiveTab] = useState('input');

  const handleCompute = () => {
    if (activities.length === 0) {
      toast.error('Please add at least one activity');
      return;
    }

    const calculator = new PERTCalculator(activities);
    const computedResult = calculator.compute();
    
    if (computedResult.errors && computedResult.errors.length > 0) {
      computedResult.errors.forEach(error => toast.error(error));
      setResult(computedResult);
      return;
    }

    if (computedResult.warnings && computedResult.warnings.length > 0) {
      computedResult.warnings.forEach(warning => toast(warning, { icon: '⚠️' }));
    }

    setResult(computedResult);
    setActiveTab('results');
    toast.success('PERT computed successfully!');
  };

  const handleExportCSV = () => {
    if (!result || result.pertActivities.length === 0) {
      toast.error('No computed results to export');
      return;
    }

    const csv = [
      'id,name,optimistic,most_likely,pessimistic,expected_duration,es,ef,ls,lf,total_float,free_float,critical',
      ...result.pertActivities.map(a => 
        `${a.id},${a.name},${a.optimistic},${a.mostLikely},${a.pessimistic},${a.expectedDuration.toFixed(2)},${a.es},${a.ef},${a.ls},${a.lf},${a.totalFloat},${a.freeFloat},${a.isCritical}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pert-results.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Results exported to CSV');
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">PERT Planner</h1>
                <p className="text-muted-foreground mt-1">
                  Program Evaluation and Review Technique with Three-Time Estimates
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="input" className="gap-2">
              <Table className="h-4 w-4" />
              Input
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2" disabled={!result}>
              <FileSpreadsheet className="h-4 w-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="network" className="gap-2" disabled={!result}>
              <Network className="h-4 w-4" />
              Network
            </TabsTrigger>
            <TabsTrigger value="gantt" className="gap-2" disabled={!result}>
              <BarChart3 className="h-4 w-4" />
              Gantt
            </TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PERT Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <PERTActivityTable activities={activities} onChange={setActivities} />
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleCompute} size="lg" className="gap-2">
                    <Clock className="h-5 w-5" />
                    Compute PERT
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Use PERT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  1. <strong>Add activities</strong>: Enter unique IDs, names, and three time estimates for each activity.
                </p>
                <p>
                  2. <strong>Three-time estimates</strong>: Provide Best (optimistic), Average (most likely), and Worst (pessimistic) times.
                </p>
                <p>
                  3. <strong>Expected duration</strong>: Automatically calculated using the PERT formula: (Best + 4×Average + Worst) ÷ 6
                </p>
                <p>
                  4. <strong>Compute PERT</strong>: Click the compute button to calculate ES, EF, LS, LF, and identify critical paths.
                </p>
                <p>
                  5. <strong>Visualize</strong>: View results in table, network diagram, or Gantt chart format.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {result && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Project Duration</p>
                          <p className="text-2xl font-bold">{result.projectDuration.toFixed(2)} {timeUnit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-critical/10">
                          <AlertCircle className="h-6 w-6 text-critical" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Critical Activities</p>
                          <p className="text-2xl font-bold">
                            {result.pertActivities.filter(a => a.isCritical).length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-success/10">
                          <CheckCircle className="h-6 w-6 text-success" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Critical Paths</p>
                          <p className="text-2xl font-bold">{result.criticalPaths.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Errors/Warnings */}
                {result.errors && result.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {result.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {result.warnings && result.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {result.warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Critical Paths */}
                {result.criticalPaths.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Critical Paths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.criticalPaths.map((path, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Path {idx + 1}:
                            </span>
                            <div className="flex items-center gap-2">
                              {path.map((id, i) => (
                                <span key={i} className="flex items-center gap-2">
                                  <span className="px-2 py-1 rounded bg-critical text-critical-foreground text-sm font-medium">
                                    {id}
                                  </span>
                                  {i < path.length - 1 && (
                                    <span className="text-muted-foreground">→</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Results Table */}
                <Card>
                  <CardContent className="pt-6">
                    <PERTResultsTable activities={result.pertActivities} onExport={handleExportCSV} />
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network">
            <Card>
              <CardHeader>
                <CardTitle>Network Diagram</CardTitle>
              </CardHeader>
              <CardContent>
                {result && (
                  <NetworkDiagram
                    activities={result.activities}
                    criticalPaths={result.criticalPaths}
                    aoaNetwork={result.aoaNetwork}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gantt Tab */}
          <TabsContent value="gantt">
            <Card>
              <CardHeader>
                <CardTitle>Gantt Chart</CardTitle>
              </CardHeader>
              <CardContent>
                {result && <GanttChart activities={result.activities} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PERT;
