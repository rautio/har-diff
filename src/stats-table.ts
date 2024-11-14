import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getInitStatsBreakdown } from "./utils";
import { StatsBreakdown } from "./types";

@customElement("stats-table")
export class statsTable extends LitElement {
  static override styles = css`
    .url {
      max-width: 50%;
      overflow: hidden;
      white-space: wrap;
      word-break: break-all;
      text-overflow: ellipsis;
    }
  `;

  @property({ type: String })
  public name: string = "";

  @property({ type: Object })
  public data: StatsBreakdown = getInitStatsBreakdown();

  override render() {
    return html`<div class="stats">
      <table>
        <thead>
          <tr>
            <th>${this.name}</th>
          </tr>
        </thead>
      </table>
      <table>
        <tbody>
          <tr>
            <td>Image Count</td>
            <td>${this.data.img.count}</td>
          </tr>
          <tr>
            <td>Total Count</td>
            <td>${this.data.all.count}</td>
          </tr>
          <tr>
            <td>Total Downloaded</td>
            <td>${this.data.all.totalDownload}</td>
          </tr>
        </tbody>
      </table>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "stats-table": statsTable;
  }
}
