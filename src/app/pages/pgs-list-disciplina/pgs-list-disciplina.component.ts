import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { Disciplina } from '../../interfaces/Disciplina';
import { AuthService } from '../../core/auth.service';
import { filtrarDisciplinasPorPerfil } from '../../utils/disicplina-filter-util';
import { MOCK_DISCIPLINAS, MOCK_PROFESSORES } from '../../data/mock-data';
import { CptTableMateriaComponent } from '../../components/cpt-table-materia/cpt-table-materia.component';
import { Alternativa } from '../../interfaces/Alternativa';
import { AlternativaService } from '../../services/alternativa.service';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-pgs-list-disciplina',
  standalone: true,
  imports: [MatTabsModule, CptTableMateriaComponent],
  templateUrl: './pgs-list-disciplina.component.html',
  styleUrl: './pgs-list-disciplina.component.scss',
})
export class PgsListDisciplinaComponent {
  disciplinas = MOCK_DISCIPLINAS;
  professores = MOCK_PROFESSORES;

  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private alternativaService = inject(AlternativaService);

  get usuario() {
    return this.authService.currentUserSig();
  }

  get disciplinasFiltradas() {
    return filtrarDisciplinasPorPerfil(this.disciplinas, this.usuario);
  }

  onAlterarAlternativa(alternativa: Alternativa) {
    this.dialogService
      .confirmAction({
        title: 'Confirmar Alteração',
        message: 'Deseja salvar as alterações no texto da alternativa?',
        confirmButtonText: 'Salvar Alterações',
        cancelButtonText: 'Cancelar',
        action: () => {
          return of(true).pipe(
            delay(1000),
            tap(() => {
              this.alternativaService.updateAlternativa(alternativa);
            })
          );
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
