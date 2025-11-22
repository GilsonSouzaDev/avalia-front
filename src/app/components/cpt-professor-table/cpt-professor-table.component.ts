import {
  Component,
  Input,
  inject,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { Professor } from '../../interfaces/Professor';
import { AuthService } from '../../core/auth.service';
import { MatIconModule } from '@angular/material/icon'; // Use MatIconModule
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router'; // Importe RouterLink diretamente

@Component({
  selector: 'app-cpt-professor-table',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatPaginatorModule, RouterLink],
  templateUrl: './cpt-professor-table.component.html',
  styleUrl: './cpt-professor-table.component.scss',
})
export class CptProfessorTableComponent implements OnChanges {
  @Input() professores: Professor[] = [];

  // Funções passadas pelo pai. Nota: Chamar função no template reduz performance,
  // mas vamos manter para não quebrar a lógica do pai agora.
  @Input() quantidadeQuestoes!: (professor: any) => number;
  @Input() quantidadeMaterias!: (professor: any) => number;

  @Output() novo = new EventEmitter<void>();

  private authService = inject(AuthService);

  length = 0;
  pageSize = 5;
  pageIndex = 0;

  // Propriedade computada para paginação
  professoresPaginados: Professor[] = [];

  ngOnChanges() {
    this.atualizarPaginacao();
  }

  novoProfessor() {
    this.novo.emit();
  }

  trocarPagina(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.atualizarPaginacao();
  }

  private atualizarPaginacao() {
    if (!this.professores) {
      this.professoresPaginados = [];
      this.length = 0;
      return;
    }

    this.length = this.professores.length;
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.professoresPaginados = this.professores.slice(start, end);
  }

  get currentUser() {
    return this.authService.currentUserSig();
  }
}
