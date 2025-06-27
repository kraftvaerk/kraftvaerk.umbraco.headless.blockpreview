/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlockPreviewFrontendModel } from '../models/BlockPreviewFrontendModel';
import type { BlockPreviewResponse } from '../models/BlockPreviewResponse';
import type { HeadlessPreviewToggleModel } from '../models/HeadlessPreviewToggleModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class KraftvaerkUmbracoHeadlessBlockpreviewApiV1Service {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns any OK
     * @throws ApiError
     */
    public optionsApiV1KraftvaerkUmbracoHeadlessBlockpreview(): CancelablePromise<Array<HeadlessPreviewToggleModel>> {
        return this.httpRequest.request({
            method: 'OPTIONS',
            url: '/api/v1/Kraftvaerk.Umbraco.Headless.BlockPreview/',
            errors: {
                401: `The resource is protected and requires an authentication token`,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public postApiV1KraftvaerkUmbracoHeadlessBlockpreview({
        requestBody,
    }: {
        requestBody?: BlockPreviewFrontendModel,
    }): CancelablePromise<BlockPreviewResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/v1/Kraftvaerk.Umbraco.Headless.BlockPreview/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `The resource is protected and requires an authentication token`,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public getApiV1KraftvaerkUmbracoHeadlessBlockpreview({
        id,
    }: {
        id?: string,
    }): CancelablePromise<HeadlessPreviewToggleModel> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/Kraftvaerk.Umbraco.Headless.BlockPreview/',
            query: {
                'id': id,
            },
            errors: {
                401: `The resource is protected and requires an authentication token`,
            },
        });
    }
    /**
     * @returns string OK
     * @throws ApiError
     */
    public putApiV1KraftvaerkUmbracoHeadlessBlockpreview({
        requestBody,
    }: {
        requestBody?: HeadlessPreviewToggleModel,
    }): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/v1/Kraftvaerk.Umbraco.Headless.BlockPreview/',
            body: requestBody,
            mediaType: 'application/json',
            responseHeader: 'Umb-Notifications',
            errors: {
                401: `The resource is protected and requires an authentication token`,
            },
        });
    }
}
