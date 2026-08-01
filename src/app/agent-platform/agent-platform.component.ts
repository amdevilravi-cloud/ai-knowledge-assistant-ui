import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentPlatformService, AgentRequest, Execution, ExecutionContext, Artifact, ExecutionGraph, ExecutionNode } from '../core/services/agent-platform.service';

@Component({
  selector: 'app-agent-platform',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-platform.component.html',
  styleUrls: ['./agent-platform.component.css'],
})
export class AgentPlatformComponent implements OnInit {
  private agentPlatformService = inject(AgentPlatformService);

  goal = '';
  context = '';
  conversationId = '';
  knowledgeBaseId = '';
  
  isLoading = false;
  errorMessage = '';
  
  execution: Execution | null = null;
  executionContext: ExecutionContext | null = null;
  
  availableTools: { [key: string]: string } = {};
  agentStatus: any = null;
  
  // Artifact viewing
  selectedArtifact: Artifact | null = null;
  showArtifactModal = false;
  artifacts: Artifact[] = [];
  artifactVersions: Artifact[] = [];
  showArtifactVersions = false;
  
  // Execution graph
  showExecutionGraph = false;
  executionGraph: ExecutionGraph | null = null;
  graphFilter: 'all' | 'milestone' | 'tool' | 'artifact' = 'all';

  ngOnInit(): void {
    this.loadAvailableTools();
    this.loadAgentStatus();
  }

  loadAvailableTools(): void {
    this.agentPlatformService.getAvailableTools().subscribe({
      next: (tools) => {
        this.availableTools = tools;
      },
      error: (err) => {
        console.error('Error loading tools:', err);
        this.errorMessage = 'Failed to load available tools. Is the agent platform running?';
      }
    });
  }

  loadAgentStatus(): void {
    this.agentPlatformService.getAgentStatus().subscribe({
      next: (status) => {
        this.agentStatus = status;
      },
      error: (err) => {
        console.error('Error loading agent status:', err);
      }
    });
  }

  executeAgent(): void {
    if (!this.goal.trim()) {
      this.errorMessage = 'Please enter a goal';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.execution = null;
    this.artifacts = [];

    const request: AgentRequest = {
      goal: this.goal,
      context: this.context || undefined,
      conversationId: this.conversationId || undefined,
      knowledgeBaseId: this.knowledgeBaseId || undefined
    };

    this.agentPlatformService.executeAgent(request).subscribe({
      next: (response) => {
        this.execution = response;
        this.artifacts = response.artifacts || [];
        this.executionGraph = response.executionGraph || null;
        this.isLoading = false;
        this.loadAgentStatus(); // Refresh status after execution
        
        // Load artifacts if execution completed successfully
        if (response.completed && response.executionId) {
          this.loadArtifacts(response.executionId);
        }
      },
      error: (error) => {
        console.error('Error executing agent:', error);
        this.isLoading = false;
        this.errorMessage = error.status === 0 
          ? 'Connection failed. Agent platform is not running at http://localhost:8081'
          : `Error: ${error.status} - ${error.statusText}`;
      }
    });
  }

  loadArtifacts(executionId: string): void {
    this.agentPlatformService.getArtifactsForExecution(executionId).subscribe({
      next: (artifacts) => {
        this.artifacts = artifacts;
      },
      error: (err) => {
        console.error('Error loading artifacts:', err);
      }
    });
  }

  generatePlan(): void {
    if (!this.goal.trim()) {
      this.errorMessage = 'Please enter a goal';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request: AgentRequest = {
      goal: this.goal,
      context: this.context || undefined,
      conversationId: this.conversationId || undefined,
      knowledgeBaseId: this.knowledgeBaseId || undefined
    };

    this.agentPlatformService.generatePlan(request).subscribe({
      next: (plan) => {
        console.log('Generated plan:', plan);
        this.isLoading = false;
        // For now, just log the plan. In future, display it in UI
        alert('Plan generated: ' + JSON.stringify(plan, null, 2));
      },
      error: (error) => {
        console.error('Error generating plan:', error);
        this.isLoading = false;
        this.errorMessage = `Error generating plan: ${error.statusText}`;
      }
    });
  }

  viewArtifact(artifact: Artifact): void {
    this.selectedArtifact = artifact;
    this.showArtifactModal = true;
    this.showArtifactVersions = false;
  }

  viewArtifactVersions(artifact: Artifact): void {
    this.selectedArtifact = artifact;
    this.showArtifactModal = true;
    this.showArtifactVersions = true;
    this.loadArtifactVersions(artifact.artifactId);
  }

  loadArtifactVersions(artifactId: string): void {
    this.agentPlatformService.getArtifactVersions(artifactId).subscribe({
      next: (versions) => {
        this.artifactVersions = versions;
      },
      error: (err) => {
        console.error('Error loading artifact versions:', err);
      }
    });
  }

  rollbackArtifact(artifactId: string, version: number): void {
    if (confirm(`Rollback artifact to version ${version}? This will create a new version.`)) {
      this.agentPlatformService.rollbackArtifact(artifactId, version).subscribe({
        next: (rolledBackArtifact) => {
          this.selectedArtifact = rolledBackArtifact;
          this.loadArtifactVersions(artifactId);
          alert(`Artifact rolled back to version ${version}. New version ${rolledBackArtifact.version} created.`);
        },
        error: (err) => {
          console.error('Error rolling back artifact:', err);
          alert('Failed to rollback artifact.');
        }
      });
    }
  }

  closeArtifactModal(): void {
    this.showArtifactModal = false;
    this.selectedArtifact = null;
    this.showArtifactVersions = false;
    this.artifactVersions = [];
  }

  toggleExecutionGraph(): void {
    this.showExecutionGraph = !this.showExecutionGraph;
  }

  getFilteredGraphNodes(): ExecutionNode[] {
    if (!this.executionGraph) return [];
    
    if (this.graphFilter === 'all') {
      return this.executionGraph.nodes;
    }
    
    return this.executionGraph.nodes.filter(node => 
      node.nodeType.toLowerCase() === this.graphFilter
    );
  }

  getFilteredGraphEdges(): any[] {
    if (!this.executionGraph) return [];
    
    const filteredNodeIds = new Set(this.getFilteredGraphNodes().map(n => n.nodeId));
    
    return this.executionGraph.edges.filter(edge =>
      filteredNodeIds.has(edge.sourceNodeId) && filteredNodeIds.has(edge.targetNodeId)
    );
  }

  getNodeIcon(nodeType: string): string {
    switch (nodeType.toLowerCase()) {
      case 'milestone': return '🎯';
      case 'tool': return '🔧';
      case 'artifact': return '📄';
      default: return '📦';
    }
  }

  getEdgeIcon(edgeType: string): string {
    switch (edgeType.toLowerCase()) {
      case 'executes': return '▶️';
      case 'produces': return '➡️';
      case 'flows_to': return '↪️';
      default: return '→';
    }
  }

  downloadArtifact(artifact: Artifact): void {
    const blob = new Blob([artifact.content], { type: artifact.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  clearForm(): void {
    this.goal = '';
    this.context = '';
    this.conversationId = '';
    this.knowledgeBaseId = '';
    this.execution = null;
    this.artifacts = [];
    this.errorMessage = '';
  }

  get hasAvailableTools(): boolean {
    return Object.keys(this.availableTools).length > 0;
  }

  get hasArtifacts(): boolean {
    return this.artifacts && this.artifacts.length > 0;
  }

  getArtifactIcon(type: string): string {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('document') || typeLower.includes('thesis')) {
      return '📄';
    } else if (typeLower.includes('outline')) {
      return '📋';
    } else if (typeLower.includes('summary')) {
      return '📝';
    } else if (typeLower.includes('diagram')) {
      return '📊';
    } else {
      return '📁';
    }
  }

  getStateIcon(state: string): string {
    const stateLower = state.toLowerCase();
    if (stateLower.includes('plan')) return '🧠';
    if (stateLower.includes('execute')) return '⚡';
    if (stateLower.includes('observe')) return '👁️';
    if (stateLower.includes('analyze')) return '🔍';
    if (stateLower.includes('generate')) return '✨';
    if (stateLower.includes('respond')) return '💬';
    if (stateLower.includes('finish')) return '✅';
    return '🔄';
  }
}
