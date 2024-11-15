import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { StatsBreakdownRecord } from "./types";
import { formatBytes } from "./utils";

@customElement("stats-row")
export class StatsRow extends LitElement {
  constructor() {
    super();
    this.data = { count: 0, size: 0, avgTime: 0 };
    this.header = "";
  }
  static override styles = css`
    :host {
      display: table;
      width: 100%;
    }
    tr {
      width: 100%;
    }
    th {
      text-transform: capitalize;
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
  public header: string;

  @property({ type: Object })
  public data: StatsBreakdownRecord;

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
        <td class="metric">${formatBytes(this.data.size)}</td>
      </tr>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "stats-row": StatsRow;
  }
}
