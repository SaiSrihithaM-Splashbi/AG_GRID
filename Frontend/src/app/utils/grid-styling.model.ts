export interface GridStylingOptions {
  widget: {
    backgroundColor: string;
    borderColor: string;
    borderSize: number;
    width: number;
    height: number;
  };
  columnHeader: {
    color: string;
    fontSize: number;
    backgroundColor: string;
    fontWeight: string;
    height: number;
    fontFamily?: string;   // ✅ already added
    textAlign?: string;    // ✅ already added
  };
  values: {
    fontStyle: string;
    fontWeight: string;
    fontSize: number;
    backgroundColor: string;
    alternateRowBackground: string;
    alternateRowFont: string;
    textAlign: string;
    fontColor: string;
    fontFamily?: string;   // ✅ already added
  };
  grid: {
    horizontal: {
      color: string;
      thickness: number;
      padding: number;
    };
    vertical: {
      color: string;
      thickness: number;
      padding: number;
    };
  };
}

export const DEFAULT_GRID_STYLING: GridStylingOptions = {
  widget: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderSize: 1,
    width: 2000,
    height: 800,
  },
  columnHeader: {
    color: '#000000',
    fontSize: 14,
    backgroundColor: '#f1f1f1',
    fontWeight: 'bold',
    height: 30,
    fontFamily: 'Arial',
    textAlign: 'center',
  },
  values: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 12,
    backgroundColor: '#ffffff',
    alternateRowBackground: '#f9f9f9',
    alternateRowFont: '#333333',
    textAlign: 'left',
    fontColor: '#000000',
    fontFamily: 'Arial',
  },
  grid: {
    horizontal: {
      color: '#cccccc',
      thickness: 1,
      padding: 4,
    },
    vertical: {
      color: '#cccccc',
      thickness: 1,
      padding: 4,
    },
  },
};

export const FONT_STYLES = [
  { label: 'Normal', value: 'normal' },
  { label: 'Italic', value: 'italic' },
  { label: 'Oblique', value: 'oblique' },
];

export const FONT_WEIGHTS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Bold', value: 'bold' },
  { label: 'Bolder', value: 'bolder' },
  { label: 'Lighter', value: 'lighter' },
];

export const TEXT_ALIGNMENTS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
  { label: 'Justify', value: 'justify' },   // ✅ added so user can select it
];
