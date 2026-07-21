import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService, DocumentUploadResponse } from '../core/services/document.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <h2 class="mb-4">Knowledge Base Documents</h2>

      <div class="card mb-4">
        <div class="card-body">
          <div class="input-group">
            <input
              type="file"
              class="form-control"
              #fileInput
              (change)="onFileSelected($event)"
              accept=".pdf,.txt,.docx"
            />
            <button
              class="btn btn-primary"
              (click)="uploadDocument()"
              [disabled]="!selectedFile || isUploading || validationError"
            >
              {{ isUploading ? 'Uploading...' : 'Upload' }}
            </button>
          </div>
          <small class="text-muted d-block mt-2">
            📄 Supported formats: PDF, TXT, DOCX (Max size: 50MB)
          </small>
          <div *ngIf="validationError" class="alert alert-danger alert-dismissible fade show mt-3" role="alert">
            {{ validationError }}
            <button type="button" class="btn-close" (click)="validationError = ''"></button>
          </div>
          <div *ngIf="uploadError" class="alert alert-danger alert-dismissible fade show mt-3" role="alert">
            {{ uploadError }}
            <button type="button" class="btn-close" (click)="uploadError = ''"></button>
          </div>
          <div *ngIf="uploadSuccess" class="alert alert-success alert-dismissible fade show mt-3" role="alert">
            {{ uploadSuccess }}
            <button type="button" class="btn-close" (click)="uploadSuccess = ''"></button>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Pages</th>
              <th>Chunks</th>
              <th>Uploaded</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doc of documents$ | async">
              <td>{{ doc.documentName }}</td>
              <td>{{ formatFileSize(doc.fileSize) }}</td>
              <td>{{ doc.pages || '-' }}</td>
              <td>{{ doc.chunks || '-' }}</td>
              <td>{{ doc.uploadedAt | date: 'short' }}</td>
              <td>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deleteDocument(doc.documentId)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="(documents$ | async)?.length === 0" class="text-center p-5 text-muted">
          <p>No documents uploaded yet. Upload a PDF, TXT, or DOCX file to get started.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table td {
      vertical-align: middle;
    }
  `],
})
export class DocumentsComponent implements OnInit {
  private documentService = inject(DocumentService);
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  documents$!: Observable<DocumentUploadResponse[]>;
  selectedFile: File | null = null;
  isUploading = false;
  validationError = '';
  uploadError = '';
  uploadSuccess = '';

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.documents$ = this.documentService.getDocuments();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.validationError = '';
    this.uploadError = '';

    if (input.files?.length) {
      const file = input.files[0];
      const validation = this.documentService.validateFile(file);

      if (!validation.valid) {
        this.validationError = validation.error || 'Invalid file';
        this.selectedFile = null;
      } else {
        this.selectedFile = file;
      }
    }
  }

  uploadDocument(): void {
    if (!this.selectedFile) {
      this.validationError = 'Please select a file';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';

    this.documentService.uploadDocument(this.selectedFile).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.selectedFile = null;
        this.validationError = '';
        this.uploadSuccess = `✓ "${response.documentName}" uploaded successfully (${response.chunks} chunks)`;
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
        this.loadDocuments();
      },
      error: (error) => {
        this.isUploading = false;
        console.error('Upload error:', error);
        this.uploadError =
          error.status === 0
            ? 'Connection failed. Backend is not running at http://localhost:8080'
            : error.error?.message || `Upload failed: ${error.status} ${error.statusText}`;
      },
    });
  }

  deleteDocument(id: string): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.loadDocuments();
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.uploadError = 'Failed to delete document';
        },
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
