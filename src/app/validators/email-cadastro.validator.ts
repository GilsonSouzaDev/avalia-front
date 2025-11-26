import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ProfessorService } from '../services/professor.service';

export function emailCadastradoValidator(
  professorService: ProfessorService
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return timer(500).pipe(
      switchMap(() => {
        const existe = professorService.verificarEmailExistente(control.value);
        return of(existe ? null : { emailNaoEncontrado: true });
      })
    );
  };
}
