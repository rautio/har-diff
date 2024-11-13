import { LitElement, html, css } from "lit";
import { provide } from "@lit/context";
import { customElement, state } from "lit/decorators.js";
import { postMessage } from "./worker-client";
import { filterContext, Filters } from "./filter-context";
import "./nav-bar";
import "./diff-view";
import "./summary-view";
import "./filter-settings";
import { WorkerMessages, Sort, Order } from "./types";

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@customElement("har-app")
export class HARApp extends LitElement {
  constructor() {
    super();
    if (typeof Worker === "undefined") {
      this.errorMessage = "Sorry! No Web Worker support.";
    }
  }
  static override styles = css`
    .container {
      margin: 12px;
      display: flex;
      flex-direction: column;
    }
    .settings {
      display: flex;
      flex-direction: row;
    }
  `;

  @provide({ context: filterContext })
  @state()
  public filters = {
    exclude: "",
  };

  changeFilters = (newFilters: Filters) => {
    this.filters = newFilters;
  };

  @state()
  private errorMessage = "";

  createHandleHAR = (idx: 0 | 1) => (e?: HTMLInputEvent) => {
    if (e?.target && e.target?.files) {
      const file = e.target.files[0];
      postMessage({
        type: WorkerMessages.FileUpload,
        data: { index: idx, file },
      });
      this.errorMessage = "";
    } else {
      this.errorMessage = "Invalid file input.";
    }
  };
  handleClearAll = () => {
    postMessage({
      type: WorkerMessages.ClearAll,
    });
  };
  handleSortChange = (e) => {
    const selected = e.target.selectedIndex;
    const order = e.target.options[selected].getAttribute("data-order");
    const sort = e.target.options[selected].getAttribute("data-sort");
    postMessage({ type: WorkerMessages.SortChange, data: { sort, order } });
  };

  override render() {
    return html`<div>
      <div class="container">
        <div class="settings">
          <div class="har-inputs">
            <div>
              <label for="har-file">HAR 1</label
              ><input
                id="har1-input"
                type="file"
                name="har-file"
                accept=".json,.har"
                @change=${this.createHandleHAR(0)}
              />
            </div>
            <div>
              <label for="har-file">HAR 2</label
              ><input
                id="har2-input"
                type="file"
                name="har-file"
                accept=".json,.har"
                @change=${this.createHandleHAR(1)}
              />
            </div>
            <div>
              <label for="sort">Sort</label>
              <select name="sort" id="sort" @change=${this.handleSortChange}>
                <option
                  value="ChronoAsc"
                  data-sort=${Sort.Chronological}
                  data-order=${Order.Asc}
                >
                  Chronological ↑
                </option>
                <option
                  value="ChronoDesc"
                  data-sort=${Sort.Chronological}
                  data-order=${Order.Desc}
                >
                  Chronological ↓
                </option>
                <option
                  value="AlphaAsc"
                  data-sort=${Sort.Alphabetical}
                  data-order=${Order.Asc}
                >
                  Alphabetical ↑
                </option>
                <option
                  value="AlphaDesc"
                  data-sort=${Sort.Alphabetical}
                  data-order=${Order.Desc}
                >
                  Alphabetical ↓
                </option>
              </select>
            </div>
            <button @click=${this.handleClearAll}>Clear all</button>
          </div>
          <filter-settings .change=${this.changeFilters}></filter-settings>
        </div>
        <div id="message">${this.errorMessage}</div>
        <nav-bar>
          <nav-item title="Detail" path="/">
            <diff-view></diff-view>
          </nav-item>
          <nav-item title="Summary" path="/summary">
            <summary-view></summary-view>
          </nav-item>
        </nav-bar>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "har-app": HARApp;
  }
}
