import { Component, inject, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { of } from 'rxjs';

import { DisciplinaService } from '../../services/disciplina.service';
import { AlternativaService } from '../../services/alternativa.service';
import { ProfessorService } from '../../services/professor.service';
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
export class PgsListDisciplinaComponent implements OnInit {
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private alternativaService = inject(AlternativaService);
  private disciplinaService = inject(DisciplinaService);
  private professorService = inject(ProfessorService);

  disciplinas = this.disciplinaService.disciplinas;
  professores = this.professorService.professores;

  get usuario() {
    return this.authService.currentUserSig();
  }

  get disciplinasFiltradas() {
    return filtrarDisciplinasPorPerfil(this.disciplinas(), this.usuario);
  }

  ngOnInit(): void {
    this.buscarDisciplinas();
  }

  buscarDisciplinas() {
    this.disciplinaService.loadAll();
  }

  onAlterarAlternativa(alternativa: Alternativa) {
    this.dialogService
      .confirmAction({
        title: 'Confirmar Alteração',
        message: 'Deseja salvar as alterações?',
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        titleColor: '#1565c0',
        action: () => of(true),
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (confirmado) {
          this.alternativaService.updateAlternativa(alternativa).subscribe({
            next: () => {
              this.buscarDisciplinas();
            },
            error: (err) => console.error(err),
          });
        }
      });
  }
}
