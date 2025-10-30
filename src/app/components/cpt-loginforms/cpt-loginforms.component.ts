import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-cpt-loginforms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
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

  // cpt-loginforms.component.ts

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
      //    Isso garante que o erro de grupo ('senhasNaoCoincidem') seja avaliado imediatamente.

      passwordControl?.valueChanges.subscribe(() => {
        this.loginForm.updateValueAndValidity({ onlySelf: true }); // Apenas revalida o grupo
      });

      confirmPasswordControl?.valueChanges.subscribe(() => {
        this.loginForm.updateValueAndValidity({ onlySelf: true }); // Apenas revalida o grupo
      });
    }

    // No else, você limpa os observables se estiver voltando para /login

    // ... resto do seu código ...

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
