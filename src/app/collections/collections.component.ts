import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
}

interface Collection {
  id: string;
  knowledgeBaseId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css']
})
export class CollectionsComponent implements OnInit {
  knowledgeBases: KnowledgeBase[] = [];
  collections: Collection[] = [];
  selectedKnowledgeBaseId: string | null = null;
  isLoading = false;
  error: string | null = null;
  
  // Form state
  showCreateForm = false;
  showEditForm = false;
  editingCollection: Collection | null = null;
  
  formData = {
    knowledgeBaseId: '',
    name: '',
    description: ''
  };

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadKnowledgeBases();
    
    // Check if knowledge base ID is in route params
    this.route.paramMap.subscribe(params => {
      const kbId = params.get('kbId');
      if (kbId) {
        this.selectedKnowledgeBaseId = kbId;
        this.loadCollections(kbId);
      }
    });
  }

  loadKnowledgeBases(): void {
    this.http.get<KnowledgeBase[]>('/api/knowledge-bases')
      .subscribe({
        next: (data) => {
          this.knowledgeBases = data;
        },
        error: (err) => {
          console.error('Error loading knowledge bases:', err);
        }
      });
  }

  loadCollections(kbId: string): void {
    this.isLoading = true;
    this.error = null;
    this.http.get<Collection[]>(`/api/knowledge-bases/${kbId}/collections`)
      .subscribe({
        next: (data) => {
          this.collections = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load collections';
          this.isLoading = false;
          console.error('Error loading collections:', err);
        }
      });
  }

  onKnowledgeBaseChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const kbId = select.value;
    this.selectedKnowledgeBaseId = kbId;
    if (kbId) {
      this.loadCollections(kbId);
      this.router.navigate(['/collections'], { queryParams: { kbId } });
    } else {
      this.collections = [];
    }
  }

  openCreateForm(): void {
    if (!this.selectedKnowledgeBaseId) {
      this.error = 'Please select a knowledge base first';
      return;
    }
    this.showCreateForm = true;
    this.showEditForm = false;
    this.formData = { 
      knowledgeBaseId: this.selectedKnowledgeBaseId, 
      name: '', 
      description: '' 
    };
  }

  openEditForm(collection: Collection): void {
    this.showEditForm = true;
    this.showCreateForm = false;
    this.editingCollection = collection;
    this.formData = { 
      knowledgeBaseId: collection.knowledgeBaseId, 
      name: collection.name, 
      description: collection.description || '' 
    };
  }

  closeForms(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.editingCollection = null;
    this.formData = { knowledgeBaseId: '', name: '', description: '' };
  }

  createCollection(): void {
    if (!this.formData.name.trim() || !this.formData.knowledgeBaseId) return;
    
    this.isLoading = true;
    this.http.post<Collection>('/api/collections', this.formData)
      .subscribe({
        next: () => {
          this.loadCollections(this.formData.knowledgeBaseId);
          this.closeForms();
        },
        error: (err) => {
          this.error = 'Failed to create collection';
          this.isLoading = false;
          console.error('Error creating collection:', err);
        }
      });
  }

  updateCollection(): void {
    if (!this.editingCollection || !this.formData.name.trim()) return;
    
    this.isLoading = true;
    this.http.put(`/api/collections/${this.editingCollection.id}`, this.formData)
      .subscribe({
        next: () => {
          this.loadCollections(this.editingCollection!.knowledgeBaseId);
          this.closeForms();
        },
        error: (err) => {
          this.error = 'Failed to update collection';
          this.isLoading = false;
          console.error('Error updating collection:', err);
        }
      });
  }

  deleteCollection(id: string): void {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    
    this.isLoading = true;
    this.http.delete(`/api/collections/${id}`)
      .subscribe({
        next: () => {
          if (this.selectedKnowledgeBaseId) {
            this.loadCollections(this.selectedKnowledgeBaseId);
          }
        },
        error: (err) => {
          this.error = 'Failed to delete collection';
          this.isLoading = false;
          console.error('Error deleting collection:', err);
        }
      });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getKnowledgeBaseName(kbId: string): string {
    const kb = this.knowledgeBases.find(k => k.id === kbId);
    return kb ? kb.name : 'Unknown';
  }
}
