import { UMB_PROPERTY_DATASET_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BlockPreviewClient, HeadlessPreviewToggleModel } from '../blockpreview-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';

const elementName = 'umb-headless-preview-workspace-view';

@customElement(elementName)
export class HeadlessWorkspaceViewElement extends UmbLitElement {
  @state()
  private model: HeadlessPreviewToggleModel = {
    id: '',
    enabled: false,
    enabledNested: false,
    enabledList: false,
    enabledGrid: false,
    enabledRTE: false,
    advancedSettings: '',
  };

  static styles = [
    css`
      uui-toggle,
      uui-textarea {
        margin-top: var(--uui-size-space-3);
      }

      .sub-toggle {
        margin-left: var(--uui-size-space-3);
        display: block;
      }

      .advanced {
        margin-top: var(--uui-size-space-5);
      }

      .advanced p {
        font-size: 0.875rem;
        color: var(--uui-color-text-secondary);
        margin: 0;
      }
    `,
  ];

  constructor() {
    super();

    this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, async (propertyDatasetContext) => {
      const id = propertyDatasetContext?.getUnique();
      if (id) {
        this.model.id = id;
        await this.loadInitialState();
      }
    });
  }

  private async loadInitialState() {
    try {
      this.consumeContext(UMB_AUTH_CONTEXT, async (authContext) => {
        const token = await authContext?.getLatestToken() ?? '';
        const base = authContext?.getServerUrl() ?? '';

        const client = new BlockPreviewClient({
          BASE: base,
          TOKEN: token,
        });

        const response = await client.kraftvaerkUmbracoHeadlessBlockpreviewApiV1.getApiV1KraftvaerkUmbracoHeadlessBlockpreview({
          id: this.model.id,
        });

        this.model =  {
          ...this.model,
          ...response
        }
      });
      
    } catch (err) {
      console.error('Error while fetching preview state', err);
    }
  }

  private async updateModel(partial: Partial<HeadlessPreviewToggleModel>) {
    this.model = { ...this.model, ...partial };

    this.consumeContext(UMB_AUTH_CONTEXT, async (authContext) => {
      const token = await authContext?.getLatestToken() ?? '';
      const base = authContext?.getServerUrl() ?? '';

      const client = new BlockPreviewClient({
        BASE: base,
        TOKEN: token,
      });

      await client.kraftvaerkUmbracoHeadlessBlockpreviewApiV1.putApiV1KraftvaerkUmbracoHeadlessBlockpreview({
        requestBody: this.model,
      });

    });
  }

  private handleMainToggle(e: Event) {
    const enabled = (e.target as HTMLInputElement).checked;
    this.updateModel({
      enabled,
      enabledList: enabled,
      enabledGrid: enabled,
      enabledRTE: enabled,
    });
  }

  private handleSubToggle(key: 'enabledList' | 'enabledGrid' | 'enabledRTE') {
    return (e: Event) => {
      const value = (e.target as HTMLInputElement).checked;
      this.updateModel({ [key]: value } as Partial<HeadlessPreviewToggleModel>);
    };
  }

  private handleNestedToggle(e: Event) {
    const enabledNested = (e.target as HTMLInputElement).checked;
    this.updateModel({ enabledNested });
  }
/*
  private handleAdvancedSettingsChange(e: Event) {
    const advancedSettings = (e.target as HTMLTextAreaElement).value;
    this.updateModel({ advancedSettings });
  }
*/
  render() {
    return html`
      <uui-box headline="Workspace View">
        <uui-label>Enabled</uui-label>

        <uui-toggle
          label="Headless Block Preview"
          .checked=${this.model.enabled}
          @change=${this.handleMainToggle}>
        </uui-toggle>

        <div class="sub-toggle">
          <uui-label>Enabled for Block List</uui-label>
          <uui-toggle
            label="Enable for List"
            .checked=${this.model.enabledList}
            ?disabled=${!this.model.enabled}
            @change=${this.handleSubToggle('enabledList')}>
          </uui-toggle>

          <uui-label>Enabled for Block Grid</uui-label>
          <uui-toggle
            label="Enable for Grid"
            .checked=${this.model.enabledGrid}
            ?disabled=${!this.model.enabled}
            @change=${this.handleSubToggle('enabledGrid')}>
          </uui-toggle>

          <uui-label>Enabled for Rich Text Editor</uui-label>
          <uui-toggle
            label="Enable for RTE"
            .checked=${this.model.enabledRTE}
            ?disabled=${!this.model.enabled}
            @change=${this.handleSubToggle('enabledRTE')}>
          </uui-toggle>
        </div>

        <div class="advanced">
          <uui-label>Advanced Settings</uui-label>
          <hr />
          <uui-label>Enable Nested Preview</uui-label>
          <uui-toggle
            label="Enable Nested Blocks"
            .checked=${this.model.enabledNested}
            @change=${this.handleNestedToggle}>
          </uui-toggle>
        </div>
      </uui-box>
    `;
  }
}
