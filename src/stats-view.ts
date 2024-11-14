import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { onSummary } from "./worker-client";
import { Summary } from "./types";
import "./stats-table";

@customElement("stats-view")
export class StatsView extends LitElement {
  static override styles = css`
    :host {
      max-width: 100%;
    }
    .stats {
      display: flex;
    }
  `;

  @state()
  private summaries: Record<string, Summary> = {};

  constructor() {
    super();
    onSummary(({ name, summary }) => {
      this.summaries[name] = summary;
      this.requestUpdate();
    });
  }
  override render() {
    const names = Object.keys(this.summaries);
    if (names.length !== 2) return null;
    const left = this.summaries[names[0]].stats.breakdown;
    const right = this.summaries[names[1]].stats.breakdown;
    return html`<div class="stats">
      <stats-table
        name=${names.length > 0 && names[0]}
        .data=${left}
      ></stats-table>
      <stats-table
        name=${names.length > 1 && names[1]}
        .data=${right}
      ></stats-table>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "stats-view": StatsView;
  }
}
