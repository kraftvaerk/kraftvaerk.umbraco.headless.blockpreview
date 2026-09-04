using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Tests.Support;

/// <summary>
/// Just enough of Umbraco's content type services for <see cref="BlockHelper"/> to run without a database.
/// </summary>
public sealed class UmbracoFakes
{
    private readonly Dictionary<Guid, (string alias, (string alias, string editor)[] props)> _types = new();

    public Mock<IContentTypeService> ContentTypeService { get; } = new(MockBehavior.Strict);
    public Mock<IPublishedContentTypeFactory> PublishedContentTypeFactory { get; } = new(MockBehavior.Strict);
    public Mock<IApiElementBuilder> ApiElementBuilder { get; } = new();

    /// <summary>The last element handed to the api element builder.</summary>
    public IPublishedElement? LastBuiltElement { get; private set; }

    public UmbracoFakes()
    {
        ContentTypeService.Setup(x => x.Get(It.IsAny<Guid>())).Returns((Guid key) => _types.TryGetValue(key, out var t) ? ContentType(key, t.alias, t.props) : null);
        PublishedContentTypeFactory.Setup(x => x.CreateContentType(It.IsAny<IContentTypeComposition>()))
            .Returns((IContentTypeComposition ct) => PublishedContentType(ct));
        ApiElementBuilder.Setup(x => x.Build(It.IsAny<IPublishedElement>()))
            .Returns((IPublishedElement e) =>
            {
                LastBuiltElement = e;
                return new ApiElement(e.Key, e.ContentType.Alias, new Dictionary<string, object?>());
            });
    }

    public UmbracoFakes WithElementType(Guid key, string alias, params (string alias, string editor)[] properties)
    {
        _types[key] = (alias, properties);
        return this;
    }

    /// <summary>The sample site's element types, with the editors that matter for normalisation.</summary>
    public static UmbracoFakes SampleSite() => new UmbracoFakes()
        .WithElementType(TestData.TestBlockType, "testBlock",
            ("contentPicker", "Umbraco.MultiNodeTreePicker"),
            ("decimal", "Umbraco.Decimal"),
            ("numeric", "Umbraco.Integer"),
            ("slider", "Umbraco.Slider"),
            ("toggle", "Umbraco.TrueFalse"),
            ("textbox", "Umbraco.TextBox"),
            ("textarea", "Umbraco.TextArea"),
            ("tags", "Umbraco.Tags"),
            ("email", "Umbraco.EmailAddress"),
            ("multipleTextString", "Umbraco.MultipleTextstring"),
            ("blocklist", "Umbraco.BlockList"),
            ("checkboxlist", "Umbraco.CheckBoxList"),
            ("radioButtonList", "Umbraco.RadioButtonList"),
            ("dropdownMultiple", "Umbraco.DropDown.Flexible"),
            ("dropdown", "Umbraco.DropDown.Flexible"),
            ("multipleMediaPicker", "Umbraco.MediaPicker3"),
            ("mediaPicker", "Umbraco.MediaPicker3"),
            ("dateAndTimePicker", "Umbraco.DateTime"),
            ("datePicker", "Umbraco.DateTime"),
            ("userPicker", "Umbraco.UserPicker"),
            ("multiUrlPicker", "Umbraco.MultiUrlPicker"),
            ("eyeDropPicker", "Umbraco.ColorPicker.EyeDropper"),
            ("documentPicker", "Umbraco.ContentPicker"),
            ("colorPicker", "Umbraco.ColorPicker"),
            ("richTextEditor", "Umbraco.RichText"),
            ("markDownEditor", "Umbraco.MarkdownEditor"),
            ("codeEditor", "Umbraco.Plain.String"),
            ("blockGrid", "Umbraco.BlockGrid"))
        .WithElementType(TestData.NestedHellType, "nestedHell",
            ("dropDown", "Umbraco.DropDown.Flexible"),
            ("nested", "Umbraco.BlockList"))
        .WithElementType(TestData.RteBlockType, "rteBlock",
            ("richText", "Umbraco.RichText"));

    public BlockHelper CreateBlockHelper() =>
        new(ApiElementBuilder.Object, ContentTypeService.Object, PublishedContentTypeFactory.Object, NullLogger<BlockHelper>.Instance);

    private static IContentType ContentType(Guid key, string alias, (string alias, string editor)[] props)
    {
        var propertyTypes = props.Select(p =>
        {
            var pt = new Mock<IPropertyType>();
            pt.SetupGet(x => x.Alias).Returns(p.alias);
            pt.SetupGet(x => x.PropertyEditorAlias).Returns(p.editor);
            return pt.Object;
        }).ToList();

        var ct = new Mock<IContentType>();
        ct.SetupGet(x => x.Key).Returns(key);
        ct.SetupGet(x => x.Alias).Returns(alias);
        ct.SetupGet(x => x.PropertyTypes).Returns(propertyTypes);
        ct.SetupGet(x => x.IsElement).Returns(true);
        return ct.Object;
    }

    private static IPublishedContentType PublishedContentType(IContentTypeComposition ct)
    {
        var published = new Mock<IPublishedContentType>();
        published.SetupGet(x => x.Key).Returns(ct.Key);
        published.SetupGet(x => x.Alias).Returns(ct.Alias);
        published.SetupGet(x => x.IsElement).Returns(true);
        published.SetupGet(x => x.ItemType).Returns(PublishedItemType.Element);
        var propertyTypes = ct.PropertyTypes.Select(p =>
        {
            var ppt = new Mock<IPublishedPropertyType>();
            ppt.SetupGet(x => x.Alias).Returns(p.Alias);
            ppt.SetupGet(x => x.EditorAlias).Returns(p.PropertyEditorAlias);
            ppt.SetupGet(x => x.ContentType).Returns(published.Object);
            return ppt.Object;
        }).ToList();
        published.SetupGet(x => x.PropertyTypes).Returns(propertyTypes);
        published.Setup(x => x.GetPropertyType(It.IsAny<string>()))
            .Returns((string a) => propertyTypes.FirstOrDefault(p => p.Alias == a));
        return published.Object;
    }
}
