import { UMB_BLOCK_MANAGER_CONTEXT, UmbBlockDataType, UmbBlockLayoutBaseModel } from "@umbraco-cms/backoffice/block";
import { TOGGLE_PREVIEW_EVENT } from "./block-action-toggle-preview.js";
import { UmbBlockEditorCustomViewConfiguration, UmbBlockEditorCustomViewElement } from "@umbraco-cms/backoffice/block-custom-view";
import { UmbBlockTypeBaseModel } from "@umbraco-cms/backoffice/block-type";
import { UmbEntityUnique } from "@umbraco-cms/backoffice/entity";
import { UmbUfmVirtualRenderController } from "@umbraco-cms/backoffice/ufm";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_VARIANT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/workspace";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { ApiError, BlockPreviewClient, BlockPreviewResponse, CancelablePromise, CancelError, HeadlessPreviewToggleModel } from "../blockpreview-api";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { PreviewQueue, StalePreviewError } from "./previewQueue.js";

const elementName = 'umb-headless-preview';

const BLOCK_BEAM = 'blockbeam';

type GridLayoutHints = { columnSpan?: number; rowSpan?: number };

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

  /** Shared across every block on the page so a large page cannot flood the render host. */
  static queue = new PreviewQueue(6);

  /** How long to wait for a document workspace before deciding the block is edited in a nested/embedded context. */
  static readinessDelayMs = 500;

  /** Debounce for edits. Keystrokes in an inline-edited block arrive one property change at a time. */
  static editDebounceMs = 150;

  @property({ attribute: false }) content?: UmbBlockDataType;
  @property({ attribute: false }) settings?: UmbBlockDataType;
  @property({ attribute: false }) blockType?: UmbBlockTypeBaseModel | undefined;
  @property({ attribute: false }) label?: string | undefined;
  @property({ attribute: false }) icon?: string | undefined;
  @property({ attribute: false }) config?: UmbBlockEditorCustomViewConfiguration | undefined;
  @property({ attribute: false }) contentKey?: string | undefined;
  @property({ attribute: false }) layout?: UmbBlockLayoutBaseModel | undefined;
  @property({ attribute: false }) contentInvalid?: boolean | undefined;
  @property({ attribute: false }) settingsInvalid?: boolean | undefined;
  @property({ attribute: false }) unsupported?: boolean | undefined;
  @property({ attribute: false }) unpublished?: boolean | undefined;

  #currentId?: UmbEntityUnique | null = null;
  #lastValue?: UmbBlockDataType | undefined;
  #lastSettings?: UmbBlockDataType | undefined;
  #currentHtmlString?: string | undefined;
  #debounceTimer?: number;
  #readinessTimer?: number;
  #culture: string | null | undefined;
  #lastError?: string | undefined;
  #embedded: boolean = false;
  #blockSetting: HeadlessPreviewToggleModel | undefined;
  #isGrid: boolean = false;
  #isList: boolean = false;
  #isRTE: boolean = false;

  #authContext?: typeof UMB_AUTH_CONTEXT.TYPE;
  #authReady: Promise<void>;
  #resolveAuthReady!: () => void;
  #ufmLabelRenderer: UmbUfmVirtualRenderController;

  /** Set once the first request has been issued; later edits go through the debounced path. */
  #hasRequested = false;
  /** Monotonic counter. A response is only applied if it belongs to the latest request. */
  #requestSeq = 0;
  #inflight?: CancelablePromise<BlockPreviewResponse>;

  #onTogglePreview = () => this.requestUpdate();

  constructor() {
    super();
    this.#authReady = new Promise<void>((resolve) => { this.#resolveAuthReady = resolve; });
    this.#ufmLabelRenderer = new UmbUfmVirtualRenderController(this);
    this.init();
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener(TOGGLE_PREVIEW_EVENT, this.#onTogglePreview);

    // Re-attached after being moved (block sorting) while a request was cancelled on disconnect: ask again.
    if (this.#hasRequested && !this.#inflight && this.#currentHtmlString === HeadlessPreviewElement.loadingBarHtml) {
      this.#fetchHtml();
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(TOGGLE_PREVIEW_EVENT, this.#onTogglePreview);
    clearTimeout(this.#debounceTimer);
    clearTimeout(this.#readinessTimer);
    this.#cancelInflight();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (!this.#hasRequested) return;
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
      this.#currentHtmlString === BLOCK_BEAM ||
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
      const tag = blockManager?.getHostElement().tagName;
      this.#isGrid = tag === 'UMB-PROPERTY-EDITOR-UI-BLOCK-GRID';
      this.#isList = tag === 'UMB-PROPERTY-EDITOR-UI-BLOCK-LIST';
      this.#isRTE = tag === 'UMB-PROPERTY-EDITOR-UI-TIPTAP';
    });

    this.consumeContext(UMB_AUTH_CONTEXT, (authContext) => {
      if (!authContext) return;
      this.#authContext = authContext;
      this.#resolveAuthReady();
    });

    this.consumeContext(UMB_VARIANT_WORKSPACE_CONTEXT, (workspaceContext) => {
      const id = workspaceContext?.getUnique();
      if (workspaceContext) this.#embedded = false;

      if (!this.#hasRequested) {
        this.#currentId = id;
        this.#initialFetch();
      } else if (id !== this.#currentId) {
        this.#currentId = id;
        this.#debouncedFetchHtml();
      }
    });

    this.#readinessTimer = window.setTimeout(() => {
      if (this.#hasRequested) return;
      // No document workspace showed up: the block is edited inside another block (or a modal).
      if (this.#currentId === null || this.#currentId === undefined) {
        this.#embedded = true;
      }
      this.#initialFetch();
    }, HeadlessPreviewElement.readinessDelayMs);
  }

  #initialFetch() {
    if (this.#hasRequested) return;
    this.#hasRequested = true;
    this.#lastValue = this.content;
    this.#lastSettings = this.settings;
    this.#fetchHtml();
  }

  #debouncedFetchHtml() {
    clearTimeout(this.#debounceTimer);
    this.#debounceTimer = window.setTimeout(() => {
      this.#lastValue = this.content;
      this.#lastSettings = this.settings;
      this.#fetchHtml();
    }, HeadlessPreviewElement.editDebounceMs);
  }

  #cancelInflight() {
    this.#requestSeq++;
    this.#inflight?.cancel();
    this.#inflight = undefined;
  }

  #editorKind(): string {
    if (this.#isList) return 'list';
    if (this.#isRTE) return 'rte';
    return 'grid';
  }

  async #fetchHtml() {
    // Anything still running or queued for this block is now obsolete.
    this.#cancelInflight();
    const seq = this.#requestSeq;
    const isStale = () => seq !== this.#requestSeq;

    const layout = this.layout as GridLayoutHints | undefined;
    const blockPreviewObject = {
      id: this.#currentId,
      contentType: this.blockType?.contentElementTypeKey,
      settingsType: this.blockType?.settingsElementTypeKey ?? '',
      content: JSON.stringify(this.#lastValue),
      settings: JSON.stringify(this.#lastSettings ?? {}),
      culture: this.#culture,
      editor: this.#editorKind(),
      contentKey: this.contentKey ?? null,
      columnSpan: this.#isGrid ? layout?.columnSpan ?? null : null,
      rowSpan: this.#isGrid ? layout?.rowSpan ?? null : null,
    };

    try {
      await this.#authReady;
      if (isStale()) return;

      const response = await HeadlessPreviewElement.queue.run(async () => {
        const token = await this.#authContext?.getLatestToken();
        if (!token) throw new Error('Not authenticated');
        if (isStale()) throw new StalePreviewError();

        const client = new BlockPreviewClient({
          BASE: this.#authContext?.getServerUrl() ?? '',
          TOKEN: token,
        });

        const request = client.kraftvaerkUmbracoHeadlessBlockpreviewApiV1.postApiV1KraftvaerkUmbracoHeadlessBlockpreview({
          requestBody: blockPreviewObject,
        });
        this.#inflight = request;
        return await request;
      }, isStale);

      if (isStale()) return;
      this.#currentHtmlString = response.html ?? BLOCK_BEAM;
      this.#lastError = undefined;
    } catch (error) {
      if (isStale() || isCancellation(error)) return;
      this.#currentHtmlString = BLOCK_BEAM;
      this.#lastError = describeError(error);
    } finally {
      if (!isStale()) this.#inflight = undefined;
    }

    this.requestUpdate();
  }

  /** Renders the block label the way Umbraco does (UFM), with a manual fallback while the renderer initialises. */
  private resolveLabel(label: string | undefined): string {
    if (!label) return 'error';

    this.#ufmLabelRenderer.markdown = label;
    this.#ufmLabelRenderer.value = this.content;
    const rendered = this.#ufmLabelRenderer.toString();
    if (rendered) return rendered;

    if (!this.content) return label;
    const contentObj = this.content as Record<string, unknown>;

    return label.replace(/\{([^{}]+)\}/g, (_match, token) => {
      const rawToken = String(token).trim();
      const legacyMatch = rawToken.match(/^[=+!](.+)$/);
      const umbValueMatch = rawToken.match(/^umbValue\s*:\s*(.+)$/i);

      const alias = (umbValueMatch?.[1] ?? legacyMatch?.[1] ?? rawToken).trim();
      const val = contentObj?.[alias];
      return val !== undefined && val !== null && val !== '' ? String(val) : '';
    });
  }

  /** Icon values can carry extra classes ("icon-plugin color-green"); uui-icon only wants the name. */
  private resolveIconName(): string {
    const blockTypeIcon = (this.blockType as { icon?: string | undefined })?.icon;
    const raw = (this.icon ?? blockTypeIcon ?? '').trim();
    if (!raw) return 'icon-plugin';
    return raw.split(/\s+/)[0]?.trim() || 'icon-plugin';
  }

  private blockBeam(message?: string) {
    return html`
    <uui-ref-node .name=${this.resolveLabel(this.label)} .detail=${message ?? ''} title=${message ?? ''} standalone="">
      <uui-icon slot="icon" .name=${this.resolveIconName()} style="--uui-icon-color:var(--uui-palette-maroon-flush);"></uui-icon>
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

function isCancellation(error: unknown): boolean {
  if (error instanceof StalePreviewError || error instanceof CancelError) return true;
  return error instanceof Error && error.name === 'AbortError';
}

/** Turns an API failure into the one line an editor sees under the block. */
function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    const body = error.body as { detail?: string; title?: string; correlationId?: string } | undefined;
    if (body && typeof body === 'object') {
      const text = body.detail ?? body.title;
      if (text) return body.correlationId ? `${text} [${body.correlationId}]` : text;
    }
    return `${error.status} ${error.statusText || error.message}`.trim();
  }
  return error instanceof Error ? error.message : String(error);
}

export default HeadlessPreviewElement;

declare global {
  interface HTMLElementTagNameMap {
    [elementName]: HeadlessPreviewElement;
  }
}
