import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { AgGridAngular } from 'ag-grid-angular';
// import { ColDef } from 'ag-grid-enterprise';
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { DataGridComponent } from './data-grid/data-grid.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [DataGridComponent]
})
export class AppComponent {
  
}
