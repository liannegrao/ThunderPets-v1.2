import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelVoluntarioComponent } from './painel-voluntario.component';

describe('PainelVoluntarioComponent', () => {
  let component: PainelVoluntarioComponent;
  let fixture: ComponentFixture<PainelVoluntarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelVoluntarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelVoluntarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
