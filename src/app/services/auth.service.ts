import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Usuario {
  email: string;
  nome: string;
  role: 'mediador' | 'voluntario' | 'doador';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  nome: string;
  role: Usuario['role'];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'thunderpets_users';
  private readonly LOGGED_USER_KEY = 'thunderpets_logged_user';

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Load user from localStorage on init
    this.loadUserFromStorage();
  }

  // Get current user
  get currentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Login method
  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    const { email, password, rememberMe } = credentials;

    // Get users from storage
    const users = this.getUsers();

    // Find user
    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user || user.password !== this.hashPassword(password)) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    // Set as current user
    this.setCurrentUser(user, rememberMe || false);

    return { success: true };
  }

  // Register method
  async register(data: RegisterCredentials): Promise<{ success: boolean; error?: string }> {
    const { email, password, nome, role } = data;

    // Get users
    const users = this.getUsers();

    // Check if email already exists
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
      return { success: false, error: 'Este email já está cadastrado' };
    }

    // Create new user
    const newUser: Usuario & { password: string } = {
      email,
      nome,
      role,
      createdAt: new Date().toISOString(),
      password: this.hashPassword(password) // Simplified - in production use proper hashing
    };

    // Save user
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // Set as current user
    this.setCurrentUser(newUser, false);

    return { success: true };
  }

  // Logout method
  logout(): void {
    localStorage.removeItem(this.LOGGED_USER_KEY);
    this.currentUserSubject.next(null);
  }

  // Private methods
  private getUsers(): (Usuario & { password: string })[] {
    const stored = localStorage.getItem(this.USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private setCurrentUser(user: Usuario, persistent: boolean): void {
    // Remove password before storing
    const { password, ...userWithoutPassword } = user as Usuario & { password?: string };

    // Store in localStorage if persistent
    if (persistent) {
      localStorage.setItem(this.LOGGED_USER_KEY, JSON.stringify(userWithoutPassword));
    } else {
      sessionStorage.setItem(this.LOGGED_USER_KEY, JSON.stringify(userWithoutPassword));
    }

    // Update subject
    this.currentUserSubject.next(userWithoutPassword);
  }

  private loadUserFromStorage(): void {
    let storedUser: string | null = null;

    // Try localStorage first (persistent), then sessionStorage
    storedUser = localStorage.getItem(this.LOGGED_USER_KEY) ||
                 sessionStorage.getItem(this.LOGGED_USER_KEY);

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as Usuario;
        this.currentUserSubject.next(user);
      } catch {
        // If parsing fails, clear storage
        localStorage.removeItem(this.LOGGED_USER_KEY);
        sessionStorage.removeItem(this.LOGGED_USER_KEY);
      }
    }
  }

  // Simple password hash (in production use bcrypt or similar)
  private hashPassword(password: string): string {
    return btoa(password); // Base64 encode - NOT secure, just for demo
  }
}
