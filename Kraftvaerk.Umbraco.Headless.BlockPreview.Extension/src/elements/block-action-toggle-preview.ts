import { UmbBlockActionBase } from '@umbraco-cms/backoffice/block';
import type { MetaBlockActionDefaultKind } from '@umbraco-cms/backoffice/block';
import { HeadlessPreviewElement } from './headlessPreview.element.js';

export const TOGGLE_PREVIEW_EVENT = 'kraftvaerk:toggle-preview';

export class ToggleBlockPreviewAction extends UmbBlockActionBase<MetaBlockActionDefaultKind> {
    override async execute(): Promise<void> {
        HeadlessPreviewElement.useBeamFallback = !HeadlessPreviewElement.useBeamFallback;
        window.dispatchEvent(new CustomEvent(TOGGLE_PREVIEW_EVENT));
    }
}
