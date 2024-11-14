import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { onDiff } from "./worker-client";
import { Diff, DiffType, URLDiff, URLDiffType } from "./types";
import { getURLDiff } from "./utils";

const LEFT_NAME = "HAR 1";
const RIGHT_NAME = "HAR 2";

interface Spacer {
  type: string;
  entry: { request: { url: string } };
}

const SPACER: Spacer = {
  type: "Spacer",
  entry: { request: { url: "" } },
};

interface PartialDiff extends Diff {
  urlDiff: URLDiff[];
}

type DiffRender = Diff | Spacer | PartialDiff;

@customElement("har-cell")
class HARCell extends LitElement {
  constructor() {
    super();
    this.diff = undefined;
    this.type = "left";
  }

  static override styles = css`
    .PartialAdded {
      background-color: #018000;
    }
    span.PartialRemoved {
      background-color: #fc0003;
    }
    .Added {
      background-color: #018000;
    }
    .Removed {
      background-color: #fc0003;
    }
  `;

  @property({ type: Object })
  diff: Diff | Spacer | PartialDiff | undefined;

  @property()
  type: "left" | "right" = "left";

  getClass = (): string => {
    return this.type === "left" ? "Removed" : "Added";
  };

  override render() {
    let content: TemplateResult[] = [];
    const diff = this.diff;
    if (diff && diff.type !== "Spacer") {
      if ("urlDiff" in diff && Array.isArray(diff.urlDiff)) {
        // Partial diff
        for (let i = 0; i < diff.urlDiff.length; i++) {
          const { type, first, second } = diff.urlDiff[i];
          content.push(
            html`<span
                class=${type === URLDiffType.Changed
                  ? `Partial${this.getClass()}`
                  : ""}
                >${this.type === "left" ? first : second}</span
              >${i !== diff.urlDiff.length - 1 ? html`<span>/</span>` : ""}`
          );
        }
      } else {
        const className =
          this.diff?.type !== DiffType.Unchanged && this.getClass();
        content.push(
          html`<div class=${className || ""}>${diff.entry.request.url}</div>`
        );
      }
    }
    return content;
  }
}

@customElement("diff-view")
export class DiffView extends LitElement {
  static override styles = css`
    :host {
      max-width: 100%;
    }
    table {
      width: 100%;
    }
    td {
      max-width: 50%;
      overflow: hidden;
      white-space: wrap;
      word-break: break-all;
      text-overflow: ellipsis;
    }
  `;

  @state()
  private leftDiff: Array<DiffRender> = [];

  @state()
  private rightDiff: Array<DiffRender> = [];

  @state()
  private leftName: string = LEFT_NAME;

  @state()
  private rightName: string = RIGHT_NAME;

  constructor() {
    super();
    onDiff((diff, leftName, rightName) => {
      this.leftName = leftName || LEFT_NAME;
      this.rightName = rightName || RIGHT_NAME;
      const lD: Array<DiffRender> = [];
      const rD: Array<DiffRender> = [];
      diff.forEach((d, i) => {
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
          if (d.type === DiffType.Unchanged) {
            rD.push(d);
            lD.push(d);
          } else if (d.type === DiffType.Partial) {
            const urlDiff = getURLDiff(
              d.entry.request.url,
              d.secondEntry?.request.url
            );
            rD.push({ ...d, urlDiff });
            lD.push({ ...d, urlDiff });
          }
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
      rows.push(
        html`<tr>
          <td><har-cell .diff=${this.leftDiff[i]} type="left"></har-cell></td>
          <td><har-cell .diff=${this.rightDiff[i]} type="right"></har-cell></td>
        </tr>`
      );
    }
    return html`<table>
      <thead>
        <tr>
          <th>${this.leftName}</th>
          <th>${this.rightName}</th>
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
    "har-cell": HARCell;
  }
}
