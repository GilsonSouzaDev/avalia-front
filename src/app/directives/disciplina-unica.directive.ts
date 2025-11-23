import { Directive, Input, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  NG_ASYNC_VALIDATORS,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { DisciplinaService } from '../services/disciplina.service';

@Directive({
  selector: '[appDisciplinaUnica]',
  standalone: true,
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: DisciplinaUnicaDirective,
      multi: true,
    },
  ],
})
export class DisciplinaUnicaDirective implements AsyncValidator {
  // CORREÇÃO: Aceita number, string ou null para evitar erro de tipagem no template
  @Input('appDisciplinaUnica') ignorarId?: number | string | null;

  private service = inject(DisciplinaService);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    const nome = control.value;

    // Tratamento seguro do ID
    let idParaIgnorar: number | undefined = undefined;

    if (typeof this.ignorarId === 'number') {
      idParaIgnorar = this.ignorarId;
    } else if (
      typeof this.ignorarId === 'string' &&
      this.ignorarId.trim() !== ''
    ) {
      // Tenta converter se for string numérica (ex: "123")
      const parsed = parseInt(this.ignorarId, 10);
      if (!isNaN(parsed)) {
        idParaIgnorar = parsed;
      }
    }
    // Se for null, undefined ou string vazia, idParaIgnorar continua undefined (correto para criação)

    const existe = this.service.verificarNomeExistente(nome, idParaIgnorar);

    return of(existe ? { disciplinaExistente: true } : null);
  }
}
