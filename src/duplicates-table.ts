import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { consume } from "@lit/context";
import { getPath, getInitBreakdown } from "./utils";
import { filterContext, Filters } from "./filter-context";

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

  @consume({ context: filterContext, subscribe: true })
  @state()
  public filters?: Filters;

  @property({ type: String })
  public name: string = "";

  @property({ type: Array })
  public data: { url: string; method: string; count: number }[] = [];

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
          ${this.data
            .filter(({ url }) => {
              if (!this.filters?.exclude) return true;
              return !url.includes(this.filters.exclude);
            })
            .map(
              ({ url, count }) =>
                html`<tr>
                  <td class="url" title=${url}>${getPath(url)}</td>
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
