using System.Globalization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;

/// <summary>
/// Turns the JSON the backoffice holds for a block into the source values Umbraco's property value converters expect.
/// Pure: no Umbraco services, no I/O. Editor aliases are looked up through delegates so it can be unit tested.
/// </summary>
/// <remarks>
/// The editor and the database disagree on a few shapes:
/// <list type="bullet">
///   <item>Multi node tree picker: the editor holds <c>[{ "type": "document", "unique": "guid" }]</c>, Umbraco stores <c>umb://document/guid,umb://...</c>.</item>
///   <item>Decimal: the editor may send an integer literal, the converter wants something with a fraction.</item>
///   <item>Arrays and objects: value converters receive the stored JSON string, not a parsed token.</item>
///   <item>Nested block values (block list / grid / RTE blocks) carry their own <c>values[]</c> entries that need the same treatment.</item>
/// </list>
/// </remarks>
public sealed class BlockValueNormalizer
{
    public const string MultiNodeTreePickerEditor = "Umbraco.MultiNodeTreePicker";
    public const string DecimalEditor = "Umbraco.Decimal";

    private readonly Func<Guid, string, string?> _editorAliasFor;

    /// <param name="editorAliasFor">Resolves (content type key, property alias) to the property editor alias, or null when unknown.</param>
    public BlockValueNormalizer(Func<Guid, string, string?> editorAliasFor)
    {
        _editorAliasFor = editorAliasFor;
    }

    /// <summary>
    /// Normalises a flat <c>{ alias: value }</c> block object.
    /// </summary>
    /// <param name="block">The block data as sent by the editor. Not mutated.</param>
    /// <param name="contentTypeKey">Content type of the block, used to resolve editor aliases.</param>
    /// <returns>
    /// <c>Json</c>: the normalised object with nested structures kept as JSON (used to patch Delivery API output).
    /// <c>SourceValues</c>: alias to source value (complex values as JSON strings), ready for the value converters.
    /// </returns>
    public (JObject Json, Dictionary<string, object?> SourceValues) Normalize(JObject block, Guid contentTypeKey)
    {
        var json = new JObject();
        var sourceValues = new Dictionary<string, object?>();

        foreach (var property in block.Properties())
        {
            var editorAlias = _editorAliasFor(contentTypeKey, property.Name);
            var token = NormalizeToken(property.Value, editorAlias);
            json[property.Name] = token;
            sourceValues[property.Name] = ToSourceValue(token);
        }

        return (json, sourceValues);
    }

    private JToken NormalizeToken(JToken token, string? editorAlias)
    {
        if (editorAlias == MultiNodeTreePickerEditor && TryConvertPickerItems(token, out var udis))
            return udis;

        if (editorAlias == DecimalEditor && TryEnsureFraction(token, out var withFraction))
            return withFraction;

        return token.Type switch
        {
            JTokenType.Object => NormalizeObject((JObject)token),
            JTokenType.Array => new JArray(((JArray)token).Select(item => item.Type == JTokenType.Object ? NormalizeObject((JObject)item) : item.DeepClone())),
            _ => token.DeepClone(),
        };
    }

    /// <summary>
    /// Walks into an object looking for block data (<c>contentData</c> / <c>settingsData</c> entries with <c>values[]</c>) and
    /// normalises the values found there. Everything else is copied as-is.
    /// </summary>
    private JObject NormalizeObject(JObject obj)
    {
        var result = new JObject();
        foreach (var property in obj.Properties())
        {
            result[property.Name] = property.Name is "contentData" or "settingsData" && property.Value is JArray entries
                ? new JArray(entries.Select(NormalizeBlockDataEntry))
                : property.Value.Type == JTokenType.Object
                    ? NormalizeObject((JObject)property.Value)
                    : property.Value.DeepClone();
        }
        return result;
    }

    private JToken NormalizeBlockDataEntry(JToken entry)
    {
        if (entry is not JObject entryObj)
            return entry.DeepClone();

        var result = new JObject();
        Guid.TryParse(entryObj["contentTypeKey"]?.Value<string>(), out var contentTypeKey);

        foreach (var property in entryObj.Properties())
        {
            result[property.Name] = property.Name == "values" && property.Value is JArray values
                ? new JArray(values.Select(v => NormalizeValueEntry(v, contentTypeKey)))
                : property.Value.DeepClone();
        }
        return result;
    }

    /// <summary>
    /// One <c>{ alias, culture, segment, editorAlias, value }</c> entry inside nested block data.
    /// </summary>
    private JToken NormalizeValueEntry(JToken entry, Guid contentTypeKey)
    {
        if (entry is not JObject entryObj)
            return entry.DeepClone();

        var alias = entryObj["alias"]?.Value<string>();
        var editorAlias = entryObj["editorAlias"]?.Type is JTokenType.String
            ? entryObj["editorAlias"]!.Value<string>()
            : alias != null && contentTypeKey != Guid.Empty ? _editorAliasFor(contentTypeKey, alias) : null;

        var result = (JObject)entryObj.DeepClone();
        var value = entryObj["value"];
        if (value == null)
            return result;

        var normalized = NormalizeToken(value, editorAlias);

        // Inside block data the converters read the entry through Umbraco's block deserialiser, which expects arrays
        // (dropdowns, tags, checkbox lists, media pickers) as the stored JSON string rather than a parsed array.
        result["value"] = normalized.Type == JTokenType.Array
            ? new JValue(normalized.ToString(Formatting.None))
            : normalized;

        return result;
    }

    private static bool TryConvertPickerItems(JToken token, out JToken udis)
    {
        udis = token;
        JArray? items = token switch
        {
            JArray array => array,
            JValue { Type: JTokenType.String } str when str.Value<string>()?.TrimStart().StartsWith('[') == true => TryParseArray(str.Value<string>()!),
            _ => null,
        };

        if (items == null || items.Any(i => i.Type != JTokenType.Object || i["unique"] == null))
            return false;

        udis = new JValue(string.Join(",", items.Select(item =>
        {
            var type = item["type"]?.Value<string>() ?? "document";
            var unique = item["unique"]!.Value<string>() ?? string.Empty;
            return Guid.TryParse(unique, out var guid) ? $"umb://{type}/{guid:N}" : $"umb://{type}/{unique}";
        })));
        return true;
    }

    private static JArray? TryParseArray(string json)
    {
        try { return JArray.Parse(json); } catch (JsonException) { return null; }
    }

    private static bool TryEnsureFraction(JToken token, out JToken result)
    {
        result = token;
        var text = token.Type switch
        {
            JTokenType.Integer or JTokenType.Float => token.ToString(Formatting.None),
            JTokenType.String => token.Value<string>(),
            _ => null,
        };

        if (string.IsNullOrWhiteSpace(text) || !decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out _))
            return false;

        result = new JValue(text.Contains('.') ? text : text + ".0");
        return true;
    }

    /// <summary>
    /// What the value converters get: scalars as CLR values, everything structured as its JSON text.
    /// </summary>
    private static object? ToSourceValue(JToken token) => token.Type switch
    {
        JTokenType.Null or JTokenType.Undefined => null,
        JTokenType.String => token.Value<string>(),
        JTokenType.Integer => token.Value<long>(),
        JTokenType.Float => token.Value<double>(),
        JTokenType.Boolean => token.Value<bool>(),
        JTokenType.Date => token.Value<DateTime>().ToString("o"),
        JTokenType.Object or JTokenType.Array => token.ToString(Formatting.None),
        _ => token.ToString(Formatting.None),
    };
}
