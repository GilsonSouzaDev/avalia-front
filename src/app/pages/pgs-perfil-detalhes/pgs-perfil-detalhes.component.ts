// src/app/pages/pgs-perfil-detalhes/pgs-perfil-detalhes.component.ts

import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { CptPerfilDatalhesComponent } from '../../components/cpt-perfil-datalhes/cpt-perfil-datalhes.component';
import { CptProfessorFormsComponent } from '../../components/cpt-professor-forms/cpt-professor-forms.component';
import { Professor } from '../../interfaces/Professor';
import { AuthService } from '../../core/auth.service'; // 1. Importar o AuthService

@Component({
  selector: 'app-pgs-perfil-detalhes',
  standalone: true,
  imports: [CptPerfilDatalhesComponent, CptProfessorFormsComponent],
  templateUrl: './pgs-perfil-detalhes.component.html',
  styleUrls: ['./pgs-perfil-detalhes.component.scss'],
})
export class PgsPerfilDetalhesComponent implements OnInit {
  // 2. Injetar o AuthService
  private authService = inject(AuthService);

  // 3. Criar um signal local para armazenar os dados do professor
  public professor: WritableSignal<Professor | null> = signal(null);

  public editando = false;

  ngOnInit(): void {
    // 4. Buscar o usuário atual do AuthService e definir no signal local
    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      this.professor.set(currentUser);
    } else {
      // Lógica de segurança: se por algum motivo não houver usuário,
      // talvez redirecionar ou mostrar uma mensagem.
      console.error('Nenhum usuário logado encontrado na página de perfil.');
    }
  }

  atualizarPerfil(professorAtualizado: Professor): void {
    // 5. Atualizar o signal local e também o estado global no AuthService
    this.professor.set(professorAtualizado);
    this.authService.currentUserSig.set(professorAtualizado); 
    this.editando = false;
    console.log(
      'Perfil atualizado no estado local e global:',
      this.professor()
    );
  }

  alternarEdicao(): void {
    this.editando = !this.editando;
  }

  excluirPerfil(): void {
    // Aqui, futuramente, você chamaria um método no AuthService para exclusão
    console.log('Perfil a ser excluído:', this.professor()?.nome);
  }
}
