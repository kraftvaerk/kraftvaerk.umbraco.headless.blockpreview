//------------------------------------------------------------------------------
// <auto-generated>
//   This code was generated by a tool.
//
//    Umbraco.ModelsBuilder.Embedded v16.0.0+9812630
//
//   Changes to this file will be lost if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Linq.Expressions;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Infrastructure.ModelsBuilder;
using Umbraco.Cms.Core;
using Umbraco.Extensions;

namespace Umbraco.Cms.Web.Common.PublishedModels
{
	// Mixin Content Type with alias "headlessComposition"
	/// <summary>Headless Composition</summary>
	public partial interface IHeadlessComposition : IPublishedContent
	{
		/// <summary>Cache Page</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		bool CachePage { get; }

		/// <summary>Child Keys</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		bool ChildKeys { get; }

		/// <summary>No Slug</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		bool NoSlug { get; }
	}

	/// <summary>Headless Composition</summary>
	[PublishedModel("headlessComposition")]
	public partial class HeadlessComposition : PublishedContentModel, IHeadlessComposition
	{
		// helpers
#pragma warning disable 0109 // new is redundant
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		public new const string ModelTypeAlias = "headlessComposition";
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		public new const PublishedItemType ModelItemType = PublishedItemType.Content;
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		[return: global::System.Diagnostics.CodeAnalysis.MaybeNull]
		public new static IPublishedContentType GetModelContentType(IPublishedContentTypeCache contentTypeCache)
			=> PublishedModelUtility.GetModelContentType(contentTypeCache, ModelItemType, ModelTypeAlias);
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		[return: global::System.Diagnostics.CodeAnalysis.MaybeNull]
		public static IPublishedPropertyType GetModelPropertyType<TValue>(IPublishedContentTypeCache contentTypeCache, Expression<Func<HeadlessComposition, TValue>> selector)
			=> PublishedModelUtility.GetModelPropertyType(GetModelContentType(contentTypeCache), selector);
#pragma warning restore 0109

		private IPublishedValueFallback _publishedValueFallback;

		// ctor
		public HeadlessComposition(IPublishedContent content, IPublishedValueFallback publishedValueFallback)
			: base(content, publishedValueFallback)
		{
			_publishedValueFallback = publishedValueFallback;
		}

		// properties

		///<summary>
		/// Cache Page
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		[ImplementPropertyType("cachePage")]
		public virtual bool CachePage => GetCachePage(this, _publishedValueFallback);

		/// <summary>Static getter for Cache Page</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		public static bool GetCachePage(IHeadlessComposition that, IPublishedValueFallback publishedValueFallback) => that.Value<bool>(publishedValueFallback, "cachePage");

		///<summary>
		/// Child Keys
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		[ImplementPropertyType("childKeys")]
		public virtual bool ChildKeys => GetChildKeys(this, _publishedValueFallback);

		/// <summary>Static getter for Child Keys</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		public static bool GetChildKeys(IHeadlessComposition that, IPublishedValueFallback publishedValueFallback) => that.Value<bool>(publishedValueFallback, "childKeys");

		///<summary>
		/// No Slug
		///</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		[ImplementPropertyType("noSlug")]
		public virtual bool NoSlug => GetNoSlug(this, _publishedValueFallback);

		/// <summary>Static getter for No Slug</summary>
		[global::System.CodeDom.Compiler.GeneratedCodeAttribute("Umbraco.ModelsBuilder.Embedded", "16.0.0+9812630")]
		public static bool GetNoSlug(IHeadlessComposition that, IPublishedValueFallback publishedValueFallback) => that.Value<bool>(publishedValueFallback, "noSlug");
	}
}
