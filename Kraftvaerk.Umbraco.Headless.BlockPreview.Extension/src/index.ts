import { ManifestBlockEditorCustomView } from '@umbraco-cms/backoffice/block-custom-view';
import type { ManifestBlockAction, MetaBlockActionDefaultKind } from '@umbraco-cms/backoffice/block';
import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';

import { HeadlessPreviewElement } from './elements/headlessPreview.element.js';
import { ToggleBlockPreviewAction } from './elements/block-action-toggle-preview.js';
import { ManifestWorkspaceView, UMB_WORKSPACE_CONDITION_ALIAS } from '@umbraco-cms/backoffice/workspace';
import { HeadlessWorkspaceViewElement } from './elements/headlessWorkspaceView.element.js';
import { UMB_BLOCK_GRID_TYPE_WORKSPACE_ALIAS } from '@umbraco-cms/backoffice/block-grid';
import { UMB_BLOCK_LIST_TYPE_WORKSPACE_ALIAS } from '@umbraco-cms/backoffice/block-list';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { BlockPreviewClient } from './blockpreview-api/BlockPreviewClient.js';
import { HeadlessPreviewToggleModel } from './blockpreview-api/index.js';

export const onInit: UmbEntryPointOnInit = async (_host, extensionRegistry) => {
  _host.consumeContext(UMB_AUTH_CONTEXT, async (authContext) => {
    const token = await authContext?.getLatestToken() ?? '';
    const base = authContext?.getServerUrl() ?? '';
    const enabledBlocks = await fetchEnabledBlocks(base, token);

    HeadlessPreviewElement.blockSettings = enabledBlocks;
    await applyClientSettings(base, token);

    const blockPreview : ManifestBlockEditorCustomView = {
      alias: 'Kraftvaerk.Umbraco.Headless.BlockPreview',
      name: 'Umbraco Community Headless Block Preview',
      type: 'blockEditorCustomView',
      element: HeadlessPreviewElement,
      forContentTypeAlias: enabledBlocks.filter(x => x.enabled && x.alias).map(x => x.alias as string) ?? [],
    };

    const blockGridWorkspaceView : ManifestWorkspaceView = {
      type: 'workspaceView',
      alias: 'umb.workspaceView.headlessPreviewGrid',
      name: 'Headless Preview',
      element: HeadlessWorkspaceViewElement,
      weight: 1100,
      meta: {
        label: 'Block Preview',
        pathname: 'preview',
        icon: 'icon-settings',
      },
      conditions: [
        {
          alias: UMB_WORKSPACE_CONDITION_ALIAS,
          match: UMB_BLOCK_GRID_TYPE_WORKSPACE_ALIAS,
        }
      ],
    }

    const blockListWorkspaceView : ManifestWorkspaceView = {
      type: 'workspaceView',
      alias: 'umb.workspaceView.headlessPreviewList',
      name: 'Headless Preview',
      element: HeadlessWorkspaceViewElement,
      weight: 1100,
      meta: {
        label: 'Block Preview',
        pathname: 'preview',
        icon: 'icon-settings',
      },
      conditions: [
        {
          alias: UMB_WORKSPACE_CONDITION_ALIAS,
          match: UMB_BLOCK_LIST_TYPE_WORKSPACE_ALIAS,
        }
      ],
    }

    const togglePreviewAction: ManifestBlockAction<MetaBlockActionDefaultKind> = {
      type: 'blockAction',
      kind: 'default',
      alias: 'Kraftvaerk.Umbraco.Headless.BlockPreview.ToggleAction',
      name: 'Toggle Headless Preview',
      api: ToggleBlockPreviewAction,
      forContentTypeAlias: enabledBlocks.filter(x => x.enabled && x.alias).map(x => x.alias as string),
      meta: {
        icon: 'icon-plugin',
        label: 'Toggle Preview',
      },
    };

    extensionRegistry.register(blockPreview);
    extensionRegistry.register(togglePreviewAction);
    extensionRegistry.register(blockGridWorkspaceView);
    extensionRegistry.register(blockListWorkspaceView);
  });
};

async function fetchEnabledBlocks(base: string, token: string): Promise<HeadlessPreviewToggleModel[]> {

  tryInsertGlobalFonts();
  try {
    const client = new BlockPreviewClient({ BASE: base, TOKEN: token });

    const data = await client.kraftvaerkUmbracoHeadlessBlockpreviewApiV1.optionsApiV1KraftvaerkUmbracoHeadlessBlockpreview();

    console.debug('Headless BlockPreview: enabled blocks', data);
    return data;
  } catch (error) {
    console.error('Headless BlockPreview: could not load enabled blocks', error);
    return []
  }
}

/** Reads runtime settings (queue size etc.) from the backend. Older backends without the endpoint keep the defaults. */
async function applyClientSettings(base: string, token: string) {
  try {
    const client = new BlockPreviewClient({ BASE: base, TOKEN: token });
    const settings = await client.kraftvaerkUmbracoHeadlessBlockpreviewApiV1.getApiV1KraftvaerkUmbracoHeadlessBlockpreviewSettings();
    if (settings?.maxConcurrentPreviews) {
      HeadlessPreviewElement.queue.maxConcurrent = settings.maxConcurrentPreviews;
    }
    console.debug('Headless BlockPreview: settings', settings);
  } catch (error) {
    console.debug('Headless BlockPreview: settings endpoint unavailable, using defaults', error);
  }
}

async function tryInsertGlobalFonts() {
  const url = '/App_Plugins/global/global.css';

  try {
    const response = await fetch(url, { method: 'HEAD' });

    if (response.ok) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = url;
      document.head.appendChild(css);
    }
  } catch (error) {
    
  }
}


