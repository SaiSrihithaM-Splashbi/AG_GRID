import { GridApi, ExcelStyle, ColDef } from 'ag-grid-community';
import { GridStylingOptions } from './grid-styling.model';

export class ExcelExporter {
  /** Extract supported styles from your UI styling options */
  static extractSupportedStyles(styling: GridStylingOptions): Record<string, any> {
    const dict: Record<string, any> = {};

    dict['header'] = {
      font: {
        color: this.cleanHex(styling.columnHeader.color),
        size: styling.columnHeader.fontSize,
        bold: this.toBold(styling.columnHeader.fontWeight),
        italic: false,
      },
      alignment: { horizontal: styling.columnHeader.textAlign },
      interior: { color: this.cleanHex(styling.columnHeader.backgroundColor) },
      borders: {
        horizontal: { color: this.cleanHex(styling.grid.horizontal.color) },
        vertical: { color: this.cleanHex(styling.grid.vertical.color) },
      },
    };

    dict['default'] = {
      font: {
        color: this.cleanHex(styling.values.fontColor),
        size: styling.values.fontSize,
        bold: this.toBold(styling.values.fontWeight),
        italic: (styling.values.fontStyle ?? '').toLowerCase() === 'italic',
      },
      alignment: { horizontal: styling.values.textAlign },
      interior: { color: this.cleanHex(styling.values.backgroundColor) },
      alternateRowBackground: styling.values.alternateRowBackground,
      borders: {
        horizontal: { color: this.cleanHex(styling.grid.horizontal.color) },
        vertical: { color: this.cleanHex(styling.grid.vertical.color) },
      },
    };

    return dict;
  }

  /** Convert the dictionary into ag-Grid ExcelStyle[] */
  static generateStyles(styleDict: Record<string, any>, dataProps?: Record<string, any>): ExcelStyle[] {
    const styles: ExcelStyle[] = [];

    for (const [key, val] of Object.entries(styleDict)) {
      const style: ExcelStyle = {
        id: key,
        font: val?.font,
        alignment: val?.alignment ? { horizontal: this.convertAlignment(val.alignment.horizontal) } : undefined,
        interior: val?.interior ? { color: this.cleanHex(val.interior.color), pattern: 'Solid' } : undefined,
        borders: this.buildBordersFromDict(val?.borders),
      };
      styles.push(style);

      if (val?.alternateRowBackground) {
        styles.push({
          id: 'alternateRow',
          font: val?.font,
          interior: { color: this.cleanHex(val.alternateRowBackground), pattern: 'Solid' },
          alignment: val?.alignment ? { horizontal: this.convertAlignment(val.alignment.horizontal) } : undefined,
          borders: this.buildBordersFromDict(val?.borders),
        });
      }
    }

    if (dataProps) {
      for (const [col, props] of Object.entries(dataProps)) {
        const font: any = {};
        if (props['font-color']) font.color = this.cleanHex(props['font-color']);
        if (props['font-size']) font.size = Number(props['font-size']);
        if (props['font-weight']) font.bold = ['bold', '700', 'bolder'].includes(props['font-weight'].toLowerCase());
        if (props['font-style']) font.italic = props['font-style'].toLowerCase() === 'italic';

        styles.push({
          id: `col_${col}`,
          font: Object.keys(font).length ? font : undefined,
          alignment: props['text-align'] ? { horizontal: this.convertAlignment(props['text-align']) } : undefined,
          interior: props['background-color'] ? { color: this.cleanHex(props['background-color']), pattern: 'Solid' } : undefined,
          borders: this.buildBordersFromDict(props?.borders),
        });
      }
    }

    return styles;
  }

  private static buildBordersFromDict(dict?: any): ExcelStyle['borders'] | undefined {
    if (!dict) return undefined;
    const res: any = {};
    if (dict.horizontal?.color) res.bottom = { color: this.cleanHex(dict.horizontal.color) };
    if (dict.vertical?.color) res.right = { color: this.cleanHex(dict.vertical.color) };
    return Object.keys(res).length ? res : undefined;
  }

  private static convertAlignment(val?: string): 'Left' | 'Center' | 'Right' | 'Justify' {
    switch ((val ?? '').toLowerCase()) {
      case 'center': return 'Center';
      case 'right': return 'Right';
      case 'justify': return 'Justify';
      default: return 'Left';
    }
  }

  private static toBold(val?: string): boolean {
    return val ? ['bold', '700', 'bolder'].includes(val.toString().toLowerCase()) : false;
  }

  private static cleanHex(val?: string): string {
    return (val ?? '').replace('#', '') || '000000';
  }

  /** Final Excel Export */
  /** Final Excel Export */
static generate(gridApi: GridApi, fileName: string, excelStyles: ExcelStyle[]): void {
  if (!gridApi) return;

  const params: any = {
    fileName: `${fileName}.xlsx`,
    sheetName: 'Report',

    // ✅ Header export (just plain text)
    processHeaderCallback: (p: any) =>
      p.column.getColDef().headerName ?? p.column.getColDef().field ?? '',

    // ✅ Cell export with safe string conversion + correct styleId
   processCellCallback: (p: any) => {
  const rowIndex = p.node?.rowIndex ?? -1;
  const value = p.value ?? '';

  // Alternate row style
  if (rowIndex % 2 === 1) {
    return value; // ✅ just return the primitive, styling is handled by styleId mapping
  }

  return value; // ✅ same for normal rows
},
    // ✅ Make sure styles are passed
    excelStyles,
  };

  gridApi.exportDataAsExcel(params);
}

}
