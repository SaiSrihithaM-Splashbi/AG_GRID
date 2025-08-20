import { GridApi, Column } from 'ag-grid-community';

export class PDFDocumentGenerator {

  /**
   * Extracts data from the grid and generates a document definition for pdfMake.
   * @param gridApi The AG Grid API instance.
   * @param title The title to be displayed at the top of the PDF.
   * @returns A document definition object for pdfMake.
   */
  public generateDocument(gridApi: GridApi, title: string): any {
    
    // 1. Get visible columns and their headers
    const columns: Column[] = gridApi.getColumns()!
      .filter(col => col.getColDef().headerName);
    
    const headers = columns.map(col => col.getColDef().headerName);

    // 2. Get row data in the correct order (respecting sorting and filtering)
    const body: any[] = [];
    gridApi.forEachNodeAfterFilterAndSort(node => {
      const rowData = columns.map(col => node.data[col.getColDef().field!]);
      body.push(rowData);
    });

    // 3. Create the document definition object that pdfMake understands
    const docDefinition = {
      content: [
        { text: title, style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: Array(headers.length).fill('auto'),
            body: [
              headers,
              ...body
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex % 2 === 0 ? '#f3f3f3' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc',
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        }
      }
    };
    
    return docDefinition;
  }
}
