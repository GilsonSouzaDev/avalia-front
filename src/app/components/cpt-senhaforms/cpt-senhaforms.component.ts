import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';

/**
 * Validador customizado para verificar se os campos 'password' e 'confirmPassword' coincidem.
 * @returns ValidatorFn - A função de validação.
 */
export function senhasCoincidemValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Acessa o FormGroup pai para comparar com o campo 'password'
    const formGroup = control.parent;
    if (formGroup) {
      const senhaControl = formGroup.get('password');
      const confirmarSenhaControl = control;

      // Se os controles não existirem ou a senha ainda não foi tocada, não valide.
      if (!senhaControl || !confirmarSenhaControl) {
        return null;
      }

      // Define o erro no controle 'confirmarSenha' se os valores não baterem.
      if (senhaControl.value !== confirmarSenhaControl.value) {
        // Retorna o objeto de erro.
        return { senhasNaoCoincidem: true };
      }
    }
    // Retorna null se a validação passar (senhas coincidem).
    return null;
  };
}

@Component({
  selector: 'app-cpt-senhaforms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './cpt-senhaforms.component.html',
  styleUrls: ['./cpt-senhaforms.component.scss'],
})
export class CptSenhaformsComponent implements OnInit {

  @Output() submitSenha = new EventEmitter<{
    email: string;
    password: string;
  }>();

  senhaForms!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.senhaForms = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      // O campo 'confirmPassword' agora tem seu próprio validador customizado.
      confirmPassword: ['', [Validators.required, senhasCoincidemValidator()]],
    });
  }

  // Getters para facilitar o acesso aos controles no template.
  get email() {
    return this.senhaForms.get('email')!;
  }

  get password() {
    return this.senhaForms.get('password')!;
  }

  get confirmPassword() {
    return this.senhaForms.get('confirmPassword')!;
  }

  onSubmit() {
    if (this.senhaForms.valid) {
      // Emite apenas os dados necessários, sem a confirmação de senha.
      this.submitSenha.emit({
        email: this.email.value,
        password: this.password.value,
      });
    } else {
      // Marca todos os campos como 'touched' para exibir os erros de validação.
      this.senhaForms.markAllAsTouched();
    }
  }
}
