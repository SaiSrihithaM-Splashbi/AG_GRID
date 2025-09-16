import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { SidePanelComponent } from '../side-panel/side-panel.component';
import { GridStylingOptions, DEFAULT_GRID_STYLING } from '../utils/grid-styling.model';
import { ExcelExporter } from '../utils/excel-export-generator';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular, SidePanelComponent],
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss'],
})
export class DataGridComponent implements OnInit {
  public columnDefs: ColDef[] = [];
  public rowData: any[] = [];
  public gridApi!: GridApi;
  public gridOptions: GridOptions = { excelStyles: [] };
  public fileName = 'CustomerDataReport';

  public currentStyling: GridStylingOptions = { ...DEFAULT_GRID_STYLING };

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    this.currentStyling = { ...DEFAULT_GRID_STYLING };
    await this.loadData();
    this.initializeColumns();
    this.updateExcelStyles(); // initialize excelStyles (safe with empty rowData)
  }

  async loadData() {
    try {
      this.rowData = await firstValueFrom(
        this.http.get<any[]>('https://api.npoint.io/0999a1c288e52309858f')
      );
      // Recompute columns & styles when data arrives
      this.initializeColumns();
      this.updateExcelStyles();
    } catch (e) {
      console.error('Failed to load data', e);
    }
  }

  initializeColumns() {
    if (!this.rowData?.length) {
      this.columnDefs = [];
      return;
    }

    this.columnDefs = Object.keys(this.rowData[0]).map((field) => {
      // dynamic cellClassRules: mark alternate rows and per-column-alternate class
      const cellClassRules: Record<string, (params: any) => boolean> = {
        // generic alt-row class
        alternateRow: (params: any) => {
          const idx = params.node?.rowIndex ?? -1;
          return idx % 2 === 1;
        },
      };
      // per-column alternate class (col_<field>_alternate)
      cellClassRules[`col_${field}_alternate`] = (params: any) => {
        const idx = params.node?.rowIndex ?? -1;
        return idx % 2 === 1;
      };

      return {
        headerName: this.capitalize(field),
        field,
        sortable: true,
        filter: true,
        resizable: true,

        // match Excel style IDs produced by exporter
        headerClass: 'header',
        // add both per-column id class and default fallback
        cellClass: [`col_${field}`, 'default'],

        cellClassRules,

        // DOM-only visual styling for the on-screen grid
        headerStyle: {
          'background-color': this.currentStyling.columnHeader.backgroundColor,
          color: this.currentStyling.columnHeader.color,
          'font-size': `${this.currentStyling.columnHeader.fontSize}px`,
          'font-weight': this.currentStyling.columnHeader.fontWeight,
          height: `${this.currentStyling.columnHeader.height}px`,
          'text-align': this.currentStyling.columnHeader.textAlign,
          'border-bottom': `${this.currentStyling.grid.horizontal.thickness}px solid ${this.currentStyling.grid.horizontal.color}`,
          padding: `${this.currentStyling.grid.horizontal.padding}px ${this.currentStyling.grid.vertical.padding}px`,
        },
        cellStyle: (params: any) => this.buildCellUiStyle(params),
      } as ColDef;
    });
  }

  private buildCellUiStyle(params: any) {
    const rowIndex = params.node?.rowIndex ?? -1;
    const isAlternate = rowIndex % 2 === 1;

    return {
      'font-style': this.currentStyling.values.fontStyle,
      'font-size': `${this.currentStyling.values.fontSize}px`,
      'font-weight': this.currentStyling.values.fontWeight,
      'text-align': this.currentStyling.values.textAlign,
      'background-color': isAlternate
        ? this.currentStyling.values.alternateRowBackground
        : this.currentStyling.values.backgroundColor,
      color: isAlternate
        ? this.currentStyling.values.alternateRowFont
        : this.currentStyling.values.fontColor,
      'border-bottom': `${this.currentStyling.grid.horizontal.thickness}px solid ${this.currentStyling.grid.horizontal.color}`,
      'border-right': `${this.currentStyling.grid.vertical.thickness}px solid ${this.currentStyling.grid.vertical.color}`,
      padding: `${this.currentStyling.grid.horizontal.padding}px ${this.currentStyling.grid.vertical.padding}px`,
    };
  }

  capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.updateExcelStyles();
    this.gridApi.refreshCells({ force: true });
    this.gridApi.refreshHeader();
  }

  onStylingChanged(updated: Partial<GridStylingOptions>) {
    this.currentStyling = { ...this.currentStyling, ...updated };
    this.updateExcelStyles();
    this.gridApi?.refreshCells({ force: true });
    this.gridApi?.refreshHeader();
    this.applyCssVariables();
  }

  // Centralized: ask exporter to build ExcelStyle[] and set it on gridOptions
  private updateExcelStyles() {
    const columns = this.rowData?.length ? Object.keys(this.rowData[0]) : [];
    // Build ExcelStyle[] via exporter (single source of truth)
    const excelStyles = ExcelExporter.buildExcelStyles(this.currentStyling, columns);
    // Keep gridOptions in sync so template binding [excelStyles]="gridOptions.excelStyles" works
    this.gridOptions = { ...this.gridOptions, excelStyles };
  }

  applyCssVariables() {
    const apply = (obj: any, prefix = '') => {
      for (const [key, val] of Object.entries(obj)) {
        const varName = prefix ? `${prefix}-${key}` : key;
        if (typeof val === 'object' && val !== null) {
          apply(val, varName);
        } else {
          document.documentElement.style.setProperty(
            `--${varName.replace(/[A-Z]/g, '-$&').toLowerCase()}`,
            String(val)
          );
        }
      }
    };
    apply(this.currentStyling);
  }

  exportAsExcel() {
    if (!this.gridApi) return;

    // Build canonical payload and log in the same shape your earlier code used (dataProperties stringified)
    const payload = ExcelExporter.buildExportPayload(this.currentStyling, this.rowData);

    // Console parity: big JSON with stringified dataProperties for compatibility with existing code/UX
    const exportJson = {
      dataProperties: JSON.stringify(payload.dataProperties),
      widgetProperties: payload.widgetProperties,
      tableData: payload.tableData,
    };
    console.log('Generated Export JSON:', exportJson);

    // Also log the style dictionary (for debugging / parity)
    const styleDict = ExcelExporter.extractSupportedStyles(this.currentStyling);
    console.log('Generated Dictionary:', styleDict);

    // Save excelStyles to gridOptions so ag-Grid has them
    const columns = this.rowData?.length ? Object.keys(this.rowData[0]) : [];
    this.gridOptions = { ...this.gridOptions, excelStyles: ExcelExporter.buildExcelStyles(this.currentStyling, columns) };

    // EXPORT: use the giant payload as the source-of-truth for the exporter's extraction
    ExcelExporter.generateFromPayload(this.gridApi, this.fileName, payload);
  }
}
