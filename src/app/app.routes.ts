import { PgsPerfilDetalhesComponent } from './pages/pgs-perfil-detalhes/pgs-perfil-detalhes.component';
import { Routes } from '@angular/router';
import { PgsLoginComponent } from './pages/pgs-login/pgs-login.component';
import { PgsNovaSenhaComponent } from './pages/pgs-nova-senha/pgs-nova-senha.component';
import { PgsDashboardComponent } from './pages/pgs-dashboard/pgs-dashboard.component';
import { PgsListDisciplinaComponent } from './pages/pgs-list-disciplina/pgs-list-disciplina.component';
import { PgsCadastrarPerguntaComponent } from './pages/pgs-cadastrar-pergunta/pgs-cadastrar-pergunta.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { authGuard } from './core/auth.guard';
import { PgsGerenciarProfessorComponent } from './pages/pgs-gerenciar-professor/pgs-gerenciar-professor.component';
import { PgsGerenciarDisciplinaComponent } from './pages/pgs-gerenciar-disciplina/pgs-gerenciar-disciplina.component';


export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: PgsLoginComponent },
      { path: 'nova', component: PgsNovaSenhaComponent },
    ],
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PgsDashboardComponent },
      { path: 'disciplina', component: PgsListDisciplinaComponent },
      { path: 'detalhes/:id', component: PgsPerfilDetalhesComponent },
      { path: 'gerenciar', component: PgsGerenciarProfessorComponent },
      { path: 'gerenciar-disc', component: PgsGerenciarDisciplinaComponent },
      { path: 'pergunta', component: PgsCadastrarPerguntaComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];







