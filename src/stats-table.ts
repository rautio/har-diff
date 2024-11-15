import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { StatsBreakdown } from "./types";
import "./stats-row";

@customElement("stats-table")
export class StatsTable extends LitElement {
  static override styles = css`
    :host {
      margin: 12px;
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
        <tbody>
          ${Object.keys(this.data)
            .sort()
            .map(
              (key) =>
                html`<stats-row
                  header=${key}
                  .data=${this.data[key]}
                ></stats-row>`
            )}
        </tbody>
      </table>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "stats-table": StatsTable;
  }
}
