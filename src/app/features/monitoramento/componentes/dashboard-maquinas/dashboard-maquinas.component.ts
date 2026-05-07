import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaquinasStore } from '../../estado/maquinas.store';
import { CardStatusMaquinaComponent } from '../card-status-maquina/card-status-maquina.component';

@Component({
  selector: 'app-dashboard-maquinas',
  standalone: true,
  imports: [CardStatusMaquinaComponent, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './dashboard-maquinas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardMaquinasComponent implements OnInit, OnDestroy {

  readonly store = inject(MaquinasStore);

  ngOnInit(): void {
    this.store.iniciarMonitoramento();
  }

  ngOnDestroy(): void {
    this.store.pararMonitoramento();
  }
}
