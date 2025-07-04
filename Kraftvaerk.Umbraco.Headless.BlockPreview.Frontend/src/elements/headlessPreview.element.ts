import {  UMB_BLOCK_MANAGER_CONTEXT, UmbBlockDataType } from "@umbraco-cms/backoffice/block";
import { UmbBlockEditorCustomViewConfiguration, UmbBlockEditorCustomViewElement } from "@umbraco-cms/backoffice/block-custom-view";
import { UmbBlockTypeBaseModel } from "@umbraco-cms/backoffice/block-type";
import { UmbEntityUnique } from "@umbraco-cms/backoffice/entity";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_VARIANT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/workspace";
import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { BlockPreviewClient, HeadlessPreviewToggleModel } from "../blockpreview-api";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";

const elementName = 'umb-headless-preview';

@customElement(elementName)
export class HeadlessPreviewElement extends UmbLitElement implements UmbBlockEditorCustomViewElement {

  static useBeamFallback = false;
  static loadingBarHtml = '<uui-loader-bar style="color: #006eff"></uui-loader-bar>';
  static blockSettings: HeadlessPreviewToggleModel[] = []; 

  @property({ attribute: false }) content?: UmbBlockDataType;
  @property({ attribute: false }) settings?: UmbBlockDataType;
  @property({ attribute: false }) blockType?: UmbBlockTypeBaseModel | undefined;
  @property({ attribute: false }) label?: string | undefined;
  @property({ attribute: false }) icon?: string | undefined;
  @property({ attribute: false }) config?: UmbBlockEditorCustomViewConfiguration | undefined;
  @property({ attribute: false }) contentInvalid?: boolean | undefined;
  @property({ attribute: false }) settingsInvalid?: boolean | undefined;
  @property({ attribute: false }) unsupported?: boolean | undefined;
  @property({ attribute: false }) unpublished?: boolean | undefined;

  #currentId?: UmbEntityUnique | null = null;
  #lastValue?: UmbBlockDataType | undefined;
  #lastSettings?: UmbBlockDataType | undefined;
  #currentHtmlString?: string | undefined;
  #debounceTimer?: number;
  #culture: string | null | undefined;
  #useBeamFallback: boolean = false;
  #uuiBars: HTMLElement[] = [];
  #lastError?: string | undefined;
  #embedded: boolean = false;
  #blockSetting: HeadlessPreviewToggleModel | undefined;
  #isGrid: boolean = false;
  #isList: boolean = false;
  #isRTE: boolean = false;
  constructor() {
    super();
    
    this.init();
  }

  async updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (this.#lastValue !== this.content || this.#lastSettings !== this.settings) {
      this.#debouncedFetchHtml();
    }
  }

  override render() {

    if(!this.#blockSetting) {
      this.#blockSetting = HeadlessPreviewElement.blockSettings.find(x => x.id == this.blockType?.contentElementTypeKey)
    }

    if (!this.#lastValue)
      this.#lastValue = this.content;
    if (!this.#lastSettings)
      this.#lastSettings = this.settings;

    this.#uuiBars.forEach((uuiActionBar) => {
      this.manageButtons(uuiActionBar);
    });
    
    if (
      HeadlessPreviewElement.useBeamFallback || 
      this.#currentHtmlString === 'blockbeam' || 
      (this.#embedded && !this.#blockSetting?.enabledNested) ||
      (!this.#blockSetting?.enabledGrid && this.#isGrid) ||
      (!this.#blockSetting?.enabledList && this.#isList) ||
      (!this.#blockSetting?.enabledRTE && this.#isRTE) ||
      this.#lastError
    ) {
      return this.blockBeam(this.#lastError);
    }
      

    
    return html`<div class="__headless-preview"><a href=${(this.config?.showContentEdit ? this.config?.editContentPath : undefined) ?? ''}>${unsafeHTML(this.#currentHtmlString)}</a></div>`;
  }

  async init() {
    this.#currentHtmlString = HeadlessPreviewElement.loadingBarHtml;

    this.consumeContext(UMB_BLOCK_MANAGER_CONTEXT, (blockManager) => {
      this.#culture = blockManager?.getVariantId()?.culture;
      console.log(blockManager?.getHostElement().tagName)
      this.#isGrid = blockManager?.getHostElement().tagName === 'UMB-PROPERTY-EDITOR-UI-BLOCK-GRID';
      this.#isList = blockManager?.getHostElement().tagName === 'UMB-PROPERTY-EDITOR-UI-BLOCK-LIST';
      this.#isRTE = blockManager?.getHostElement().tagName === 'UMB-PROPERTY-EDITOR-UI-TIPTAP';

      const root = blockManager?.getHostElement();
      if (root != null) {
        this.#uuiBars = this.findAllInShadowRoots<HTMLElement>('uui-action-bar', root);
      }
    });

    this.consumeContext(UMB_VARIANT_WORKSPACE_CONTEXT, (workspaceContext) => {
      this.#currentId = workspaceContext?.getUnique();
      this.#lastValue = this.content;
      this.getHtmlString().then(() => {
        this.requestUpdate();
      });
    });
    
    this.checkReadiness();
    this.uiLoop();
  }

  checkReadiness() {
    setTimeout(() => {
      if(this.#currentHtmlString === HeadlessPreviewElement.loadingBarHtml) {
        
        if(this.#currentId === null || this.#currentId === undefined) {
          this.#embedded = true;
        }

        this.getHtmlString();
      }
      else this.checkReadiness();
    }, 500);
  }

  uiLoop() {
    setTimeout(() => {
      if (this.#useBeamFallback !== HeadlessPreviewElement.useBeamFallback) {
        this.#useBeamFallback = HeadlessPreviewElement.useBeamFallback;
        this.requestUpdate();
      }

      this.uiLoop();
    }, 100);
  }

  #debouncedFetchHtml() {
    clearTimeout(this.#debounceTimer);
    this.#debounceTimer = window.setTimeout(async () => {
      this.#lastValue = this.content;
      this.#lastSettings = this.settings;
      await this.getHtmlString();
    }, 10);
  }

  async getHtmlString() {
    const blockPreviewObject = {
      id: this.#currentId,
      contentType: this.blockType?.contentElementTypeKey,
      settingsType: this.blockType?.settingsElementTypeKey ?? '',
      content: JSON.stringify(this.#lastValue),
      settings: JSON.stringify(this.#lastSettings ?? {}),
      culture: this.#culture,
    };

    try {
      
      this.consumeContext(UMB_AUTH_CONTEXT, async (authContext) => {
        const token = await authContext?.getLatestToken();
          if(token) {
          const client = new BlockPreviewClient({
            TOKEN: token,
          });

          const response = await client.kraftvaerkUmbracoHeadlessBlockpreviewApiV1.postApiV1KraftvaerkUmbracoHeadlessBlockpreview({
            requestBody: blockPreviewObject,
          });

          this.#currentHtmlString = response.html ?? 'blockbeam';
          this.requestUpdate();
        }
      });

    } catch (error) {
      this.#currentHtmlString = 'blockbeam';
      this.#lastError = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  private blockBeam(message?: string) {
    const label = this.label + (message ? `- Rendering-error:  ${message}` : '');
    return html`<umb-ref-grid-block
      standalone
      href=${(this.config?.showContentEdit ? this.config?.editContentPath : undefined) ?? ''}>
      <umb-icon slot="icon" .name=${this.icon}></umb-icon>
      <umb-ufm-render slot="name" inline .markdown=${label} .value=${this.content}></umb-ufm-render>
      ${this.unpublished
        ? html`<uui-tag slot="name" look="secondary" title=${this.localize.term('blockEditor_notExposedDescription')}>
            <umb-localize key="blockEditor_notExposedLabel"></umb-localize>
          </uui-tag>`
        : nothing}
      <umb-block-grid-areas-container slot="areas" draggable="false"></umb-block-grid-areas-container>
    </umb-ref-grid-block>`;
  }

  private findAllInShadowRoots<T extends Element = Element>(
    selector: string,
    root: Element | ShadowRoot
  ): T[] {
    const result: T[] = [];

    function search(node: Element | ShadowRoot): void {
      if (node instanceof Element && node.matches(selector)) {
        result.push(node as T);
      }

      const shadow = (node as Element).shadowRoot;
      if (shadow) {
        Array.from(shadow.children).forEach(search);
      }

      if (node instanceof Element) {
        Array.from(node.children).forEach(search);
      }
    }

    search(root);
    return result;
  }

  private manageButtons(uuiActionBar: HTMLElement) {
    if (uuiActionBar.querySelector('.__blockpreview-button')) return;

    const button = this.getHostElement().ownerDocument.createElement('a');
    button.classList.add('__blockpreview-button');
    button.setAttribute('data-id', this.#currentId?.toString() ?? '');
    button.setAttribute('style', `
      height: 33px;
      width: 33px;
      background: #f3f3f5;
      cursor: pointer;
      border-top-left-radius: 15px;
      border-bottom-left-radius: 15px;
      display: inline-block;
    `);

    button.innerHTML = `
      <svg style="height: 17px; margin: 8px;" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" class="lucide lucide-container" viewBox="0 0 24 24">
        <path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z"></path>
        <path d="M10 21.9V14L2.1 9.1M10 14l11.9-6.9M14 19.8v-8.1M18 17.5V9.4"></path>
      </svg>
    `;

    button.addEventListener('mouseenter', () => {
      button.style.background = '#ffffff';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = '#f3f3f5';
    });

    button.addEventListener('click', () => {
      HeadlessPreviewElement.useBeamFallback = !HeadlessPreviewElement.useBeamFallback;
    
      this.requestUpdate();

    });

    uuiActionBar.insertBefore(button, uuiActionBar.firstElementChild);
  }

  static override styles = [
    css`
      .__headless-preview {
        border: 2px solid transparent;
        box-sizing: border-box;
        transition: border-color 0.2s ease-in-out;
        height: 100%;
      }
      .__headless-preview > a:first-of-type {
        display: flex;
        width: 100%;
        height: 100%;
      }
      .__headless-preview:hover {
        border: 2px solid var(--uui-palette-malibu);
      }

      .__blockpreview-button {
        cursor: pointer;
      }

      .__block-preview {
        width: 100%;
      }
    `,
  ];
}

export default HeadlessPreviewElement;

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: HeadlessPreviewElement;
  }
}
