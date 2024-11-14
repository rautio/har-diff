import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { StatsBreakdown } from "./types";
import "./stats-row";
@customElement("stats-table")
export class StatsTable extends LitElement {
  static override styles = css``;

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
          <stats-row header="JavaScript" .data=${this.data?.script}></stats-row>
          <stats-row
            header="Stylesheet"
            .data=${this.data?.stylesheet}
          ></stats-row>
          <stats-row header="XHR" .data=${this.data?.xhr}></stats-row>
          <stats-row header="All" .data=${this.data?.all}></stats-row>
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
