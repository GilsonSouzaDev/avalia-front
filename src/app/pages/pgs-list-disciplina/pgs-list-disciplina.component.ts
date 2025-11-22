import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { DisciplinaService } from '../../services/disciplina.service';
import { AlternativaService } from '../../services/alternativa.service';
import { ProfessorService } from '../../services/professor.service'; // Adicionado
import { DialogService } from '../../shared/services/dialog.service';
import { filtrarDisciplinasPorPerfil } from '../../utils/disicplina-filter-util';
import { CptTableMateriaComponent } from '../../components/cpt-table-materia/cpt-table-materia.component';
import { Alternativa } from '../../interfaces/Alternativa';
import { AuthService } from '../../core/auth.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-pgs-list-disciplina',
  standalone: true,
  imports: [MatTabsModule, CptTableMateriaComponent],
  templateUrl: './pgs-list-disciplina.component.html',
  styleUrl: './pgs-list-disciplina.component.scss',
})
export class PgsListDisciplinaComponent {
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private alternativaService = inject(AlternativaService);
  private disciplinaService = inject(DisciplinaService);
  private professorService = inject(ProfessorService); // Injetado

  disciplinas = this.disciplinaService.disciplinas;
  professores = this.professorService.professores; // Necessário para o HTML

  get usuario() {
    return this.authService.currentUserSig();
  }

  get disciplinasFiltradas() {
    return filtrarDisciplinasPorPerfil(this.disciplinas(), this.usuario);
  }

  onAlterarAlternativa(alternativa: Alternativa) {
    this.dialogService
      .confirmAction({
        title: 'Confirmar Alteração',
        message: 'Deseja salvar as alterações no texto da alternativa?',
        confirmButtonText: 'Salvar Alterações',
        cancelButtonText: 'Cancelar',
        titleColor: '#1565c0',
        // SOLUÇÃO ERRO 2: Passamos uma função vazia ou dummy para satisfazer a interface
        action: () => of(true),
      })
      .afterClosed()
      // SOLUÇÃO ERRO 1: Ajustamos o tipo para aceitar 'undefined'
      .subscribe((confirmado: boolean | undefined) => {
        // O 'if' trata tanto o false quanto o undefined
        if (confirmado) {
          this.alternativaService.updateAlternativa(alternativa).subscribe({
            next: (res) => {
              console.log('Alternativa atualizada com sucesso!', res);
            },
            error: (err) => {
              console.error('Erro ao atualizar:', err);
            },
          });
        }
      });
  }
}
