import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelAdotanteComponent } from './painel-adotante.component';

describe('PainelAdotanteComponent', () => {
  let component: PainelAdotanteComponent;
  let fixture: ComponentFixture<PainelAdotanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelAdotanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelAdotanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
