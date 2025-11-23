import { Directive, Input, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  NG_ASYNC_VALIDATORS,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { ProfessorService } from '../services/professor.service'; // Ajuste o caminho

@Directive({
  selector: '[appEmailUnico]',
  standalone: true,
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: EmailUnicoDirective,
      multi: true,
    },
  ],
})
export class EmailUnicoDirective implements AsyncValidator {
  @Input('ignorarId') ignorarId?: number;
  private professorService = inject(ProfessorService);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    const existe = this.professorService.verificarEmailExistente(
      control.value,
      this.ignorarId
    );

    // Se existe, retorna o erro { emailExistente: true }, senão null
    return of(existe ? { emailExistente: true } : null);
  }
}
