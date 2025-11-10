import { Component, inject, Input } from '@angular/core';
import { Professor } from '../../interfaces/Professor';
import { AuthService } from '../../core/auth.service';
import { MatIcon } from "@angular/material/icon";
import { RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-cpt-professor-table',
  imports: [MatIcon],
  templateUrl: './cpt-professor-table.component.html',
  styleUrl: './cpt-professor-table.component.scss',
})
export class CptProfessorTableComponent {
  @Input() quantidadeQuestoes!: number;
  @Input() quantidadeMaterias!: number;
  @Input() professores!: Professor[];

  public authService = inject(AuthService);
  public router = inject(RouterLinkActive);

  get currentUser(): Professor | null | undefined {
    return this.authService.currentUserSig();
  }

  verDetalhes(professor: Professor): void {

    console.log(`Ver detalhes do professor com ID: ${professor}`);
  }


}
