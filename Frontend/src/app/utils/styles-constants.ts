export const GRID_STYLES = {
  cells: {
    name: {
      text: '#ffffff',        // White text
      background: '#673AB7'   // Vibrant deep violet
    },
    email: {
      text: '#ffffff',        // White text
      background: '#03A9F4'   // Bright sky blue
    },
    country: {
      egyptText: '#ffffff',
      egyptBackground: '#E91E63',  // Elegant pink-magenta
      otherText: '#ffffff',
      otherBackground: '#4CAF50'   // Fresh green
    },
    phone: {
      font: 'monospace',
      background: '#FF9800',   // Vibrant orange
    }
  },
  headers: {
    boldBlue: '#000000ff',   // Indigo (bold but friendly)
    italicRed: '#000000ff',  // Elegant red
    green: '#ffffffff',      // Balanced green
    center: 'Center' as const
  }
};
