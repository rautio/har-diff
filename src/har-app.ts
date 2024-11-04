import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

let w: Worker | undefined;

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@customElement("har-app")
export class HARApp extends LitElement {
  static override styles = css``;

  @state()
  private errorMessage = "";

  constructor() {
    super();
    if (typeof Worker !== "undefined") {
      if (typeof w == "undefined") {
        w = new Worker(new URL("./worker.ts", import.meta.url));
      }
      w.onmessage = function (event) {
        console.log({ data: event.data });
      };
    } else {
      this.errorMessage = "Sorry! No Web Worker support.";
    }
  }

  createHandleHAR = (idx: 0 | 1) => (e?: HTMLInputEvent) => {
    if (w && e?.target && e.target?.files) {
      const file = e.target.files[0];
      w.postMessage({ index: idx, file });
      this.errorMessage = "";
    } else {
      this.errorMessage = "Invalid file input.";
    }
  };
  override render() {
    return html`<div>
      <div style="display:flex; flex-direction: column">
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
        <div id="message">${this.errorMessage}</div>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "har-app": HARApp;
  }
}
