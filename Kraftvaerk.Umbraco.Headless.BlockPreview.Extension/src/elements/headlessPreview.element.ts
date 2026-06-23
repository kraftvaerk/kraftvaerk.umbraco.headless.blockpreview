import { UMB_BLOCK_MANAGER_CONTEXT, UmbBlockDataType } from "@umbraco-cms/backoffice/block";
import { TOGGLE_PREVIEW_EVENT } from "./block-action-toggle-preview.js";
import { UmbBlockEditorCustomViewConfiguration, UmbBlockEditorCustomViewElement } from "@umbraco-cms/backoffice/block-custom-view";
import { UmbBlockTypeBaseModel } from "@umbraco-cms/backoffice/block-type";
import { UmbEntityUnique } from "@umbraco-cms/backoffice/entity";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_VARIANT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/workspace";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { BlockPreviewClient, HeadlessPreviewToggleModel } from "../blockpreview-api";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
const elementName = 'umb-headless-preview';

@customElement(elementName)
export class HeadlessPreviewElement extends UmbLitElement implements UmbBlockEditorCustomViewElement {

  static useBeamFallback = false;
  static loadingBarHtml = `
    <uui-ref-node name="Loading preview..." detail="" standalone href="">
      <uui-icon slot="icon" name="icon-plugin"></uui-icon>
      <uui-loader-bar style="color: #006eff;"></uui-loader-bar>
    </uui-ref-node>
  `;
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
  #lastError?: string | undefined;
  #embedded: boolean = false;
  #blockSetting: HeadlessPreviewToggleModel | undefined;
  #isGrid: boolean = false;
  #isList: boolean = false;
  #isRTE: boolean = false;

  #onTogglePreview = () => this.requestUpdate();

  constructor() {
    super();
    this.init();
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener(TOGGLE_PREVIEW_EVENT, this.#onTogglePreview);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(TOGGLE_PREVIEW_EVENT, this.#onTogglePreview);
  }

  async updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (this.#lastValue !== this.content || this.#lastSettings !== this.settings) {
      this.#debouncedFetchHtml();
    }
  }

  override render() {

    if (!this.#blockSetting) {
      this.#blockSetting = HeadlessPreviewElement.blockSettings.find(x => x.id == this.blockType?.contentElementTypeKey);
    }

    if (!this.#lastValue)
      this.#lastValue = this.content;
    if (!this.#lastSettings)
      this.#lastSettings = this.settings;

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
      this.#isGrid = blockManager?.getHostElement().tagName === 'UMB-PROPERTY-EDITOR-UI-BLOCK-GRID';
      this.#isList = blockManager?.getHostElement().tagName === 'UMB-PROPERTY-EDITOR-UI-BLOCK-LIST';
      this.#isRTE = blockManager?.getHostElement().tagName === 'UMB-PROPERTY-EDITOR-UI-TIPTAP';
    });

    this.consumeContext(UMB_VARIANT_WORKSPACE_CONTEXT, (workspaceContext) => {
      this.#currentId = workspaceContext?.getUnique();
      this.#lastValue = this.content;
      this.getHtmlString().then(() => {
        this.requestUpdate();
      });
    });

    this.checkReadiness();
  }

  checkReadiness() {
    setTimeout(() => {
      if (this.#currentHtmlString === HeadlessPreviewElement.loadingBarHtml) {

        if (this.#currentId === null || this.#currentId === undefined) {
          this.#embedded = true;
        }

        this.getHtmlString();
      }
      else this.checkReadiness();
    }, 500);
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
        if (token) {
          const client = new BlockPreviewClient({
            TOKEN: token,
          });

          try {
            const response = await client.kraftvaerkUmbracoHeadlessBlockpreviewApiV1.postApiV1KraftvaerkUmbracoHeadlessBlockpreview({
              requestBody: blockPreviewObject,
            });

            this.#currentHtmlString = response.html ?? 'blockbeam';
          } catch (error) {
            this.#currentHtmlString = 'blockbeam';
            this.#lastError = error instanceof Error ? error.message : 'Unknown error';
          }
          this.requestUpdate();
        }
      });

    } catch (error) {
      this.#currentHtmlString = 'blockbeam';
      this.#lastError = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  private resolveLabel(label: string | undefined): string {
    console.log('Resolving label', { label, content: this.content });
    if (!label) return 'error';
    if (!this.content) return label;
    const contentObj = this.content as Record<string, unknown>;
    return label.replace(/\{[=+!]([^}]+)\}/g, (_match, alias) => {
      const val = contentObj?.[alias];
      return val !== undefined && val !== null && val !== '' ? String(val) : '';
    });
  }

  private blockBeam(message?: string) {
    return html`
    <uui-ref-node .name=${this.resolveLabel(this.label)} .detail=${message ?? ''} standalone="">
      <uui-icon slot="icon" .name=${this.icon ?? 'icon-plugin'} style="--uui-icon-color:var(--uui-palette-maroon-flush);"></uui-icon>
     </uui-ref-node>`;
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

      .__block-preview {
        width: 100%;
        pointer-events: none;
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
