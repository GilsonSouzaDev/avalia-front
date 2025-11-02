import { Routes } from '@angular/router';
import { PgsLoginComponent } from './pages/pgs-login/pgs-login.component';
import { PgsNovaSenhaComponent } from './pages/pgs-nova-senha/pgs-nova-senha.component';
import { PgsDashboardComponent } from './pages/pgs-dashboard/pgs-dashboard.component';
import { PgsListDisciplinaComponent } from './pages/pgs-list-disciplina/pgs-list-disciplina.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: PgsDashboardComponent },
  { path: 'nova', component: PgsNovaSenhaComponent },
  { path: 'disciplina', component: PgsListDisciplinaComponent },
];
