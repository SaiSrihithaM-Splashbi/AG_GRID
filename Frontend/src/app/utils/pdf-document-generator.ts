import { GridApi, Column } from 'ag-grid-community';
import { GRID_STYLES } from './styles-constants';

export class PDFDocumentGenerator {

  public generateDocument(gridApi: GridApi, title: string): any {
    // 1) Visible columns
    const columns: Column[] = gridApi.getColumns()!
      .filter(col => col.getColDef().headerName);

    const headers = columns.map(col => col.getColDef().headerName ?? '');

    // 2) Build table body
    const body: any[] = [];

    // Header row (text style + background)
    body.push(
      columns.map(col => {
        const headerName = col.getColDef().headerName ?? '';
        return {
          text: headerName,
          style: this.getHeaderStyle(headerName),
          fillColor: this.getHeaderBgColor(headerName),
        };
      })
    );

    // Data rows (normalize field names to avoid case issues)
    gridApi.forEachNodeAfterFilterAndSort(node => {
      const rowData = columns.map(col => {
        const rawField = (col.getColDef().field ?? '').toString();
        const key = rawField.toLowerCase(); // <-- normalize: 'name' | 'email' | 'country' | 'phone'
        const value = node.data[rawField];

        return {
          text: value,
          style: this.getCellStyleByKey(key, value),
          fillColor: this.getCellBgColorByKey(key, value),
        };
      });
      body.push(rowData);
    });

    // 3) pdfMake document definition
    const docDefinition = {
      content: [
        { text: title, style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: Array(headers.length).fill('auto'),
            body: body,
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#ffffffff',
            vLineColor: () => '#ffffffff',
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          }
        }
      ],
      styles: {
        // Title
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },

        // Header text styles
        headerBoldBlue: { bold: true, color: GRID_STYLES.headers.boldBlue },
        headerItalicRed: { bold: true, color: GRID_STYLES.headers.italicRed },
        headerGreen: { bold: true, color: 'black' },
        headerCenter: { alignment: 'center' },

        // Cell text styles
        nameCell: { bold: true, color: GRID_STYLES.cells.name.text },
        emailCell: { italics: true, color: GRID_STYLES.cells.email.text },
        phoneCell: { alignment: 'center' },
      }
    };

    return docDefinition;
  }

  // -------- Header helpers --------

  private getHeaderStyle(header: string): string {
    switch (header) {
      case 'Name':    return 'headerBoldBlue';
      case 'Email':   return 'headerItalicRed';
      case 'Country': return 'headerGreen';
      case 'Phone':   return 'headerCenter';
      default:        return '';
    }
  }

  private getHeaderBgColor(header: string): string | undefined {
    switch (header) {
      case 'Name':    return GRID_STYLES.cells.name.background;
      case 'Email':   return GRID_STYLES.cells.email.background;
      case 'Country': return GRID_STYLES.headers.green; // header band color
      case 'Phone':   return GRID_STYLES.cells.phone.background;
      default:        return undefined;
    }
  }

  // -------- Cell helpers (by normalized key) --------

  private getCellStyleByKey(key: string, _value: any): string {
    switch (key) {
      case 'name':   return 'nameCell';
      case 'email':  return 'emailCell';
      case 'phone':  return 'phoneCell';
      default:       return '';
    }
  }

  private getCellBgColorByKey(key: string, value: any): string | undefined {
    if (key === 'name')   return GRID_STYLES.cells.name.background;
    if (key === 'email')  return GRID_STYLES.cells.email.background;
    if (key === 'country') {
      return value === 'Egypt'
        ? GRID_STYLES.cells.country.egyptBackground
        : GRID_STYLES.cells.country.otherBackground;
    }
    if (key === 'phone')  return GRID_STYLES.cells.phone.background;
    return undefined;
  }
}
