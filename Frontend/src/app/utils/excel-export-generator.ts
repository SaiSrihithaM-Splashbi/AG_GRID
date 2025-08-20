// excel-export-generator.ts

import { GridApi, ExcelExportParams } from 'ag-grid-community';

export class ExcelExportGenerator {
  
  /**
   * Prepares parameters and triggers the AG Grid Excel export.
   * @param gridApi The AG Grid API instance.
   * @param fileName The desired name for the exported file.
   */
  public generateExcelExport(gridApi: GridApi, fileName: string): void {
    
    // Define parameters for the export. You can customize many options here.
    const params: ExcelExportParams = {
      fileName: fileName, // The .xlsx extension is added automatically
      sheetName: 'Exported Data'
    };

    // Call the built-in AG Grid Enterprise export function
    gridApi.exportDataAsExcel(params);
  }
}