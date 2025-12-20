import { Pipe, PipeTransform } from '@angular/core';
import { Professor } from '../interfaces/Professor';

@Pipe({
  name: 'nomeProfessor',
})
export class NomeProfessorPipe implements PipeTransform {

  transform(codigoProfessor: number, professores: Professor[]): string {
    if (!codigoProfessor || !professores?.length) {
      return 'Desconhecido';
    }

    const professor = professores.find((p) => p.id === codigoProfessor);
    return professor ? professor.nome : 'Desconhecido';
  }
}
