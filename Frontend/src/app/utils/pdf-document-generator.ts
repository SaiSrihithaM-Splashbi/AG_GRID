// import { GridApi, Column } from 'ag-grid-community';
// import { GridStylingOptions } from '../side-panel/side-panel.component';

// export class PDFDocumentGenerator {

//   public generateDocument(gridApi: GridApi, title: string, styling: GridStylingOptions): any {
//     // 1) Visible columns
//     const columns: Column[] = gridApi.getColumns()!
//       .filter(col => col.getColDef().headerName);

//     const headers = columns.map(col => col.getColDef().headerName ?? '');

//     // 2) Build table body
//     const body: any[] = [];

//     // Header row (text style + background)
//     body.push(
//       columns.map(col => {
//         const headerName = col.getColDef().headerName ?? '';
//         return {
//           text: headerName,
//           style: 'headerStyle',
//           fillColor: styling.columnHeader.backgroundColor,
//           color: styling.columnHeader.color,
//           fontSize: styling.columnHeader.fontSize,
//           bold: styling.columnHeader.fontWeight === 'bold'
//         };
//       })
//     );

//     // Data rows (normalize field names to avoid case issues)
//     gridApi.forEachNodeAfterFilterAndSort(node => {
//       const rowData = columns.map(col => {
//         const rawField = (col.getColDef().field ?? '').toString();
//         const key = rawField.toLowerCase(); // <-- normalize: 'name' | 'email' | 'country' | 'phone'
//         const value = node.data[rawField];
//         const isAlternate = (node.rowIndex ?? 0) % 2 === 1;

//         return {
//           text: value,
//           style: 'cellStyle',
//           fillColor: isAlternate 
//             ? styling.values.alternateCells.backgroundColor 
//             : styling.values.backgroundColor,
//           color: isAlternate 
//             ? styling.values.alternateCells.fontColor 
//             : '#000000',
//           fontSize: styling.values.fontSize,
//           italics: styling.values.fontStyle === 'italic',
//           alignment: this.getTextAlignment(styling.values.textAlignment)
//         };
//       });
//       body.push(rowData);
//     });

//     // 3) pdfMake document definition
//     const docDefinition = {
//       pageSize: 'A4',
//       pageOrientation: 'landscape',
//       pageMargins: [20, 20, 20, 20],
//       // background: styling.widget.backgroundColor,
//       content: [
//         { text: title, style: 'header' },
//         {
//           table: {
//             headerRows: 1,
//             widths: Array(headers.length).fill('auto'),
//             body: body,
//           },
//           layout: {
//             hLineWidth: (i: number, node: any) => {
//               // Outer border for widget
//               if (i === 0 || i === node.table.body.length) {
//                 return styling.widget.borderSize;
//               }
//               return styling.grid.horizontal.thickness;
//             },
//             vLineWidth: (i: number, node: any) => {
//               // Outer border for widget
//               if(i==0) return 0;
//               if (i === node.table.widths.length) {
//                 return styling.widget.borderSize;
//               }
//               return styling.grid.vertical.thickness;
//             },
//             hLineColor: (i: number, node: any) => {
//               // Outer border for widget
//               if (i === 0 || i === node.table.body.length) {
//                 return styling.widget.borderColor;
//               }
//               return styling.grid.horizontal.color;
//             },
//             vLineColor: (i: number, node: any) => {
//               // Outer border for widget
//               if (i === 0 ) return 'transparent';
//               if (i === node.table.widths.length) {
//                 return styling.widget.borderColor;
//               }
//               return styling.grid.vertical.color;
//             },
//             paddingLeft: () => styling.grid.vertical.padding,
//             paddingRight: () => styling.grid.vertical.padding,
//             paddingTop: () => styling.grid.horizontal.padding,
//             paddingBottom: () => styling.grid.horizontal.padding,
//           }
//         }
//       ],
//       styles: {
//         // Title
//         header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },

//         // Header text styles
//         headerStyle: { 
//           bold: styling.columnHeader.fontWeight === 'bold',
//           color: styling.columnHeader.color,
//           fontSize: styling.columnHeader.fontSize,
//           alignment: 'center'
//         },

//         // Cell text styles
//         cellStyle: { 
//           fontSize: styling.values.fontSize,
//           italics: styling.values.fontStyle === 'italic',
//           alignment: this.getTextAlignment(styling.values.textAlignment)
//         },
//       }
//     };

//     return docDefinition;
//   }

//   // -------- Helper methods --------

//   private getTextAlignment(alignment: string): string {
//     switch (alignment) {
//       case 'left': return 'left';
//       case 'center': return 'center';
//       case 'right': return 'right';
//       case 'justify': return 'justify';
//       default: return 'left';
//     }
//   }
// }
