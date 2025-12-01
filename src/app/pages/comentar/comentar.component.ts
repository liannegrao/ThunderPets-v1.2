import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DepoimentoService, Depoimento } from '../../services/depoimento.service';

@Component({
  selector: 'app-comentar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comentar.component.html',
  styleUrl: './comentar.component.css'
})
export class ComentarComponent implements OnInit {

  comentarioForm!: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private depoimentoService: DepoimentoService) {
    this.comentarioForm = this.createComentarioForm();
  }

  ngOnInit() {}

  createComentarioForm(): FormGroup {
    return this.fb.group({
      nome: ['', Validators.required],
      depoimento: ['', [Validators.required, Validators.minLength(10)]],
      fotoUrl: ['']
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.comentarioForm.patchValue({ fotoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.comentarioForm.valid) {
      const formValue = this.comentarioForm.value;
      const novoDepoimento = {
        nome: formValue.nome,
        depoimento: formValue.depoimento,
        aprovado: false, // Depoimentos começam como não aprovados
        fotoUrl: formValue.fotoUrl || ''
      };

      this.depoimentoService.addDepoimento(novoDepoimento);
      alert('✅ Depoimento enviado com sucesso!\n\nObrigado por compartilhar sua experiência.');
      this.router.navigate(['/']);
    } else {
      alert('❌ Por favor, preencha todos os campos corretamente.');
    }
  }

  voltarAoInicio(): void {
    this.router.navigate(['/']);
  }
}
