import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

// IMPORTS ADICIONADOS
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cpt-loginforms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    // MÓDULOS ADICIONADOS NO IMPORTS
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './cpt-loginforms.component.html',
  styleUrls: ['./cpt-loginforms.component.scss'],
})
export class CptLoginformsComponent implements OnInit {
  @Output() submitLogin = new EventEmitter<{
    email: string;
    password: string;
  }>();

  loginForm!: FormGroup;
  currentRoute = '';

  // VARIÁVEL DE ESTADO ADICIONADA
  hide = true;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.currentRoute = this.router.url;

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.updateFormValidators();
      });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: [''],
    });

    this.updateFormValidators();
  }

  updateFormValidators() {
    const passwordControl = this.loginForm.get('password');
    const confirmPasswordControl = this.loginForm.get('confirmPassword');

    // LIMPE QUALQUER VALIDADOR ANTES DE REAPLICAR PARA EVITAR DUPLICIDADE
    passwordControl?.clearValidators();
    confirmPasswordControl?.clearValidators();
    this.loginForm.clearValidators();

    passwordControl?.setValidators(Validators.required);

    if (this.showOnlyOn('/nova')) {
      confirmPasswordControl?.setValidators(Validators.required);

      // 1. Defina o validador de grupo
      this.loginForm.setValidators(this.senhasCoincidem.bind(this));

      // 2. Assine o 'valueChanges' dos controles para forçar a revalidação do GRUPO
      passwordControl?.valueChanges.subscribe(() => {
        this.loginForm.updateValueAndValidity({ onlySelf: true });
      });

      confirmPasswordControl?.valueChanges.subscribe(() => {
        this.loginForm.updateValueAndValidity({ onlySelf: true });
      });
    }

    confirmPasswordControl?.updateValueAndValidity();
    this.loginForm.updateValueAndValidity();
  }

  senhasCoincidem(group: AbstractControl): { [key: string]: any } | null {
    const senha = group.get('password')?.value;
    const confirmarSenha = group.get('confirmPassword')?.value;

    if (!senha || !confirmarSenha) {
      return null;
    }

    return senha === confirmarSenha ? null : { senhasNaoCoincidem: true };
  }

  showOnlyOn(route: string) {
    return this.currentRoute === route;
  }

  get confirmPassword() {
    return this.loginForm.get('confirmPassword')!;
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.submitLogin.emit(this.loginForm.value);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
