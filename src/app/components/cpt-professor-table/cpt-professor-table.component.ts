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
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cpt-professor-table',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatPaginatorModule,
    RouterLink,
    MatButtonModule,
  ],
  templateUrl: './cpt-professor-table.component.html',
  styleUrl: './cpt-professor-table.component.scss',
})
export class CptProfessorTableComponent implements OnChanges {
  @Input() professores: Professor[] = [];
  @Input() quantidadeQuestoes!: (professor: any) => number;
  @Input() quantidadeMaterias!: (professor: any) => number;
  @Output() novo = new EventEmitter<void>();

  private authService = inject(AuthService);

  length = 0;
  pageSize = 5;
  pageIndex = 0;
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

  // Gera as iniciais do nome para o avatar
  iniciais(nome: string): string {
    if (!nome) return '?';
    const partes = nome
      .trim()
      .split(' ')
      .filter((p) => p.length > 0);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
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
