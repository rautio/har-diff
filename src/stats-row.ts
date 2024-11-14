import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { StatsBreakdown } from "./types";

@customElement("stats-row")
export class StatsRow extends LitElement {
  static override styles = css`
    :host {
      display: table;
    }
  `;

  @property({ type: String })
  public header: string = "";

  @property({ type: Object })
  public data: StatsBreakdown = {};

  override render() {
    if (!this.header || !this.data) return null;
    return html` <tr>
        <th>${this.header}</th>
      </tr>
      <tr>
        <td>Count</td>
        <td>${this.data.count}</td>
      </tr>
      <tr>
        <td>Size</td>
        <td>${this.data.totalDownload}</td>
      </tr>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "stats-row": StatsRow;
  }
}
