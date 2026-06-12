package com.managemyvault.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchConfiguration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

@Configuration
@EnableElasticsearchRepositories(basePackages = "com.managemyvault.organization.search")
public class ElasticsearchConfig extends ElasticsearchConfiguration {

    @Value("${spring.elasticsearch.uris:http://localhost:9200}")
    private String elasticsearchUri;

    @Override
    public ClientConfiguration clientConfiguration() {
        // Parse host/port from URI (e.g. http://localhost:9200 -> localhost:9200)
        String hostAndPort = elasticsearchUri.replace("http://", "").replace("https://", "");
        return ClientConfiguration.builder()
                .connectedTo(hostAndPort)
                .build();
    }
}
