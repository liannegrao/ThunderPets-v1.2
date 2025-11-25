import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelDoadorComponent } from './painel-doador.component';

describe('PainelDoadorComponent', () => {
  let component: PainelDoadorComponent;
  let fixture: ComponentFixture<PainelDoadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelDoadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelDoadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
