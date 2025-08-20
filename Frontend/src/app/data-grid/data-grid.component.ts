import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import 'ag-grid-enterprise';


// Import AgGridAngular and CommonModule for Standalone Components
import { AgGridAngular } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';

// Import the helper classes
import { ExcelExportGenerator } from '../utils/excel-export-generator';
import { PDFDocumentGenerator } from '../utils/pdf-document-generator';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular
  ],
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {

  public columnDefs: ColDef[] = [
    { headerName: 'Name', field: 'Name', sortable: true, filter: true },
    { headerName: 'Email', field: 'email', sortable: true, filter: true },
    { headerName: 'Country', field: 'country', sortable: true, filter: true },
    { headerName: 'Phone', field: 'phone', sortable: true, filter: true }
  ];

  public rowData: any[] = [];
  private gridApi!: GridApi;
  public fileName: string = 'CustomerDataReport';

  constructor(private http: HttpClient) { }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    let requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(firstValueFrom(this.http.get<any>(`https://api.npoint.io/d106e93bb3b59ebfc03a`)));
    }
    const responses = await Promise.all(requests);
    this.rowData = responses.flat();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  // --- REFACTORED EXPORT METHODS ---

  public exportAsExcel() {
    new ExcelExportGenerator().generateExcelExport(this.gridApi, this.fileName);
  }

  /**
   * Exports data to PDF using a dynamic import to prevent build errors.
   */
  public async exportAsPdf() {
  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const pdfFonts = await import('pdfmake/build/vfs_fonts');

  // ✅ Assign vfs directly — this avoids the typing issue
  pdfMakeModule.default.vfs = pdfFonts.vfs;

  const pdfDocDef = new PDFDocumentGenerator().generateDocument(this.gridApi, this.fileName);
  pdfMakeModule.default.createPdf(pdfDocDef).download(`${this.fileName}.pdf`);
}
}






// import { Component, OnInit } from '@angular/core';
// import { AgGridAngular } from 'ag-grid-angular';
// import { ModuleRegistry, AllCommunityModule, ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
// import { firstValueFrom } from 'rxjs';

// // Import libraries for PDF, Excel, and PPTX export
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx';
// // import PptxGenJS from 'pptxgenjs';


// ModuleRegistry.registerModules([AllCommunityModule]);

// @Component({
//   selector: 'app-data-grid',
//   standalone: true,
//   imports: [CommonModule, AgGridAngular],
//   templateUrl: './data-grid.component.html',
//   styleUrl: './data-grid.component.scss'
// })
// export class DataGridComponent implements OnInit {

//   public columnDefs: ColDef[] = [
//     { headerName: 'Name', field: 'Name', sortable: true, filter: true },
//     { headerName: 'Email', field: 'email', sortable: true, filter: true },
//     { headerName: 'Country', field: 'country', sortable: true, filter: true },
//     { headerName: 'Phone', field: 'phone', sortable: true, filter: true }
//   ];

//   public rowData: any[] = [];
//   private gridApi!: GridApi;

//   constructor(private http: HttpClient) { }

//   async ngOnInit() {
//     await this.loadData();
//   }

//   async loadData() {
//     let requests = [];
//     for (let i = 0; i < 10; i++) {
//       requests.push(firstValueFrom(this.http.get<any>(`https://api.npoint.io/b66e5ba94ad1ae231518`)));
//     }
//     const responses = await Promise.all(requests);
//     this.rowData = responses.flat();
//   }

//   onGridReady(params: GridReadyEvent) {
//     this.gridApi = params.api;
//   }

//   // Custom Excel Export using the 'xlsx' library
//   exportAsExcel() {
//     if (this.rowData.length === 0) return;
//     const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.rowData);
//     const wb: XLSX.WorkBook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     XLSX.writeFile(wb, 'aggrid-data.xlsx');
//   }

//   // Custom PDF Export using 'jspdf' and 'jspdf-autotable' to create a table
//  exportAsPdf() {
//   if (this.rowData.length === 0) return;
//   const doc = new jsPDF();
//   const headers = this.columnDefs.map(col => col.headerName!)
//   const body = this.rowData.map(row => this.columnDefs.map(col => row[col.field!]));

//   // THE KEY CHANGE IS HERE:
//   // You must call autoTable AS A FUNCTION, passing the 'doc' object in.
//   // The old way was doc.autoTable(...), which is what causes the error.
//   autoTable(doc, {
//     head: [headers],
//     body: body,
//   });

//   doc.save('aggrid-data.pdf');
// }


// }

