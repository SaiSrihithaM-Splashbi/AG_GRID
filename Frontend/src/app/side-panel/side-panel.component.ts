import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  GridStylingOptions,
  DEFAULT_GRID_STYLING,
  FONT_STYLES,
  FONT_WEIGHTS,
  TEXT_ALIGNMENTS
} from '../utils/grid-styling.model';

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss']
})
export class SidePanelComponent {
  @Input() isOpen: boolean = true;
  @Output() stylingChanged = new EventEmitter<GridStylingOptions>();

  /** Styling options (initialized from centralized defaults) */
  public stylingOptions: GridStylingOptions = { ...DEFAULT_GRID_STYLING };

  /** Dropdown data (comes from centralized model) */
  public fontStyles = FONT_STYLES;
  public fontWeights = FONT_WEIGHTS;
  public textAlignments = TEXT_ALIGNMENTS;

  onStylingChange() {
    this.stylingChanged.emit(this.stylingOptions);
  }

  resetToDefaults() {
    this.stylingOptions = { ...DEFAULT_GRID_STYLING };
    this.onStylingChange();
  }
}
