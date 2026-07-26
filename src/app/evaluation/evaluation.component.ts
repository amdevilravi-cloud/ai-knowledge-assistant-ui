import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluationService, EvaluationTest, EvaluationRun, EvaluationResult, CreateTestRequest, CreateRunRequest } from '../core/services/evaluation.service';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent implements OnInit {
  tests: EvaluationTest[] = [];
  runs: EvaluationRun[] = [];
  results: EvaluationResult[] = [];
  isLoading = false;
  error: string | null = null;
  
  // View state
  activeTab: 'tests' | 'runs' | 'results' = 'tests';
  selectedRunId: string | null = null;
  
  // Form state
  showCreateTestForm = false;
  showCreateRunForm = false;
  
  testFormData = {
    name: '',
    query: '',
    expectedChunkIds: ''
  };
  
  runFormData = {
    name: '',
    description: ''
  };

  constructor(private evaluationService: EvaluationService) {}

  ngOnInit(): void {
    this.loadTests();
    this.loadRuns();
  }

  loadTests(): void {
    this.isLoading = true;
    this.evaluationService.getTests()
      .subscribe({
        next: (data) => {
          this.tests = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load evaluation tests';
          this.isLoading = false;
          console.error('Error loading tests:', err);
        }
      });
  }

  loadRuns(): void {
    this.evaluationService.getRuns()
      .subscribe({
        next: (data) => {
          this.runs = data;
        },
        error: (err) => {
          console.error('Error loading runs:', err);
        }
      });
  }

  loadResults(runId: string): void {
    this.selectedRunId = runId;
    this.isLoading = true;
    this.evaluationService.getRunResults(runId)
      .subscribe({
        next: (data) => {
          this.results = data;
          this.isLoading = false;
          this.activeTab = 'results';
        },
        error: (err) => {
          this.error = 'Failed to load evaluation results';
          this.isLoading = false;
          console.error('Error loading results:', err);
        }
      });
  }

  openCreateTestForm(): void {
    this.showCreateTestForm = true;
    this.testFormData = { name: '', query: '', expectedChunkIds: '' };
  }

  closeTestForm(): void {
    this.showCreateTestForm = false;
    this.testFormData = { name: '', query: '', expectedChunkIds: '' };
  }

  createTest(): void {
    if (!this.testFormData.name.trim() || !this.testFormData.query.trim()) return;
    
    this.isLoading = true;
    const chunkIds = this.testFormData.expectedChunkIds
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    const request: CreateTestRequest = {
      name: this.testFormData.name,
      query: this.testFormData.query,
      expectedChunkIds: chunkIds
    };
    
    this.evaluationService.createTest(request)
      .subscribe({
        next: () => {
          this.loadTests();
          this.closeTestForm();
        },
        error: (err) => {
          this.error = 'Failed to create test';
          this.isLoading = false;
          console.error('Error creating test:', err);
        }
      });
  }

  deleteTest(id: string): void {
    if (!confirm('Are you sure you want to delete this test?')) return;
    
    this.isLoading = true;
    this.evaluationService.deleteTest(id)
      .subscribe({
        next: () => {
          this.loadTests();
        },
        error: (err) => {
          this.error = 'Failed to delete test';
          this.isLoading = false;
          console.error('Error deleting test:', err);
        }
      });
  }

  openCreateRunForm(): void {
    this.showCreateRunForm = true;
    this.runFormData = { name: '', description: '' };
  }

  closeRunForm(): void {
    this.showCreateRunForm = false;
    this.runFormData = { name: '', description: '' };
  }

  createRun(): void {
    if (!this.runFormData.name.trim()) return;
    
    this.isLoading = true;
    const request: CreateRunRequest = {
      name: this.runFormData.name,
      description: this.runFormData.description
    };
    
    this.evaluationService.createRun(request)
      .subscribe({
        next: (run) => {
          this.loadRuns();
          this.closeRunForm();
          this.runEvaluation(run.id);
        },
        error: (err) => {
          this.error = 'Failed to create run';
          this.isLoading = false;
          console.error('Error creating run:', err);
        }
      });
  }

  runEvaluation(runId: string): void {
    this.isLoading = true;
    this.evaluationService.executeRun(runId)
      .subscribe({
        next: () => {
          this.loadRuns();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to run evaluation';
          this.isLoading = false;
          console.error('Error running evaluation:', err);
        }
      });
  }

  deleteRun(id: string): void {
    if (!confirm('Are you sure you want to delete this run and all its results?')) return;
    
    this.isLoading = true;
    this.evaluationService.deleteRun(id)
      .subscribe({
        next: () => {
          this.loadRuns();
          if (this.selectedRunId === id) {
            this.selectedRunId = null;
            this.results = [];
            this.activeTab = 'runs';
          }
        },
        error: (err) => {
          this.error = 'Failed to delete run';
          this.isLoading = false;
          console.error('Error deleting run:', err);
        }
      });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'bg-success';
      case 'RUNNING': return 'bg-primary';
      case 'FAILED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  calculateAverageMetric(metricName: string): number {
    if (this.results.length === 0) return 0;
    const values = this.results
      .map(r => (r.metrics as any)[metricName] as number)
      .filter(v => v !== undefined && !isNaN(v));
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  getRecallAtK(result: EvaluationResult): string {
    const value = (result.metrics as any).recallAtK;
    if (value === undefined || value === null || isNaN(value)) return '-';
    return (value * 100).toFixed(1);
  }

  getPrecisionAtK(result: EvaluationResult): string {
    const value = (result.metrics as any).precisionAtK;
    if (value === undefined || value === null || isNaN(value)) return '-';
    return (value * 100).toFixed(1);
  }

  getMRR(result: EvaluationResult): string {
    const value = (result.metrics as any).mrr;
    if (value === undefined || value === null || isNaN(value)) return '-';
    return value.toFixed(3);
  }

  exportResults(): void {
    if (!this.selectedRunId) return;
    
    this.evaluationService.exportResults(this.selectedRunId )
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `evaluation-results-${this.selectedRunId}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.error = 'Failed to export results';
          console.error('Error exporting results:', err);
        }
      });
  }
}
