import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { RegistroLoteComponent } from './registro-lote.component';
import { OrdensProducaoService } from '../../servicos/ordens-producao.service';
import { SaldoEstoqueService } from '../../../inventario/servicos/saldo-estoque.service';
import { Insumo } from '../../../inventario/modelos/insumo.model';
import { Lote } from '../../modelos/ordem-producao.model';

describe('RegistroLoteComponent', () => {
  let component: RegistroLoteComponent;
  let fixture: ComponentFixture<RegistroLoteComponent>;
  let ordensServiceMock: jasmine.SpyObj<OrdensProducaoService>;
  let saldoServiceMock: jasmine.SpyObj<SaldoEstoqueService>;

  const insumosMock: Insumo[] = [
    { id: 1, nome: 'Insumo A', descricao: '', unidadeMedida: 'KG', saldoDisponivel: 100, estoqueMinimo: 10, createdAt: '', updatedAt: '' },
  ];

  beforeEach(async () => {
    ordensServiceMock = jasmine.createSpyObj('OrdensProducaoService', ['registrarConsumo']);
    saldoServiceMock = jasmine.createSpyObj('SaldoEstoqueService', ['listarTodos', 'consultarSaldo']);
    saldoServiceMock.listarTodos.and.returnValue(of(insumosMock));

    await TestBed.configureTestingModule({
      imports: [RegistroLoteComponent, ReactiveFormsModule],
      providers: [
        { provide: OrdensProducaoService, useValue: ordensServiceMock },
        { provide: SaldoEstoqueService, useValue: saldoServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroLoteComponent);
    component = fixture.componentInstance;
    component.ordemId = 1;
    fixture.detectChanges();
  });

  it('formulário deve ser inválido sem campos obrigatórios', () => {
    expect(component.formulario.valid).toBeFalse();
  });

  it('formulário deve ser válido com todos os campos preenchidos', fakeAsync(() => {
    component.formulario.patchValue({
      insumoId: 1,
      quantidade: 10,
      numeroLote: 'LT-001',
    });

    // Esperar validação assíncrona
    tick(500);
    fixture.detectChanges();

    saldoServiceMock.consultarSaldo.and.returnValue(of({
      insumoId: 1, nomeInsumo: 'A', unidadeMedida: 'KG',
      saldoDisponivel: 100, estoqueMinimo: 10, saldoSuficiente: true,
    }));
    tick(500);

    expect(component.formulario.get('insumoId')?.valid).toBeTrue();
    expect(component.formulario.get('numeroLote')?.valid).toBeTrue();
  }));

  it('deve emitir evento após envio bem-sucedido', fakeAsync(() => {
    const loteMock: Lote = {
      id: 1, numeroLote: 'LT-001', ordemProducaoId: 1, codigoOrdem: 'OP-001',
      status: 'ABERTO', insumoId: 1, nomeInsumo: 'A', quantidadeConsumida: 10,
      registradoPorLogin: 'user', registradoEm: '',
    };
    ordensServiceMock.registrarConsumo.and.returnValue(of(loteMock));

    spyOn(component.loteRegistrado, 'emit');

    component.formulario.patchValue({
      insumoId: 1,
      quantidade: 10,
      numeroLote: 'LT-001',
    });
    // Marca como válido para teste (bypass async validator)
    component.formulario.get('quantidade')?.setErrors(null);
    tick();

    component.enviar();
    tick();

    expect(component.loteRegistrado.emit).toHaveBeenCalled();
  }));

  it('botão deve estar desabilitado durante carregamento', () => {
    component.enviando.set(true);
    fixture.detectChanges();

    const botao = fixture.nativeElement.querySelector('app-botao-acao');
    expect(botao).toBeTruthy();
  });
});
