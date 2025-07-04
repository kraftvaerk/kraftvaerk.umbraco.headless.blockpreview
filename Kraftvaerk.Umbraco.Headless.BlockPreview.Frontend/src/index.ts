import { ManifestBlockEditorCustomView } from '@umbraco-cms/backoffice/block-custom-view';
import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';

import { HeadlessPreviewElement } from './elements/headlessPreview.element.js';
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

    extensionRegistry.register(blockPreview);
    extensionRegistry.register(blockGridWorkspaceView);
    extensionRegistry.register(blockListWorkspaceView);
  });
};

async function fetchEnabledBlocks(base: string, token: string): Promise<HeadlessPreviewToggleModel[]> {

  tryInsertGlobalFonts();
  try {
    const client = new BlockPreviewClient({ BASE: base, TOKEN: token });

    const data = await client.kraftvaerkUmbracoHeadlessBlockpreviewApiV1.optionsApiV1KraftvaerkUmbracoHeadlessBlockpreview();

    console.log('Enabled block aliases:', data);
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    return []
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


