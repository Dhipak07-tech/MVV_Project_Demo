package com.managemyvault.search.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Document(indexName = "document_index")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentSearchDocument {

    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String organizationId;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String title;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String content;

    @Field(type = FieldType.Keyword)
    private String tags;

    @Field(type = FieldType.Keyword)
    private String category;
}
