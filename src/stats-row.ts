import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { StatsBreakdown } from "./types";
import { formatBytes } from "./utils";

@customElement("stats-row")
export class StatsRow extends LitElement {
  static override styles = css`
    :host {
      display: table;
      width: 100%;
    }
    tr {
      width: 100%;
    }
    th {
      text-align: left;
    }
    .metric {
      text-align: right;
    }
    .field {
      padding-left: 24px;
    }
  `;

  @property({ type: String })
  public header: string = "";

  @property({ type: Object })
  public data: StatsBreakdown = {};

  override render() {
    if (!this.header || !this.data) return null;
    return html`<tr>
        <th>${this.header}</th>
      </tr>
      <tr>
        <td class="field">Count</td>
        <td class="metric">${this.data.count}</td>
      </tr>
      <tr>
        <td class="field">Size</td>
        <td class="metric">${formatBytes(this.data.totalDownload)}</td>
      </tr>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "stats-row": StatsRow;
  }
}
