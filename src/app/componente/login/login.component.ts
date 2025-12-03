import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PoliticaPrivacidadeComponent } from '../../politica-privacidade/politica-privacidade.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PoliticaPrivacidadeComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    @Output() closed = new EventEmitter<void>();
    @ViewChild(PoliticaPrivacidadeComponent) politicaPrivacidadeComponent!: PoliticaPrivacidadeComponent;

  isCadastroMode = false; // false = login, true = cadastro
  isLoading = false;
  isSubmitted = false;
  errorMessage = '';
  successMessage = '';

  loginForm: FormGroup;
  cadastroForm: FormGroup;

  // Modal de política de privacidade
  showPoliticaPrivacidade = false;

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
      password: ['', [Validators.required]]
    });
  }

  private createCadastroForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      tipo: ['Usuário Comum', Validators.required],
      lgpd: [false, Validators.requiredTrue]
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

  // Login using AuthService properly
  async onLogin() {
    this.isSubmitted = true;
    this.hideMessages();

    if (this.loginForm.invalid) return;

    this.isLoading = true;

    try {
      const { email, password } = this.loginForm.value;

      const result = await this.authService.login({ email, password });

      if (result.success) {
        this.showMessage('🔒 Login realizado com sucesso!', 'success');
        setTimeout(() => {
          this.closeModal();
          const user = this.authService.currentUser;
          if (user?.role === 'mediador') {
            this.router.navigate(['/painel-mediador']);
          } else {
            this.router.navigate(['/meu-painel']);
          }
        }, 1500);
      } else {
        this.showMessage(result.error || 'Erro no login', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showMessage('Erro inesperado', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Cadastro using AuthService properly
  async onCadastro() {
    this.isSubmitted = true;
    this.hideMessages();

    if (this.cadastroForm.invalid) {
      console.log('Formulário de cadastro inválido:', this.cadastroFormErrors);
      return;
    }

    this.isLoading = true;

    try {
      const { nome, email, password, tipo, lgpd } = this.cadastroForm.value;

      if (!lgpd) {
        this.showMessage('Você deve concordar com a Política de Privacidade.', 'error');
        this.isLoading = false;
        return;
      }

      const role = tipo === 'Administrador' ? 'mediador' : 'doador';

      const result = await this.authService.register({
        nome,
        email,
        password,
        role: role as any
      });

      if (result.success) {
        this.showMessage('✅ Conta criada com sucesso!', 'success');

        // 🔄 Fazer login automático após cadastro
        setTimeout(async () => {
          try {
            const loginResult = await this.authService.login({
              email,
              password,
              rememberMe: true
            });

            if (loginResult.success) {
              console.log('✅ Login automático realizado após cadastro');
              this.closeModal();

              // Redirecionar baseado no role do usuário
              const userRole = role; // O role que acabamos de determinar
              if (userRole === 'mediador') {
                this.router.navigate(['/painel-mediador']);
              } else {
                this.router.navigate(['/meu-painel']); // Redireciona para o painel unificado
              }
            } else {
              console.error('❌ Falhou login automático');
              this.closeModal();
              this.router.navigate(['/auth']); // Volta para login se falhar
            }
          } catch (error) {
            console.error('Erro no login automático:', error);
            this.closeModal();
            this.router.navigate(['/auth']);
          }
        }, 1500);
      } else {
        this.showMessage(result.error || 'Erro no cadastro', 'error');
      }
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
      password: this.cadastroForm.get('password')?.errors,
      lgpd: this.cadastroForm.get('lgpd')?.errors
    };
  }

  // Modal de política de privacidade
  openPoliticaPrivacidade() {
    this.showPoliticaPrivacidade = true;
  }

  onPoliticaPrivacidadeClosed() {
    this.showPoliticaPrivacidade = false;
  }

  closeModal(): void {
    this.closed.emit();
    console.log('🗂️ Modal de autenticação fechado: navegando para home e seção "Disponíveis para Adoção"');
    // Primeiro navegar para home, depois fazer scroll
    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        const adoptionSection = document.getElementById('adote');
        if (adoptionSection) {
          adoptionSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    });
  }
}
