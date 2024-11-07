import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("duplicates-table")
export class DuplicatesTable extends LitElement {
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

  @property({ type: Array })
  public data: { url: String; method: String; count: Number }[] = [];

  override render() {
    return html`<div class="duplicates">
      <table>
        <thead>
          <tr>
            <th>${this.name}</th>
          </tr>
        </thead>
      </table>
      <table>
        <thead>
          <tr>
            <th>Request</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          ${this.data.map(
            ({ url, count }) =>
              html`<tr>
                <td class="url">${url}</td>
                <td class="count">${count}</td>
              </tr>`
          )}
        </tbody>
      </table>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "duplicates-table": DuplicatesTable;
  }
}
