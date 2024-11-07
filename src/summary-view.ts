import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { onSummary } from "./worker-client";
import { Summary } from "./types";
import "./duplicates-table";

@customElement("summary-view")
export class SummaryView extends LitElement {
  static override styles = css`
    :host {
      max-width: 100%;
    }
    .summary {
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
    const left = this.summaries[names[0]].duplicates;
    const right = this.summaries[names[1]].duplicates;
    return html`<div class="summary">
      <duplicates-table
        name=${names.length > 0 && names[0]}
        .data=${left}
      ></duplicates-table>
      <duplicates-table
        name=${names.length > 1 && names[1]}
        .data=${right}
      ></duplicates-table>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "summary-view": SummaryView;
  }
}
