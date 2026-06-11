package com.managemyvault.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.net.URI;
import java.time.Instant;
import java.util.Map;

/**
 * RFC 7807 Problem Details response structure.
 * All error responses from the API conform to this format.
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProblemDetails {

    /**
     * A URI reference that identifies the problem type.
     */
    private URI type;

    /**
     * A short, human-readable summary of the problem type.
     */
    private String title;

    /**
     * The HTTP status code.
     */
    private int status;

    /**
     * A human-readable explanation specific to this occurrence.
     */
    private String detail;

    /**
     * A URI reference that identifies the specific occurrence.
     */
    private URI instance;

    /**
     * Timestamp of when the error occurred.
     */
    @Builder.Default
    private Instant timestamp = Instant.now();

    /**
     * Additional error details (e.g., field validation errors).
     */
    private Map<String, Object> extensions;
}
