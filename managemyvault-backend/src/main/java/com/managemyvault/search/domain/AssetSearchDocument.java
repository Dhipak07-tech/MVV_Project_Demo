package com.managemyvault.search.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Document(indexName = "asset_index")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetSearchDocument {

    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String organizationId;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String name;

    @Field(type = FieldType.Keyword)
    private String assetType;

    @Field(type = FieldType.Keyword)
    private String hostname;

    @Field(type = FieldType.Keyword)
    private String ipAddress;

    @Field(type = FieldType.Keyword)
    private String serialNumber;

    @Field(type = FieldType.Keyword)
    private String vendor;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String notes;
}
