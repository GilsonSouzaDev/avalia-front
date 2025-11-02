import { Component } from '@angular/core';
import { CptCardResumoComponent } from "../../components/cpt-card-resumo/cpt-card-resumo.component";
import { CptCardMateriaComponent } from "../../components/cpt-card-materia/cpt-card-materia.component";

@Component({
  selector: 'app-pgs-dashboard',
  imports: [CptCardResumoComponent, CptCardMateriaComponent],
  templateUrl: './pgs-dashboard.component.html',
  styleUrl: './pgs-dashboard.component.scss'
})
export class PgsDashboardComponent {


  materias: Array<{ materia: string; totalQuestoes: number }> = [
    { materia: 'Banco de Dados', totalQuestoes: 12 },
    { materia: 'Front End', totalQuestoes: 25 },
    { materia: 'Java', totalQuestoes: 5 },
  ];

}
