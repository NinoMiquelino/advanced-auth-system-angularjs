import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-webauthn-register',
  templateUrl: './webauthn-register.component.html',
  styleUrls: ['./webauthn-register.component.css']
})
export class WebauthnRegisterComponent {

  constructor(private authService: AuthService) {}

  async registerWebAuthn(): Promise<void> {
    await this.authService.registerWebAuthn();
  }
}