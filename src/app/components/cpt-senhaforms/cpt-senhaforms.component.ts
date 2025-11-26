import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EsqueciSenha } from '../../interfaces/EsqueciSenha';
import { ProfessorService } from '../../services/professor.service';
import { emailCadastradoValidator } from '../../validators/email-cadastro.validator';


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
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './cpt-senhaforms.component.html',
  styleUrls: ['./cpt-senhaforms.component.scss'],
})
export class CptSenhaformsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private professorService = inject(ProfessorService);

  ocultarSenha = true;
  ocultarConfirmacao = true;
  senhaForms!: FormGroup;

  @Output() submitSenha = new EventEmitter<EsqueciSenha>();

  ngOnInit() {
    this.senhaForms = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.email],
        [emailCadastradoValidator(this.professorService)],
      ],
      novaSenha: ['', Validators.required],
      confirmPassword: ['', [Validators.required, senhasCoincidemValidator()]],
    });
  }

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
      this.submitSenha.emit({
        email: this.email.value,
        novaSenha: this.novaSenha.value,
      });
    } else {
      this.senhaForms.markAllAsTouched();
    }
  }
}
