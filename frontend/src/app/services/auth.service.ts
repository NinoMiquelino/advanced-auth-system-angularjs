import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(email: string, password: string, name?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password, name });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(response => {
        this.setSession(response);
      }));
  }

  webauthnLogin(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/webauthn/auth-options`, { email })
      .pipe(tap(async (options) => {
        try {
          const authResp = await startAuthentication(options);
          this.http.post(`${this.apiUrl}/webauthn/auth-verify`, { 
            email, 
            authResp 
          }).subscribe({
            next: (response: any) => {
              if (response.verified) {
                this.setSession(response);
              }
            },
            error: (error) => {
              console.error('WebAuthn login failed:', error);
            }
          });
        } catch (error) {
          console.error('WebAuthn authentication failed:', error);
        }
      }));
  }

  async registerWebAuthn(): Promise<void> {
    try {
      const options = await this.http.get(`${this.apiUrl}/webauthn/reg-options`).toPromise() as any;
      const attResp = await startRegistration(options);
      
      this.http.post(`${this.apiUrl}/webauthn/reg-verify`, { attResp })
        .subscribe({
          next: (response: any) => {
            if (response.verified) {
              alert('WebAuthn registration successful!');
            }
          },
          error: (error) => {
            console.error('WebAuthn registration failed:', error);
          }
        });
    } catch (error) {
      console.error('WebAuthn registration failed:', error);
    }
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setSession(authResult: any): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }
}