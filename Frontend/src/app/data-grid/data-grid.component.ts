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
  }

  async loadData() {
    try {
      this.rowData = await firstValueFrom(
        this.http.get<any[]>('https://api.npoint.io/5243d7ba22d1db8048b9')
      );
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
      return {
        headerName: this.capitalize(field),
        field,
        sortable: true,
        filter: true,
        resizable: true,

        // ✅ match Excel style IDs
        headerClass: 'header',
        cellClass: [`col_${field}`, 'default'],

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

  private updateExcelStyles() {
    const styleDict = ExcelExporter.extractSupportedStyles(this.currentStyling);
    const columnStyles = this.buildColumnStyles();
    this.gridOptions.excelStyles = ExcelExporter.generateStyles(styleDict, columnStyles);
  }

  buildColumnStyles(): Record<string, any> {
    const styles: Record<string, any> = {};
    if (!this.rowData?.length) return styles;

    const sample = this.rowData[0];
    Object.keys(sample).forEach((key) => {
      styles[key] = {
        ...this.flattenObject(this.currentStyling.values),
        'header-text-align': this.currentStyling.columnHeader.textAlign,
      };
    });

    return styles;
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

    const json = this.buildExportJson();
    console.log('Generated Export JSON:', json);

    const styleDict = ExcelExporter.extractSupportedStyles(this.currentStyling);
    console.log('Generated Dictionary:', styleDict); // ✅ log dictionary separately

    const excelStyles = ExcelExporter.generateStyles(styleDict, this.buildColumnStyles());
    ExcelExporter.generate(this.gridApi, this.fileName, excelStyles);
  }

  private buildExportJson() {
    const dataProperties: Record<string, any> = {};

    if (this.rowData?.length) {
      Object.keys(this.rowData[0]).forEach((key) => {
        dataProperties[key] = {
          displayName: this.capitalize(key),
          ...this.flattenObject(this.currentStyling.values),
          'header-text-align': this.currentStyling.columnHeader.textAlign,
        };
      });
    }

    const widgetProperties = {
      ...this.flattenObject(this.currentStyling),
      columns: {
        All: {
          ...this.flattenObject(this.currentStyling.values),
          'header-text-align': this.currentStyling.columnHeader.textAlign,
        },
      },
    };

    return {
      dataProperties: JSON.stringify(dataProperties),
      widgetProperties,
      tableData: this.rowData,
    };
  }

  private flattenObject(obj: any, parentKey = ''): Record<string, any> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = parentKey ? `${parentKey}-${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(acc, this.flattenObject(value, newKey));
      } else {
        acc[newKey] = value;
      }

      return acc;
    }, {} as Record<string, any>);
  }
}
