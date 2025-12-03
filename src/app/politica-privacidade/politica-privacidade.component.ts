import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-politica-privacidade',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './politica-privacidade.component.html',
  styleUrl: './politica-privacidade.component.css'
})
export class PoliticaPrivacidadeComponent {
  @Output() closed = new EventEmitter<void>();

  closeModal() {
    document.body.style.overflow = 'auto';
    this.closed.emit();
  }
}
