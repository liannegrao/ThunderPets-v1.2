import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-politica-privacidade',
  imports: [CommonModule],
  templateUrl: './politica-privacidade.component.html',
  styleUrl: './politica-privacidade.component.css'
})
export class PoliticaPrivacidadeComponent {
  @Output() closed = new EventEmitter<void>();

  isVisible = false;

  openModal() {
    this.isVisible = true;
    // Prevenir scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isVisible = false;
    // Restaurar scroll do body
    document.body.style.overflow = 'auto';
    this.closed.emit();
  }
}
