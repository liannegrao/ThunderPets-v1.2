import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelMediadorComponent } from './painel-mediador.component';

describe('PainelMediadorComponent', () => {
  let component: PainelMediadorComponent;
  let fixture: ComponentFixture<PainelMediadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelMediadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelMediadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
