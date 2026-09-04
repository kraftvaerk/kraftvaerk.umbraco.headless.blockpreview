using System.Net;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Exceptions;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.RequestHelper;
using Microsoft.Extensions.Logging.Abstractions;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Xunit;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Tests;

public class RequestHelperTests
{
    private static BlockPreviewBackendModel Model() => new()
    {
        Content = new ApiElement(Guid.NewGuid(), "testBlock", new Dictionary<string, object?> { ["textbox"] = "hi" }),
        Key = Guid.NewGuid(),
        Culture = "da-DK",
    };

    private static HeadlessBlockPreviewOptions Options(int timeout = 30) => new()
    {
        Host = "http://frontend.local",
        Api = "/__blockpreview",
        ApiKey = "secret",
        TimeoutSeconds = timeout,
    };

    private static RequestHelper Create(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> handler) =>
        new(new FakeHttpClientFactory(handler), NullLogger<RequestHelper>.Instance);

    [Fact]
    public async Task Posts_camel_cased_json_with_api_key_header_and_returns_body()
    {
        HttpRequestMessage? captured = null;
        string? sentBody = null;
        var helper = Create(async (req, _) =>
        {
            captured = req;
            sentBody = await req.Content!.ReadAsStringAsync();
            return new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("<div>ok</div>") };
        });

        var html = await helper.Post(Model(), Options());

        Assert.Equal("<div>ok</div>", html);
        Assert.Equal("http://frontend.local/__blockpreview", captured!.RequestUri!.ToString());
        Assert.Equal("secret", captured.Headers.GetValues("kuhb-header").Single());
        Assert.Contains("\"content\":", sentBody);
        Assert.Contains("\"culture\":\"da-DK\"", sentBody);
        Assert.Contains("\"rawContent\":", sentBody);
    }

    [Fact]
    public async Task Frontend_error_status_is_a_502_with_the_body_excerpt()
    {
        var helper = Create((_, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.InternalServerError)
        {
            Content = new StringContent("Razor blew up"),
        }));

        var ex = await Assert.ThrowsAsync<BlockPreviewException>(() => helper.Post(Model(), Options()));

        Assert.Equal(502, ex.StatusCode);
        Assert.Contains("500", ex.Message);
        Assert.Contains("Razor blew up", ex.Message);
    }

    [Fact]
    public async Task Slow_frontend_is_a_504_after_the_configured_timeout()
    {
        var helper = Create(async (_, ct) =>
        {
            await Task.Delay(TimeSpan.FromSeconds(10), ct);
            return new HttpResponseMessage(HttpStatusCode.OK);
        });

        var ex = await Assert.ThrowsAsync<BlockPreviewException>(() => helper.Post(Model(), Options(timeout: 1)));

        Assert.Equal(504, ex.StatusCode);
        Assert.Contains("1 seconds", ex.Message);
    }

    [Fact]
    public async Task Caller_cancellation_is_not_reported_as_a_timeout()
    {
        using var cts = new CancellationTokenSource();
        var helper = Create(async (_, ct) =>
        {
            cts.Cancel();
            await Task.Delay(TimeSpan.FromSeconds(10), ct);
            return new HttpResponseMessage(HttpStatusCode.OK);
        });

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => helper.Post(Model(), Options(), cts.Token));
    }

    [Fact]
    public async Task Unreachable_frontend_is_a_502()
    {
        var helper = Create((_, _) => throw new HttpRequestException("No such host"));

        var ex = await Assert.ThrowsAsync<BlockPreviewException>(() => helper.Post(Model(), Options()));

        Assert.Equal(502, ex.StatusCode);
        Assert.Contains("No such host", ex.Message);
    }

    [Theory]
    [InlineData("", "/api")]
    [InlineData("localhost:3000", "/api")]
    [InlineData("ftp://x", "/api")]
    public async Task Host_and_api_must_form_an_absolute_http_url(string host, string api)
    {
        var helper = Create((_, _) => throw new InvalidOperationException("should not be called"));

        var ex = await Assert.ThrowsAsync<BlockPreviewException>(() => helper.Post(Model(), new HeadlessBlockPreviewOptions { Host = host, Api = api }));

        Assert.Equal(500, ex.StatusCode);
        Assert.Contains("UseMVC", ex.Message);
    }

    [Theory]
    [InlineData("#__preview", "<b>inner</b>")]
    [InlineData(".wrap", "<i>class</i>")]
    [InlineData("body", "<div id=\"__preview\"><b>inner</b></div><section class=\"wrap other\"><i>class</i></section>")]
    public void Selector_extracts_inner_html(string selector, string expected)
    {
        var html = "<html><body><div id=\"__preview\"><b>inner</b></div><section class=\"wrap other\"><i>class</i></section></body></html>";

        Assert.Equal(expected, Create((_, _) => throw new InvalidOperationException()).TrimByCssSelector(html, selector));
    }

    [Theory]
    [InlineData("#missing")]
    [InlineData(".missing")]
    [InlineData("div > span")]
    public void Unmatched_or_unsupported_selector_returns_null(string selector)
    {
        Assert.Null(Create((_, _) => throw new InvalidOperationException()).TrimByCssSelector("<div id=\"a\"></div>", selector));
    }

    private sealed class FakeHttpClientFactory : IHttpClientFactory
    {
        private readonly Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> _handler;
        public FakeHttpClientFactory(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> handler) => _handler = handler;
        public HttpClient CreateClient(string name) => new(new FakeHandler(_handler)) { Timeout = Timeout.InfiniteTimeSpan };

        private sealed class FakeHandler : HttpMessageHandler
        {
            private readonly Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> _handler;
            public FakeHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> handler) => _handler = handler;
            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) => _handler(request, cancellationToken);
        }
    }
}
