using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
[TableName(TableName)]
[PrimaryKey("Id", AutoIncrement = true)]
[ExplicitColumns]
public class HeadlessPreviewSettingsTable
{
    public const string TableName = "HeadlessPreviewSettings";

    [PrimaryKeyColumn(AutoIncrement = true)]
    [Column("Id")]
    public int Id { get; set; }

    [Column("BlockGuid")]
    [NullSetting(NullSetting = NullSettings.NotNull)]
    public Guid BlockGuid { get; set; }

    [Column("Enabled")]
    [Constraint(Default = "0")]
    public bool Enabled { get; set; }
}

