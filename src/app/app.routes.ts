import { PgsPerfilDetalhesComponent } from './pages/pgs-perfil-detalhes/pgs-perfil-detalhes.component';
import { Routes } from '@angular/router';
import { PgsLoginComponent } from './pages/pgs-login/pgs-login.component';
import { PgsNovaSenhaComponent } from './pages/pgs-nova-senha/pgs-nova-senha.component';
import { PgsDashboardComponent } from './pages/pgs-dashboard/pgs-dashboard.component';
import { PgsListDisciplinaComponent } from './pages/pgs-list-disciplina/pgs-list-disciplina.component';
import { PgsCadastrarProfessorComponent } from './pages/pgs-cadastrar-professor/pgs-cadastrar-professor.component';
import { PgsCadastrarPerguntaComponent } from './pages/pgs-cadastrar-pergunta/pgs-cadastrar-pergunta.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: PgsDashboardComponent },
  { path: 'disciplina', component: PgsListDisciplinaComponent },
  { path: 'perfil', component: PgsPerfilDetalhesComponent },
  { path: 'professor', component: PgsCadastrarProfessorComponent },
  { path: 'pergunta', component: PgsCadastrarPerguntaComponent },
];
