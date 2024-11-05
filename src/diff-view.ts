import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { onDiff } from "./worker-client";
import { Diff, DiffType } from "./types";

interface Spacer {
  type: string;
  entry: { request: { url: string } };
}

const SPACER: Spacer = {
  type: "Spacer",
  entry: { request: { url: "" } },
};
@customElement("diff-view")
export class DiffView extends LitElement {
  static override styles = css`
    :host {
      max-width: 100%;
    }
    td {
      max-width: 50%;
      overflow: hidden;
      white-space: wrap;
      word-break: break-all;
      text-overflow: ellipsis;
    }
    td.Added {
      background-color: #018000;
    }
    td.Removed {
      background-color: #fc0003;
    }
  `;

  @state()
  private leftDiff: Array<Diff | Spacer> = [];

  @state()
  private rightDiff: Array<Diff | Spacer> = [];

  constructor() {
    super();
    onDiff((diff) => {
      const lD: Array<Diff | Spacer> = [];
      const rD: Array<Diff | Spacer> = [];
      diff.forEach((d) => {
        if (d.type === DiffType.Added) {
          rD.push(d);
        } else if (d.type === DiffType.Removed) {
          lD.push(d);
        } else {
          // The lengths should match so need to add spacers
          if (rD.length !== lD.length) {
            const diff = Math.abs(rD.length - lD.length);
            const arrToPush = rD.length < lD.length ? rD : lD;
            for (let i = 0; i < diff; i++) {
              arrToPush.push(SPACER);
            }
          }
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
      const lClass = ld !== "" && this.leftDiff[i].type;
      const rClass = rd !== "" && this.rightDiff[i].type;
      rows.push(
        html`<tr>
          <td class=${lClass}>${ld}</td>
          <td class=${rClass}>${rd}</td>
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
