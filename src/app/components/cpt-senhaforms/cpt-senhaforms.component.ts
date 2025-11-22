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
import { EsqueciSenha } from '../../interfaces/EsqueciSenha';

/**
 * Validador customizado para verificar se os campos 'novaSenha' e 'confirmPassword' coincidem.
 * @returns ValidatorFn - A função de validação.
 */
export function senhasCoincidemValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control.parent;
    if (formGroup) {
      const senhaControl = formGroup.get('novaSenha');
      const confirmarSenhaControl = control;

      if (!senhaControl || !confirmarSenhaControl) {
        return null;
      }


      if (senhaControl.value !== confirmarSenhaControl.value) {
        return { senhasNaoCoincidem: true };
      }
    }
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

  @Output() submitSenha = new EventEmitter<EsqueciSenha>();

  senhaForms!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.senhaForms = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      novaSenha: ['', Validators.required],
      confirmPassword: ['', [Validators.required, senhasCoincidemValidator()]],
    });
  }

  // Getters para facilitar o acesso aos controles no template.
  get email() {
    return this.senhaForms.get('email')!;
  }

  get novaSenha() {
    return this.senhaForms.get('novaSenha')!;
  }

  get confirmPassword() {
    return this.senhaForms.get('confirmPassword')!;
  }

  onSubmit() {
    if (this.senhaForms.valid) {
      // Emite apenas os dados necessários, sem a confirmação de senha.
      this.submitSenha.emit({
        email: this.email.value,
        novaSenha: this.novaSenha.value,
      });
    } else {
      // Marca todos os campos como 'touched' para exibir os erros de validação.
      this.senhaForms.markAllAsTouched();
    }
  }
}
