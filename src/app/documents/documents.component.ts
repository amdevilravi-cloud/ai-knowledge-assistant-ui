import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService, Document } from '../core/services/document.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <h2 class="mb-4">Documents</h2>

      <div class="card mb-4">
        <div class="card-body">
          <div class="input-group">
            <input
              type="file"
              class="form-control"
              #fileInput
              (change)="onFileSelected($event)"
            />
            <button
              class="btn btn-primary"
              (click)="uploadDocument()"
              [disabled]="!selectedFile || isUploading"
            >
              {{ isUploading ? 'Uploading...' : 'Upload' }}
            </button>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doc of documents$ | async">
              <td>{{ doc.name }}</td>
              <td>{{ doc.fileType }}</td>
              <td>{{ (doc.fileSize / 1024 / 1024).toFixed(2) }} MB</td>
              <td>
                <span
                  class="badge"
                  [ngClass]="{
                    'bg-warning': doc.status === 'pending' || doc.status === 'processing',
                    'bg-success': doc.status === 'completed',
                    'bg-danger': doc.status === 'failed'
                  }"
                >
                  {{ doc.status }}
                </span>
              </td>
              <td>{{ doc.uploadedAt | date: 'short' }}</td>
              <td>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deleteDocument(doc.id)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DocumentsComponent implements OnInit {
  private documentService = inject(DocumentService);

  documents$!: Observable<Document[]>;
  selectedFile: File | null = null;
  isUploading = false;

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.documents$ = this.documentService.getDocuments();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  uploadDocument(): void {
    if (this.selectedFile) {
      this.isUploading = true;
      this.documentService.uploadDocument(this.selectedFile).subscribe({
        next: () => {
          this.isUploading = false;
          this.selectedFile = null;
          this.loadDocuments();
        },
        error: () => {
          this.isUploading = false;
        },
      });
    }
  }

  deleteDocument(id: string): void {
    if (confirm('Are you sure?')) {
      this.documentService.deleteDocument(id).subscribe(() => {
        this.loadDocuments();
      });
    }
  }
}
