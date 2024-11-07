import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface Item extends Element {
  selected?: boolean;
  title?: string;
  path?: string;
}

@customElement("nav-bar")
class NavBar extends LitElement {
  static override styles = css`
    :host {
      margin-top: 12px;
    }
    :host,
    slot {
      display: block;
    }
    span {
      display: inline-block;
    }
    .tab {
      background-color: #ddd;
      user-select: none;
      margin-right: -1px;
      margin-bottom: -1px;
      border: 1px solid #bbb;
      padding: 10px 15px;
    }
    .tab-selected {
      background-color: white;
      border-bottom: 1px solid white;
    }
    .content {
      padding: 15px;
      border: 1px solid #bbb;
    }
  `;
  get items(): Item[] {
    const slot = this.shadowRoot?.querySelector("slot");
    return slot ? slot.assignedElements() : [];
  }
  selectItem(selected: Item) {
    for (let item of this.items) {
      item.selected = item == selected;
      if (item.selected && item.path) {
        window.history.pushState("", "", item.path);
      }
    }
    this.requestUpdate();
  }
  override firstUpdated(args) {
    super.firstUpdated(args);
    const { pathname } = window.location;
    let selectedItem = this.items.find((item) => item.path === pathname);
    this.selectItem(selectedItem || this.items[0]);
  }
  override render() {
    return html`
      <nav>
        ${this.items.map(
          (item) =>
            html` <span
              @click=${() => this.selectItem(item)}
              class=${(item.selected ? ["tab", "tab-selected"] : ["tab"]).join(
                " "
              )}
            >
              ${item.title}
            </span>`
        )}
      </nav>
      <slot class="content" @slotchange=${(ev) => this.requestUpdate()}></slot>
    `;
  }
}

@customElement("nav-item")
class NavItem extends LitElement {
  static override styles = css`
    :host(:not([selected])) {
      display: none;
    }
  `;
  @property({ type: Boolean, reflect: true })
  public selected: Boolean = false;
  @property({ type: String, reflect: true })
  public override title: string = "";
  @property({ type: String })
  public path: string = "";

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nav-bar": NavBar;
    "nav-item": NavItem;
  }
}
