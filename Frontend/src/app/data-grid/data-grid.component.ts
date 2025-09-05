import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ColDef, GridReadyEvent, GridApi, ExcelStyle } from 'ag-grid-community';
import 'ag-grid-enterprise';
import { AgGridAngular } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { ExcelExportGenerator } from '../utils/excel-export-generator';
import { PDFDocumentGenerator } from '../utils/pdf-document-generator';
import { GRID_STYLES } from '../utils/styles-constants';

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
    { 
      headerName: 'Name', 
      field: 'Name', 
      sortable: true, 
      filter: true,
      cellStyle: { 
        'font-weight': 'bold',
        'color': GRID_STYLES.cells.name.text,
        'background-color': GRID_STYLES.cells.name.background
      },
      headerClass: 'header-bold-blue',
      cellClass: 'name-cell'
    },
    { 
      headerName: 'Email', 
      field: 'email', 
      sortable: true, 
      filter: true,
      cellStyle: { 
        'color': GRID_STYLES.cells.email.text,
        'background-color': GRID_STYLES.cells.email.background,
        'font-style': 'italic'
      },
      headerClass: 'header-italic-red',
      cellClass: 'email-cell'
    },
    { 
      headerName: 'Country', 
      field: 'country', 
      sortable: true, 
      filter: true,
      cellStyle: (params) => {
        return params.value === 'Egypt'
          ? { 'background-color': GRID_STYLES.cells.country.egyptBackground, 'color': GRID_STYLES.cells.country.egyptText }
          : { 'background-color': GRID_STYLES.cells.country.otherBackground, 'color': GRID_STYLES.cells.country.otherText };
      },
      headerClass: 'header-green',
      cellClass: (params) => params.value === 'Egypt' ? 'country-egypt' : 'country-others'
    },
    {
      headerName: 'Phone', 
      field: 'phone', 
      sortable: true, 
      filter: true,
      cellStyle: { 
        'text-align': 'center',
        'font-family': GRID_STYLES.cells.phone.font,
        'background-color': GRID_STYLES.cells.phone.background
      },
      headerClass: 'header-center',
      cellClass: 'phone-cell'
    }
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
    requests.push(firstValueFrom(this.http.get<any>(`https://api.npoint.io/d106e93bb3b59ebfc03a`)));
    
    const responses = await Promise.all(requests);
    this.rowData = responses.flat();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  // ✅ Excel Styles linked to GRID_STYLES
  public excelStyles: ExcelStyle[] = [
    {
      id: 'name-cell',
      font: { bold: true, color: GRID_STYLES.cells.name.text },
      interior: { color: GRID_STYLES.cells.name.background, pattern: 'Solid' as const }
    },
    {
      id: 'email-cell',
      font: { italic: true, color: GRID_STYLES.cells.email.text },
      interior: { color: GRID_STYLES.cells.email.background, pattern: 'Solid' as const }
    },
    {
      id: 'country-egypt',
      font: { color: GRID_STYLES.cells.country.egyptText },
      interior: { color: GRID_STYLES.cells.country.egyptBackground, pattern: 'Solid' as const }
    },
    {
      id: 'country-others',
      font: { color: GRID_STYLES.cells.country.otherText },
      interior: { color: GRID_STYLES.cells.country.otherBackground, pattern: 'Solid' as const }
    },
    {
      id: 'phone-cell',
      alignment: { horizontal: 'Center' },
      interior: { color: GRID_STYLES.cells.phone.background, pattern: 'Solid' as const }
    },
    { id: 'header-bold-blue', font: {bold: true , color: GRID_STYLES.headers.boldBlue } },
    { id: 'header-italic-red', font: { bold: true , color: GRID_STYLES.headers.italicRed } },
    { id: 'header-green', interior: { color: GRID_STYLES.headers.green, pattern: 'Solid' as const } },
    { id: 'header-center', alignment: { horizontal: GRID_STYLES.headers.center } }
  ];

  public exportAsExcel() {
    new ExcelExportGenerator().generateExcelExport(this.gridApi, this.fileName);
  }

  public async exportAsPdf() {
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFonts = await import('pdfmake/build/vfs_fonts');
    pdfMakeModule.default.vfs = pdfFonts.vfs;
    const pdfDocDef = new PDFDocumentGenerator().generateDocument(this.gridApi, this.fileName);
    pdfMakeModule.default.createPdf(pdfDocDef).download(`${this.fileName}.pdf`);
  }
}







// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { firstValueFrom } from 'rxjs';
// import {
//   ColDef,
//   GridReadyEvent,
//   GridApi,
//   GridOptions,
//   ExcelStyle
// } from 'ag-grid-community';
// import 'ag-grid-enterprise';
// import { AgGridAngular } from 'ag-grid-angular';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-data-grid',
//   standalone: true,
//   imports: [CommonModule, AgGridAngular],
//   templateUrl: './data-grid.component.html',
//   styleUrls: ['./data-grid.component.scss']
// })
// export class DataGridComponent implements OnInit {
//   public columnDefs: ColDef[] = [
//     {
//       headerName: 'Name',
//       field: 'Name',
//       sortable: true,
//       filter: true,
//       cellClass: 'name-style',
//       headerClass: 'header-bold-blue'
//     },
//     {
//       headerName: 'Email',
//       field: 'email',
//       sortable: true,
//       filter: true,
//       cellClass: 'email-style',
//       headerClass: 'header-italic-red'
//     },
//     {
//       headerName: 'Country',
//       field: 'country',
//       sortable: true,
//       filter: true,
//       cellClass: params =>
//         params.value === 'Egypt' ? 'country-egypt' : 'country-other',
//       headerClass: 'header-green'
//     },
//     {
//       headerName: 'Phone',
//       field: 'phone',
//       sortable: true,
//       filter: true,
//       cellClass: 'phone-style',
//       headerClass: 'header-center'
//     }
//   ];

//   public rowData: any[] = [];
//   public gridOptions: GridOptions = {
//     excelStyles: this.generateExcelStyles(),
//     defaultColDef: {
//       resizable: true,
//       sortable: true,
//       filter: true
//     }
//   };
//   private gridApi!: GridApi;
//   public fileName = 'CustomerDataReport';

//   constructor(private http: HttpClient) {}

//   async ngOnInit() {
//     await this.loadData();
//   }

//   async loadData() {
//     // ✅ Single API call (faster than looping 10 times)
//     this.rowData = await firstValueFrom(
//       this.http.get<any[]>('https://api.npoint.io/d106e93bb3b59ebfc03a')
//     );
//   }

//   onGridReady(params: GridReadyEvent) {
//     this.gridApi = params.api;
//   }

//   public exportAsExcel() {
//     this.gridApi.exportDataAsExcel({
//       fileName: this.fileName,
//       sheetName: 'Customer Data'
//     });
//   }

//   private generateExcelStyles(): ExcelStyle[] {
//     return [
//       {
//         id: 'name-style',
//         font: { bold: true, color: '#c4229c' },
//         interior: { color: '#bcd618', pattern: 'Solid' }
//       },
//       {
//         id: 'email-style',
//         font: { italic: true, color: '#ffffff' },
//         interior: { color: '#02befc', pattern: 'Solid' }
//       },
//       {
//         id: 'country-egypt',
//         font: { color: '#cfe52c' },
//         interior: { color: '#b207ac', pattern: 'Solid' }
//       },
//       {
//         id: 'country-other',
//         font: { color: '#35128d' },
//         interior: { color: '#09f309', pattern: 'Solid' }
//       },
//       {
//         id: 'phone-style',
//         font: { bold: true, color: '#000000' },
//         interior: { color: '#a1a2a4', pattern: 'Solid' },
//         alignment: { horizontal: 'Center' }
//       },
//       {
//         id: 'header-bold-blue',
//         font: { bold: true, color: '#0000FF' },
//         interior: { color: '#D9E1F2', pattern: 'Solid' }
//       },
//       {
//         id: 'header-italic-red',
//         font: { italic: true, color: '#FF0000' },
//         interior: { color: '#FCE4D6', pattern: 'Solid' }
//       },
//       {
//         id: 'header-green',
//         font: { bold: true, color: '#FFFFFF' },
//         interior: { color: '#00B050', pattern: 'Solid' }
//       },
//       {
//         id: 'header-center',
//         font: { bold: true, color: '#333333' },
//         alignment: { horizontal: 'Center' },
//         interior: { color: '#CCCCCC', pattern: 'Solid' }
//       }
//     ];
//   }
// }

















































































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
