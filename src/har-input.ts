import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("har-input")
export class HARInput extends LitElement {
  static override styles = css``;

  @property({ type: String })
  label = "HAR file";

  constructor() {
    super();
  }

  override render() {
    return html`<div>
      <label for="har-file">${this.label}</label
      ><input type="file" name="har-file" accept="json" />
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "har-input": HARInput;
  }
}
