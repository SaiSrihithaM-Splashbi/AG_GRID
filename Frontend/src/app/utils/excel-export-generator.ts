import { GridApi, ExcelStyle } from 'ag-grid-community';
import { GridStylingOptions } from './grid-styling.model';

export class ExcelExporter {
  /** Extract supported styles from your UI styling options (keeps header/default templates) */
  // inside ExcelExporter class (near top)
public static sanitizeId(s?: string): string {
  if (!s) return '';
  // replace whitespace with underscore, remove characters that would split into multiple CSS classes
  return String(s).trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_-]/g, '');
}

private static normalizeColor(val?: string): string | undefined {
  if (!val) return undefined;
  const s = String(val).trim();

  // ✅ If already 8-digit ARGB (like "FF112233"), pass through
  if (/^[0-9A-Fa-f]{8}$/.test(s)) {
    return s.toUpperCase();
  }

  // 3-digit hex (#abc -> aabbcc)
  const m3 = s.match(/^#?([0-9a-fA-F]{3})$/);
  if (m3) {
    const t = m3[1];
    const r = t[0] + t[0];
    const g = t[1] + t[1];
    const b = t[2] + t[2];
    return `FF${(r + g + b).toUpperCase()}`;
  }

  // 6-digit hex (#aabbcc)
  const m6 = s.match(/^#?([0-9a-fA-F]{6})$/);
  if (m6) return `FF${m6[1].toUpperCase()}`;

  // rgb(...) or rgba(...)
  const mRgb = s.match(/^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})/i);
  if (mRgb) {
    const r = Number(mRgb[1]).toString(16).padStart(2, '0');
    const g = Number(mRgb[2]).toString(16).padStart(2, '0');
    const b = Number(mRgb[3]).toString(16).padStart(2, '0');
    return `FF${(r + g + b).toUpperCase()}`;
  }

  // basic named colors
  const map: Record<string, string> = {
    black: 'FF000000',
    white: 'FFFFFFFF',
    red: 'FFFF0000',
    green: 'FF008000',
    blue: 'FF0000FF',
    gray: 'FF808080',
  };
  const lower = s.toLowerCase();
  if (map[lower]) return map[lower];

  return undefined; // fallback
}


  
  static extractSupportedStyles(styling: GridStylingOptions): Record<string, any> {
    const dict: Record<string, any> = {};

    dict['header'] = {
      font: {
        color: this.normalizeColor(styling.columnHeader.color),
        size: styling.columnHeader.fontSize,
        // bold: this.toBold(styling.columnHeader.fontWeight),
        italic: false,
        name: styling.columnHeader.fontFamily,
      },
      alignment: { horizontal: styling.columnHeader.textAlign },
      interior: { color: this.normalizeColor(styling.columnHeader.backgroundColor) },
      borders: {
        horizontal: { color: this.normalizeColor(styling.grid.horizontal.color) },
        vertical: { color: this.normalizeColor(styling.grid.vertical.color) },
      },
    };

    dict['default'] = {
      font: {
        color: this.normalizeColor(styling.values.fontColor),
        size: styling.values.fontSize,
        // bold: this.toBold(styling.values.fontWeight),
        italic: (styling.values.fontStyle ?? '').toLowerCase() === 'italic',
        name: styling.values.fontFamily,
      },
      alignment: { horizontal: styling.values.textAlign },
      interior: { color: this.normalizeColor(styling.values.backgroundColor) },
      alternateRowBackground: this.normalizeColor(styling.values.alternateRowBackground),
      alternateRowFont: this.normalizeColor(styling.values.alternateRowFont),
      borders: {
        horizontal: { color: this.normalizeColor(styling.grid.horizontal.color) },
        vertical: { color: this.normalizeColor(styling.grid.vertical.color) },
      },
    };

    return dict;
  }

  /**
   * Build per-column props in the exact shape generateStyles expects.
   * This is used internally when caller gives a GridStylingOptions object.
   */
  static buildPerColumnProps(styling: GridStylingOptions, columns: string[]): Record<string, any> {
  const v = styling.values;
  const borderObj = {
    horizontal: { 
      color: this.normalizeColor(styling.grid.horizontal.color),
      thickness: styling.grid.horizontal.thickness ?? 1
    },
    vertical: { 
      color: this.normalizeColor(styling.grid.vertical.color),
      thickness: styling.grid.vertical.thickness ?? 1
    },
  };

  const res: Record<string, any> = {};
  for (const col of columns) {
    const safe = this.sanitizeId(col);
    res[safe] = {
      'font-color': this.normalizeColor(v.fontColor),
      'font-size': Number(v.fontSize),
      'font-weight': String(v.fontWeight),
      'font-style': v.fontStyle,
      'font-family': v.fontFamily,
      'background-color': this.normalizeColor(v.backgroundColor),
      'text-align': v.textAlign,
      borders: borderObj,
      alternateRowBackground: this.normalizeColor(v.alternateRowBackground),
      alternateRowFont: this.normalizeColor(v.alternateRowFont),
    };
  }
  return res;
}

  /**
   * Single entry: build ExcelStyle[] from styling + columns
   */
  static buildExcelStyles(styling: GridStylingOptions, columns: string[]): ExcelStyle[] {
    const styleDict = this.extractSupportedStyles(styling);
    const perCol = this.buildPerColumnProps(styling, columns);
    return this.generateStyles(styleDict, perCol);
  }

  /** Optional: build consistent JSON payload for UI/export consumption */
  static buildExportPayload(styling: GridStylingOptions, tableData: any[]) {
    const cols = tableData?.length ? Object.keys(tableData[0]) : [];
    const dataProperties: Record<string, any> = {};
    const v = styling.values;

    for (const c of cols) {
      dataProperties[c] = {
        displayName: c.charAt(0).toUpperCase() + c.slice(1),
        // include the properties likely to be used for Excel export
        'font-family': v.fontFamily,
        'font-color': this.normalizeColor(v.fontColor),
        'font-size': Number(v.fontSize),
        'font-weight': v.fontWeight,
        'font-style': v.fontStyle,
        'background-color': this.normalizeColor(v.backgroundColor),
        'text-align': v.textAlign,
        // you can extend with 'number-format', 'wrap-text', 'indent' etc. when your UI provides them
      };
    }

    const widgetProperties = {
      ...styling,
      columns: {
        All: {
          'font-color': this.normalizeColor(v.fontColor),
          'font-size': v.fontSize,
          'background-color': this.normalizeColor(v.backgroundColor),
          'header-text-align': styling.columnHeader.textAlign,
          'font-family': v.fontFamily,
        },
      },
    };

    return { dataProperties, widgetProperties, tableData };
  }

  /** Convert the dictionary into ag-Grid ExcelStyle[] */
  static generateStyles(styleDict: Record<string, any>, dataProps?: Record<string, any>): ExcelStyle[] {
    const styles: ExcelStyle[] = [];

    // global styles (header/default)
    for (const [key, val] of Object.entries(styleDict)) {
      const interiorColor = this.normalizeColor(val?.interior?.color);
      const styleObj: any = {
        id: key,
        font: val?.font ? { ...val.font, color: val.font.color } : undefined,
        alignment: val?.alignment ? { horizontal: this.convertAlignment(val.alignment.horizontal) } : undefined,
        interior: interiorColor ? { color: interiorColor, pattern: 'Solid' } : undefined,
        borders: this.buildBordersFromDict(val?.borders),
      };
      styles.push(styleObj as ExcelStyle);

      // If default or header has alternateRowBackground, build an alternateRow style id
      if (val?.alternateRowBackground) {
          const altColor = this.normalizeColor(val.alternateRowBackground);
          if (altColor) {
            const altStyle: any = {
            id: 'alternateRow',
            font: {
                ...(val?.font || {}),
                color: val?.alternateRowFont ?? val?.font?.color  // remove normalizeColor()
              },
              interior: { color: altColor, pattern: 'Solid' },
              alignment: val?.alignment ? { horizontal: this.convertAlignment(val.alignment.horizontal) } : undefined,
              borders: this.buildBordersFromDict(val?.borders),
          };
          styles.push(altStyle as ExcelStyle);
       }
     }
  }

    // per-column styles (col_<name>)
    if (dataProps) {
      for (const [col, props] of Object.entries(dataProps)) {
        const font: any = {};
        if (props['font-family']) font.name = props['font-family'];
        if (props['font-color']) font.color = this.normalizeColor(props['font-color']);
        if (props['font-size']) font.size = Number(props['font-size']);
        if (props['font-weight']) {
          font.bold = ['bold', '700', 'bolder'].includes(String(props['font-weight']).toLowerCase());
        }
        if (props['font-style']) font.italic = String(props['font-style']).toLowerCase() === 'italic';
        if (props['underline'] === true || String(props['underline']).toLowerCase() === 'underline') font.underline = true;

        // alignment: allow horizontal, vertical, wrapText, indent
        const alignment: any = {};
        if (props['text-align'] || props['horizontal-alignment'] || props['horizontalAlignment']) {
          alignment.horizontal = this.convertAlignment(props['text-align'] ?? props['horizontal-alignment'] ?? props['horizontalAlignment']);
        }
        if (props['wrap-text'] !== undefined || props['wrapText'] !== undefined) {
          alignment.wrapText = !!(props['wrap-text'] ?? props['wrapText']);
        }
        if (props['indent'] !== undefined) {
          alignment.indent = Number(props['indent']);
        }

        const interiorColor = this.normalizeColor(props['background-color'] ?? props['backgroundColor']);
        const borders = this.buildBordersFromDict(props?.borders);

        const styleObj: any = {
          id: `col_${col}`,
          font: Object.keys(font).length ? font : undefined,
          alignment: Object.keys(alignment).length ? alignment : undefined,
          interior: interiorColor ? { color: interiorColor, pattern: 'Solid' } : undefined,
          borders,
        };

        // optional: numberFormat
        if (props['number-format'] || props['numberFormat'] || props['format']) {
          styleObj.format = props['number-format'] ?? props['numberFormat'] ?? props['format'];
        }

        styles.push(styleObj as ExcelStyle);

        // optionally add per-column alternate row style if requested (col_<col>_alternate)
        if (props?.alternateRowBackground) {
          const alt = this.normalizeColor(props.alternateRowBackground);
          if (alt) {
            const altStyle: any = {
              id: `col_${col}_alternate`,
              font: Object.keys(font).length ? font : undefined,
              interior: { color: alt, pattern: 'Solid' },
              alignment: Object.keys(alignment).length ? alignment : undefined,
              borders,
            };
            styles.push(altStyle as ExcelStyle);
          }
        }
      }
    }

    return styles;
  }

  private static buildBordersFromDict(dict?: any): ExcelStyle['borders'] | undefined {
    if (!dict) return;
    const hColor = this.normalizeColor(dict.horizontal?.color);
    const vColor = this.normalizeColor(dict.vertical?.color);
    const hW = dict.horizontal?.thickness ?? 3;
    const vW = dict.vertical?.thickness ?? 3;
    return {
        borderTop:    { color: hColor, lineStyle: 'Continuous', weight: hW },
        borderBottom: { color: hColor, lineStyle: 'Continuous', weight: hW },
        borderLeft:   { color: vColor, lineStyle: 'Continuous', weight: vW },
        borderRight:  { color: vColor, lineStyle: 'Continuous', weight: vW}
    };


  }


  private static convertAlignment(val?: string): 'Left' | 'Center' | 'Right' | 'Justify' {
    switch ((val ?? '').toLowerCase()) {
      case 'center': return 'Center';
      case 'right': return 'Right';
      case 'justify': return 'Justify';
      default: return 'Left';
    }
  }

  // private static convertVerticalAlignment(val?: string): 'Top' | 'Center' | 'Bottom' {
  //   switch ((val ?? '').toLowerCase()) {
  //     case 'center': return 'Center';
  //     case 'bottom': return 'Bottom';
  //     default: return 'Top';
  //   }
  // }

  // private static toBold(val?: string): boolean {
  //   return val ? ['bold', '700', 'bolder'].includes(val.toString().toLowerCase()) : false;
  // }

  

  /**
   * NEW: Build excelStyles directly from the payload (giant JSON).
   * This extracts only the supported properties and creates ExcelStyle[].
   */
  static generateFromPayload(gridApi: GridApi, fileName: string, payload: any): void {
    if (!gridApi) return;

    // widgetProperties is expected to be the styling object you logged in the giant JSON
    const styling = payload?.widgetProperties ?? payload?.widget ?? {};
    const styleDict = this.extractSupportedStyles(styling as GridStylingOptions);

    // dataProperties -> per column definitions (these may be stringified or object)
    const rawDataProps = payload?.dataProperties ?? {};

    const perColProps: Record<string, any> = {};
    for (const [col, raw] of Object.entries(rawDataProps)) {
      // If the user stringified props (console parity), attempt to parse
      const safeCol = this.sanitizeId(col);
      let src: any = raw;
      if (typeof raw === 'string') {
        try {
          src = JSON.parse(raw);
        } catch {
          src = {};
        }
      }

      // helper to pick a value among possible key names (kebab / camelCase)
      const pick = (...keys: string[]) => {
        for (const k of keys) {
          if (src && src[k] !== undefined && src[k] !== null) return src[k];
        }
        return undefined;
      };

      const fontColor = pick('font-color', 'fontColor', 'color');
      const fontSize = pick('font-size', 'fontSize', 'size');
      const fontWeight = pick('font-weight', 'fontWeight');
      const fontStyle = pick('font-style', 'fontStyle');
      const fontFamily = pick('font-family', 'fontFamily', 'fontName');
      const underline = pick('underline', 'text-decoration');
      const bg = pick('background-color', 'backgroundColor', 'bg');
      const borderColor = pick('border-color', 'borderColor');
      // const borderStyle = pick('border-style', 'borderStyle');
      // const borderWeight = pick('border-weight', 'borderWeight');
      const hAlign = pick('horizontal-alignment', 'horizontalAlignment', 'text-align', 'textAlign');
      const vAlign = pick('vertical-alignment', 'verticalAlignment', 'vertical-align', 'verticalAlign');
      const numberFormat = pick('number-format', 'numberFormat', 'format');
      const indent = pick('indent');
      const wrapText = pick('wrap-text', 'wrapText', 'wrap');

      // construct nested borders if available (we use same color for both directions if provided)
      const borders = borderColor ? { horizontal: { color: this.normalizeColor(borderColor) }, vertical: { color: this.normalizeColor(borderColor) } } : undefined;

       perColProps[safeCol] = {
    'font-family': fontFamily,
    'font-color': this.normalizeColor(fontColor),
    'font-size': fontSize !== undefined ? Number(fontSize) : undefined,
    'font-weight': fontWeight !== undefined ? String(fontWeight) : undefined,
    'font-style': fontStyle,
    'underline': underline,
    'background-color': this.normalizeColor(bg),
    'text-align': hAlign,
    'vertical-align': vAlign,
    'number-format': numberFormat,
    'indent': indent !== undefined ? Number(indent) : undefined,
    'wrap-text': wrapText === true || String(wrapText) === 'true' || String(wrapText) === '1',
    borders,
    alternateRowBackground: this.normalizeColor(pick('alternateRowBackground', 'alternate-row-background', 'alternate_row_background')),
    alternateRowFont: this.normalizeColor(pick('alternateRowFont', 'alternate-row-font', 'alternate_row_font')),
  };
    }

    // Generate ExcelStyle[] using the canonical generator
    const excelStyles = this.generateStyles(styleDict, perColProps);

    // Debugging visibility: show computed excelStyles in console for inspection
    console.log('Computed excelStyles from payload:', excelStyles);

    // Finally export using ag-Grid export API
    const params: any = {
      fileName: `${fileName}.xlsx`,
      sheetName: 'Report',
      processHeaderCallback: (p: any) => p.column.getColDef().headerName ?? p.column.getColDef().field ?? '',
      processCellCallback: (p: any) => {
        const value = p.value;
        if (value == null) return '';
        if (typeof value === 'object') {
          if (typeof value.displayName === 'string' || typeof value.displayName === 'number') return String(value.displayName);
          if (typeof value.name === 'string' || typeof value.name === 'number') return String(value.name);
          try {
            return JSON.stringify(value);
          } catch {
            return String(value);
          }
        }
        return String(value);
      },
      excelStyles,
    };

    gridApi.exportDataAsExcel(params);
  }

  /** Final Excel Export (kept for backward compatibility) */
  static generate(gridApi: GridApi, fileName: string, excelStyles: ExcelStyle[]): void {
    if (!gridApi) return;

    const params: any = {
      fileName: `${fileName}.xlsx`,
      sheetName: 'Report',
      processHeaderCallback: (p: any) =>
        p.column.getColDef().headerName ?? p.column.getColDef().field ?? '',
      processCellCallback: (p: any) => {
        const value = p.value;
        if (value == null) return '';
        if (typeof value === 'object') {
          if (typeof value.displayName === 'string' || typeof value.displayName === 'number') return String(value.displayName);
          if (typeof value.name === 'string' || typeof value.name === 'number') return String(value.name);
          try {
            return JSON.stringify(value);
          } catch {
            return String(value);
          }
        }
        return String(value);
      },
      excelStyles,
    };

    gridApi.exportDataAsExcel(params);
  }
}
