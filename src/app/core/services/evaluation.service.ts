
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface EvaluationTest {
  id: string;
  name: string;
  query: string;
  expectedChunkIds: string[];
  createdAt: string;
}

export interface CreateTestRequest {
  name: string;
  query: string;
  expectedChunkIds: string[];
}

export interface EvaluationRun {
  id: string;
  name: string;
  description: string;
  startedAt: string;
  completedAt: string | null;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
}

export interface CreateRunRequest {
  name: string;
  description: string;
}

export interface EvaluationResult {
  id: string;
  testId: string;
  runId: string;
  retrievedChunkIds: string[];
  metrics: {
    recallAtK?: number;
    precisionAtK?: number;
    mrr?: number;
    latency?: number;
  };
  latencyMs: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  private apiUrl = `${environment.apiUrl}/api/evaluation`;

  constructor(private http: HttpClient) {}

  /**
   * Get all evaluation tests
   */
  getTests(): Observable<EvaluationTest[]> {
    return this.http.get<EvaluationTest[]>(`${this.apiUrl}/tests`).pipe(
      catchError((err) => {
        console.error('Error fetching evaluation tests:', err);
        return throwError(() => new Error('Failed to load evaluation tests'));
      })
    );
  }

  /**
   * Create a new evaluation test
   */
  createTest(request: CreateTestRequest): Observable<EvaluationTest> {
    return this.http.post<EvaluationTest>(`${this.apiUrl}/tests`, request).pipe(
      catchError((err) => {
        console.error('Error creating evaluation test:', err);
        return throwError(() => new Error('Failed to create test'));
      })
    );
  }

  /**
   * Delete an evaluation test
   */
  deleteTest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tests/${id}`).pipe(
      catchError((err) => {
        console.error('Error deleting evaluation test:', err);
        return throwError(() => new Error('Failed to delete test'));
      })
    );
  }

  /**
   * Get all evaluation runs
   */
  getRuns(): Observable<EvaluationRun[]> {
    return this.http.get<EvaluationRun[]>(`${this.apiUrl}/runs`).pipe(
      catchError((err) => {
        console.error('Error fetching evaluation runs:', err);
        return throwError(() => new Error('Failed to load evaluation runs'));
      })
    );
  }

  /**
   * Create a new evaluation run
   */
  createRun(request: CreateRunRequest): Observable<EvaluationRun> {
    return this.http.post<EvaluationRun>(`${this.apiUrl}/runs`, request).pipe(
      catchError((err) => {
        console.error('Error creating evaluation run:', err);
        return throwError(() => new Error('Failed to create run'));
      })
    );
  }

  /**
   * Execute an evaluation run
   */
  executeRun(runId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/runs/${runId}/execute`, {}).pipe(
      catchError((err) => {
        console.error('Error executing evaluation run:', err);
        return throwError(() => new Error('Failed to run evaluation'));
      })
    );
  }

  /**
   * Delete an evaluation run
   */
  deleteRun(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/runs/${id}`).pipe(
      catchError((err) => {
        console.error('Error deleting evaluation run:', err);
        return throwError(() => new Error('Failed to delete run'));
      })
    );
  }

  /**
   * Get results for a specific evaluation run
   */
  getRunResults(runId: string): Observable<EvaluationResult[]> {
    return this.http.get<EvaluationResult[]>(`${this.apiUrl}/runs/${runId}/results`).pipe(
      catchError((err) => {
        console.error('Error fetching evaluation results:', err);
        return throwError(() => new Error('Failed to load evaluation results'));
      })
    );
  }

  /**
   * Export evaluation results as a file
   */
  exportResults(runId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/runs/${runId}/export`, { responseType: 'blob' }).pipe(
      catchError((err) => {
        console.error('Error exporting evaluation results:', err);
        return throwError(() => new Error('Failed to export results'));
      })
    );
  }
}
