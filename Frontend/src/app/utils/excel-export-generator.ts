import { GridApi, ExcelExportParams } from 'ag-grid-community';

export class ExcelExportGenerator {
  public generateExcelExport(gridApi: GridApi, fileName: string): void {
    const params: ExcelExportParams = {
      fileName: fileName,
      sheetName: 'Exported Data'
    };
    gridApi.exportDataAsExcel(params);
  }
}
