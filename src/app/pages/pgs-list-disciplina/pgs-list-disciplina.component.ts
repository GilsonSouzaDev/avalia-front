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
        action: () => {
          return this.alternativaService.updateAlternativa(alternativa);
        },
      })
      .afterClosed()
      .subscribe((sucesso) => {
        if (sucesso) {
          console.log('Alternativa atualizada com sucesso!');
        }
      });
  }
}
