import { LitElement, html, css } from "lit";
import { provide } from "@lit/context";
import { customElement, state } from "lit/decorators.js";
import { postMessage } from "./worker-client";
import { filterContext, Filters } from "./filter-context";
import "./nav-bar";
import "./diff-view";
import "./summary-view";
import "./filter-settings";

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
      postMessage({ index: idx, file });
      this.errorMessage = "";
    } else {
      this.errorMessage = "Invalid file input.";
    }
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
                accept=".json"
                @change=${this.createHandleHAR(0)}
              />
            </div>
            <div>
              <label for="har-file">HAR 2</label
              ><input
                id="har2-input"
                type="file"
                name="har-file"
                accept=".json"
                @change=${this.createHandleHAR(1)}
              />
            </div>
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
