import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { onDiff } from "./worker-client";
import { Diff, DiffType } from "./types";

@customElement("diff-view")
export class DiffView extends LitElement {
  static override styles = css``;

  @state()
  private leftDiff: Diff[] = [];

  @state()
  private rightDiff: Diff[] = [];

  constructor() {
    super();
    onDiff((diff) => {
      const lD: Diff[] = [];
      const rD: Diff[] = [];
      diff.forEach((d) => {
        if (d.type === DiffType.Added) {
          rD.push(d);
        } else if (d.type === DiffType.Removed) {
          lD.push(d);
        } else {
          rD.push(d);
          lD.push(d);
        }
      });
      this.rightDiff = rD;
      this.leftDiff = lD;
    });
  }
  override render() {
    const max = Math.max(this.leftDiff.length, this.rightDiff.length);
    const rows = [];
    for (let i = 0; i < max; i++) {
      const ld: Diff | string =
        i < this.leftDiff.length ? this.leftDiff[i].entry.request.url : "";
      const rd: Diff | string =
        i < this.rightDiff.length ? this.rightDiff[i].entry.request.url : "";
      rows.push(
        html`<tr>
          <td>${ld}</td>
          <td>${rd}</td>
        </tr>`
      );
    }
    return html`<table>
      <thead>
        <tr>
          <th>Before</th>
          <th>After</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "diff-view": DiffView;
  }
}
