import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
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
  public data: StatsBreakdown = {};

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
          ${this.data.stylesheet &&
          html`
            <tr>
              <td>CSS Count</td>
              <td>${this.data.stylesheet.count}</td>
            </tr>
          `}
          ${this.data.script &&
          html`
            <tr>
              <td>JS Count</td>
              <td>${this.data.script.count}</td>
            </tr>
          `}
          ${this.data.image &&
          html`
            <tr>
              <td>Image Count</td>
              <td>${this.data.image.count}</td>
            </tr>
          `}
          ${this.data.all &&
          html` <tr>
              <td>Total Count</td>
              <td>${this.data.all.count}</td>
            </tr>
            <tr>
              <td>Total Downloaded</td>
              <td>${this.data.all.totalDownload}</td>
            </tr>`}
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
