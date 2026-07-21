import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-dark text-light text-center py-4 mt-auto">
      <div class="container">
        <p>&copy; {{ currentYear }} Enterprise AI Knowledge Assistant. All rights reserved.</p>
        <small>Powered by Spring Boot & Angular</small>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
