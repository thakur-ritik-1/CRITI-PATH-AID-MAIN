import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, TimeUnit } from '@/types/activity';
import { ActivityTable } from '@/components/ActivityTable';
import { ResultsTable } from '@/components/ResultsTable';
import { NetworkDiagram } from '@/components/NetworkDiagram';
import { GanttChart } from '@/components/GanttChart';
import { PERTCalculator } from '@/utils/pertCalculator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Network, 
  Table, 
  Upload, 
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  ArrowLeft,
  Sigma,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

// Sample PERT data
const SAMPLE_PERT: Activity[] = [
  { 
    id: 'A', 
    name: 'Task A', 
    duration: 2, // This will be calculated from three estimates
    predecessors: [],
    optimistic: 1,
    mostLikely: 2, 
    pessimistic: 3
  },
  { 
    id: 'B', 
    name: 'Task B', 
    duration: 3,
    predecessors: [],
    optimistic: 2,
    mostLikely: 3,
    pessimistic: 4
  },
  { 
    id: 'C', 
    name: 'Task C', 
    duration: 3,
    predecessors: ['A'],
    optimistic: 1,
    mostLikely: 2,
    pessimistic: 9
  },
  { 
    id: 'D', 
    name: 'Task D', 
    duration: 4,
    predecessors: ['A', 'B'],
    optimistic: 2,
    mostLikely: 4,
    pessimistic: 6
  },
  { 
    id: 'E', 
    name: 'Task E', 
    duration: 3,
    predecessors: ['C', 'D'],
    optimistic: 1,
    mostLikely: 3,
    pessimistic: 5
  },
];

const PERT = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>(SAMPLE_PERT);
  const [result, setResult] = useState<any>(null);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('days');
  const [activeTab, setActiveTab] = useState('input');

  const handleCompute = () => {
    if (activities.length === 0) {
      toast.error('Please add at least one activity');
      return;
    }

    try {
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
    } catch (error) {
      toast.error('Error computing PERT analysis');
      console.error('PERT computation error:', error);
    }
  };

  const handleLoadSample = (sample: 'simple' | 'complex') => {
    setActivities(SAMPLE_PERT);
    setResult(null);
    setActiveTab('input');
    toast.success('Loaded PERT sample project');
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic CSV import - you can enhance this for PERT specific fields
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const importedActivities: Activity[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const [id, name, optimistic, mostLikely, pessimistic, predecessors] = line.split(',');
          if (id && name) {
            importedActivities.push({
              id: id.trim(),
              name: name.trim(),
              duration: (parseFloat(optimistic) + 4 * parseFloat(mostLikely) + parseFloat(pessimistic)) / 6,
              predecessors: predecessors ? predecessors.split(';').map(p => p.trim()).filter(Boolean) : [],
              optimistic: parseFloat(optimistic) || 0,
              mostLikely: parseFloat(mostLikely) || 0,
              pessimistic: parseFloat(pessimistic) || 0
            });
          }
        }
        
        if (importedActivities.length > 0) {
          setActivities(importedActivities);
          setResult(null);
          setActiveTab('input');
          toast.success(`Imported ${importedActivities.length} PERT activities`);
        } else {
          toast.error('No valid activities found in CSV');
        }
      } catch (error) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExportCSV = () => {
    if (!result || !result.activities || result.activities.length === 0) {
      toast.error('No computed results to export');
      return;
    }

    const csv = [
      'id,name,optimistic,most_likely,pessimistic,expected_duration,es,ef,ls,lf,total_float,free_float,critical',
      ...result.activities.map((a: any) => 
        `${a.id},${a.name},${a.optimistic || ''},${a.mostLikely || ''},${a.pessimistic || ''},${a.duration?.toFixed(2)},${a.es},${a.ef},${a.ls},${a.lf},${a.totalFloat},${a.freeFloat},${a.isCritical}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pert-results.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('PERT results exported to CSV');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
      }}
    >
      {/* Overlay - Same as Landing Page */}
      <div className="min-h-screen bg-background/80 backdrop-blur-sm">
        
        {/* Header - Same as CPM Page */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/')}
                  className="h-10 w-10 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-700" />
                </Button>
                <Network className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-foreground">Network Planner</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleLoadSample('simple')}
                className="bg-white/80 hover:bg-white border-gray-300"
              >
                Load Sample
              </Button>
            </div>
          </div>
        </header>

        {/* Page Title */}
        <div className="container mx-auto px-4 text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">PERT Analyzer</h1>
          <p className="text-xl text-muted-foreground">
            Program Evaluation & Review Technique with Three-Time Estimates
          </p>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100/80 backdrop-blur border border-gray-300">
              <TabsTrigger value="input" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
                <Table className="h-4 w-4" />
                Input
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm" disabled={!result}>
                <FileSpreadsheet className="h-4 w-4" />
                Results
              </TabsTrigger>
              <TabsTrigger value="network" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm" disabled={!result}>
                <Network className="h-4 w-4" />
                Network
              </TabsTrigger>
              <TabsTrigger value="gantt" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm" disabled={!result}>
                <BarChart3 className="h-4 w-4" />
                Gantt
              </TabsTrigger>
            </TabsList>

            {/* Input Tab */}
            <TabsContent value="input" className="space-y-6">
              <Card className="bg-gray-50/90 backdrop-blur border border-gray-300 shadow-lg">
                <CardHeader className="border-b border-gray-300 bg-white/50">
                  <CardTitle className="flex items-center gap-3 text-gray-800">
                    <Table className="h-6 w-6 text-gray-700" />
                    PERT Activities (Three-Time Estimates)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ActivityTable activities={activities} onChange={setActivities} />
                  <div className="mt-6 flex justify-end gap-3">
                    <label>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleImportCSV}
                      />
                      <Button variant="outline" className="bg-white/80 border-gray-300 hover:bg-white">
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </Button>
                    </label>
                    <Button onClick={handleCompute} size="lg" className="gap-2 bg-green-600 hover:bg-green-700 shadow-lg">
                      <Play className="h-5 w-5" />
                      Compute PERT
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* PERT Instructions */}
              <Card className="bg-gray-50/90 backdrop-blur border border-gray-300">
                <CardHeader className="border-b border-gray-300 bg-white/50">
                  <CardTitle className="flex items-center gap-3 text-gray-800">
                    <Target className="h-6 w-6 text-gray-700" />
                    PERT Three-Time Estimates
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 space-y-3">
                    <p><strong>Optimistic Time (O):</strong> Shortest possible time to complete the activity under ideal conditions</p>
                    <p><strong>Most Likely Time (M):</strong> Most probable time to complete the activity under normal conditions</p>
                    <p><strong>Pessimistic Time (P):</strong> Longest possible time to complete the activity under worst conditions</p>
                    <p><strong>Expected Time:</strong> Calculated automatically as (O + 4M + P) ÷ 6</p>
                    <p><strong>Variance:</strong> Measures uncertainty as [(P - O) ÷ 6]²</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              {result && (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gray-50/90 backdrop-blur border border-gray-300 shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-green-100/80 border border-green-200">
                            <Clock className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Expected Duration</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {result.projectDuration?.toFixed(2) || '0'} {timeUnit}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50/90 backdrop-blur border border-gray-300 shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-red-100/80 border border-red-200">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Critical Activities</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {result.activities?.filter((a: any) => a.isCritical).length || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50/90 backdrop-blur border border-gray-300 shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-blue-100/80 border border-blue-200">
                            <Sigma className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Critical Paths</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {result.criticalPaths?.length || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Results Table */}
                  <Card className="bg-gray-50/90 backdrop-blur border border-gray-300 shadow-lg">
                    <CardContent className="p-6">
                      <ResultsTable activities={result.activities || []} onExport={handleExportCSV} />
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network">
              <Card className="bg-gray-50/90 backdrop-blur border border-gray-300 shadow-xl">
                <CardHeader className="border-b border-gray-300 bg-white/50">
                  <CardTitle className="flex items-center gap-3 text-gray-800">
                    <Network className="h-6 w-6 text-gray-700" />
                    Network Diagram
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {result && (
                    <NetworkDiagram
                      activities={result.activities || []}
                      criticalPaths={result.criticalPaths || []}
                      aoaNetwork={result.aoaNetwork}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gantt Tab */}
            <TabsContent value="gantt">
              <Card className="bg-gray-50/90 backdrop-blur border border-gray-300 shadow-xl">
                <CardHeader className="border-b border-gray-300 bg-white/50">
                  <CardTitle className="flex items-center gap-3 text-gray-800">
                    <BarChart3 className="h-6 w-6 text-gray-700" />
                    Gantt Chart
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {result && <GanttChart activities={result.activities || []} />}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default PERT;
