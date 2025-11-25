import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();

  isCadastroMode = false; // false = login, true = cadastro
  isLoading = false;
  isSubmitted = false;
  errorMessage = '';
  successMessage = '';

  loginForm: FormGroup;
  cadastroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.createLoginForm();
    this.cadastroForm = this.createCadastroForm();
  }

  ngOnInit() {
    // Check URL parameters to determine which form to show
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    this.isCadastroMode = tab === 'cadastro';
  }

  private createLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private createCadastroForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      tipo: ['Usuário Comum', Validators.required]
    });
  }

  toggleMode(mode: 'login' | 'cadastro') {
    this.isCadastroMode = mode === 'cadastro';
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitted = false;
  }

  // Função para mostrar mensagens de feedback
  private showMessage(message: string, type: 'success' | 'error') {
    this.hideMessages();
    if (type === 'success') {
      this.successMessage = message;
    } else {
      this.errorMessage = message;
    }
  }

  // Função para esconder mensagens
  private hideMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Login method - migrated from original JS
  async onLogin() {
    this.isSubmitted = true;
    this.hideMessages();

    if (this.loginForm.invalid) return;

    this.isLoading = true;

    try {
      const { email, password } = this.loginForm.value;

      // Get stored user from localStorage (original logic)
      const usuarioCadastradoJSON = localStorage.getItem('usuarioCadastrado');

      // Check if user exists
      if (!usuarioCadastradoJSON) {
        this.showMessage('Nenhum usuário cadastrado ainda!', 'error');
        return;
      }

      // Parse stored user
      const usuarioCadastrado = JSON.parse(usuarioCadastradoJSON);

      // Check email and password
      if (email === usuarioCadastrado.email && password === usuarioCadastrado.senha) {
        // Store logged user (original logic)
        localStorage.setItem('usuarioLogado', usuarioCadastrado.nome);
        localStorage.setItem('tipoUsuario', usuarioCadastrado.tipo);

        this.showMessage('🔒 Login realizado com sucesso!', 'success');

        // Redirect after 2 seconds (like original)
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      } else {
        this.showMessage('🔒 Email ou senha incorretos!', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showMessage('Erro inesperado', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Cadastro method - migrated from original JS
  async onCadastro() {
    this.isSubmitted = true;
    this.hideMessages();

    if (this.cadastroForm.invalid) return;

    this.isLoading = true;

    try {
      const { nome, email, password, tipo } = this.cadastroForm.value;

      // Create user object (like original)
      const usuario = { nome, email, senha: password, tipo };

      // Store in localStorage (original logic)
      localStorage.setItem('usuarioCadastrado', JSON.stringify(usuario));
      localStorage.setItem('usuarioLogado', nome);

      this.showMessage('✅ Conta criada com sucesso!', 'success');

      // Redirect after 2 seconds (like original)
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
    } catch (error) {
      console.error('Cadastro error:', error);
      this.showMessage('Erro inesperado', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Error getters
  get loginFormErrors() {
    return {
      email: this.loginForm.get('email')?.errors,
      password: this.loginForm.get('password')?.errors
    };
  }

  get cadastroFormErrors() {
    return {
      nome: this.cadastroForm.get('nome')?.errors,
      email: this.cadastroForm.get('email')?.errors,
      password: this.cadastroForm.get('password')?.errors
    };
  }

  closeModal(): void {
    this.closed.emit();
  }
}
