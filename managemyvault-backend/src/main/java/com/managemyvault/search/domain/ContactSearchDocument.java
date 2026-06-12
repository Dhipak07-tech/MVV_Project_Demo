package com.managemyvault.search.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Document(indexName = "contact_index")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactSearchDocument {

    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String organizationId;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String firstName;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String lastName;

    @Field(type = FieldType.Keyword)
    private String email;

    @Field(type = FieldType.Keyword)
    private String phone;

    @Field(type = FieldType.Keyword)
    private String role;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String notes;
}
