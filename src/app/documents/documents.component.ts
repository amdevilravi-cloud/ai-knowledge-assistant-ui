import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService, DocumentUploadResponse } from '../core/services/document.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css'],
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
