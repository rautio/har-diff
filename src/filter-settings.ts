import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { consume, provide } from "@lit/context";
import { filterContext, Filters } from "./filter-context";

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
