import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Filters } from "./filter-context";

@customElement("filter-settings")
export class FilterSettings extends LitElement {
  constructor() {
    super();
    this.change = () => {};
  }
  static override styles = css``;

  @property()
  private change: (newFilters: Filters) => void;

  handleExcludeChange = (e) => {
    this.change({ exclude: e.target.value });
  };

  override render() {
    return html`<label for="exclude">Exclude</label
      ><input
        @change=${this.handleExcludeChange}
        name="exclude"
        type="text"
      />`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-settings": FilterSettings;
  }
}
