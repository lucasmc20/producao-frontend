import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MaquinasStore } from './maquinas.store';
import { TelemetriaService } from '../servicos/telemetria.service';
import { Maquina, EventoStatusMaquina } from '../modelos/maquina.model';

describe('MaquinasStore', () => {
  let store: MaquinasStore;
  let telemetriaServiceMock: jasmine.SpyObj<TelemetriaService>;

  const maquinasMock: Maquina[] = [
    { id: 1, nome: 'Misturador A', tipo: 'MISTURA', status: 'OPERANDO', localizacao: 'Setor 1', createdAt: '', updatedAt: '' },
    { id: 2, nome: 'Envasadora B', tipo: 'ENVASE', status: 'MANUTENCAO', localizacao: 'Setor 2', createdAt: '', updatedAt: '' },
    { id: 3, nome: 'Reator C', tipo: 'REACAO', status: 'PARADA_EMERGENCIA', localizacao: 'Setor 3', createdAt: '', updatedAt: '' },
  ];

  beforeEach(() => {
    telemetriaServiceMock = jasmine.createSpyObj('TelemetriaService', [
      'obterStatusViaPolling', 'obterStatusMaquinas', 'desconectar'
    ]);
    telemetriaServiceMock.obterStatusViaPolling.and.returnValue(of(maquinasMock));
    telemetriaServiceMock.obterStatusMaquinas.and.returnValue(of());

    TestBed.configureTestingModule({
      providers: [
        MaquinasStore,
        { provide: TelemetriaService, useValue: telemetriaServiceMock },
      ],
    });

    store = TestBed.inject(MaquinasStore);
  });

  afterEach(() => store.pararMonitoramento());

  it('totalEmOperacao deve retornar contagem correta', () => {
    store.iniciarMonitoramento();
    expect(store.totalEmOperacao()).toBe(1);
  });

  it('totalComAlerta deve retornar contagem correta', () => {
    store.iniciarMonitoramento();
    expect(store.totalComAlerta()).toBe(1);
  });

  it('totalParadas deve retornar contagem correta', () => {
    store.iniciarMonitoramento();
    expect(store.totalParadas()).toBe(1);
  });

  it('erro deve ser atualizado quando polling falha', () => {
    telemetriaServiceMock.obterStatusViaPolling.and.returnValue(
      throwError(() => new Error('Falha na conexão'))
    );

    store.iniciarMonitoramento();
    expect(store.erro()).toBe('Falha na conexão');
  });

  it('deve atualizar status da máquina ao receber evento WebSocket', () => {
    const evento: EventoStatusMaquina = {
      maquinaId: 1,
      nomeMaquina: 'Misturador A',
      statusAnterior: 'OPERANDO',
      statusAtual: 'MANUTENCAO',
      ocorridoEm: '2024-01-01T00:00:00Z',
    };

    telemetriaServiceMock.obterStatusMaquinas.and.returnValue(of(evento));
    store.iniciarMonitoramento();

    expect(store.maquinas().find(m => m.id === 1)?.status).toBe('MANUTENCAO');
  });
});
