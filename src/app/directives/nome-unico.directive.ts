import { Directive, Input, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  NG_ASYNC_VALIDATORS,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProfessorService } from '../services/professor.service'; // Ajuste o caminho

@Directive({
  selector: '[appNomeUnico]',
  standalone: true,
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: NomeUnicoDirective,
      multi: true,
    },
  ],
})
export class NomeUnicoDirective implements AsyncValidator {
  @Input('ignorarId') ignorarId?: number; // Recebe o ID se estiver editando
  private professorService = inject(ProfessorService);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    const existe = this.professorService.verificarNomeExistente(
      control.value,
      this.ignorarId
    );

    // Se existe, retorna o erro { nomeExistente: true }, senão null
    return of(existe ? { nomeExistente: true } : null);
  }
}
