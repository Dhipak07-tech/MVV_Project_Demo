package com.managemyvault.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler.
 * Converts all exceptions into RFC 7807 ProblemDetails responses.
 * CONSTRAINT-010: Never returns raw exceptions.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetails> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        ProblemDetails problem = ProblemDetails.builder()
                .type(URI.create("https://managemyvault.com/errors/not-found"))
                .title("Resource Not Found")
                .status(HttpStatus.NOT_FOUND.value())
                .detail(ex.getMessage())
                .instance(URI.create(request.getRequestURI()))
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    @ExceptionHandler(TenantViolationException.class)
    public ResponseEntity<ProblemDetails> handleTenantViolation(
            TenantViolationException ex, HttpServletRequest request) {
        log.error("SECURITY: Tenant isolation violation detected - {}", ex.getMessage());
        ProblemDetails problem = ProblemDetails.builder()
                .type(URI.create("https://managemyvault.com/errors/forbidden"))
                .title("Access Denied")
                .status(HttpStatus.FORBIDDEN.value())
                .detail("You do not have permission to access this resource")
                .instance(URI.create(request.getRequestURI()))
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(problem);
    }

    @ExceptionHandler(TenantContextNotSetException.class)
    public ResponseEntity<ProblemDetails> handleTenantContextNotSet(
            TenantContextNotSetException ex, HttpServletRequest request) {
        log.warn("Tenant context not set: {}", ex.getMessage());
        ProblemDetails problem = ProblemDetails.builder()
                .type(URI.create("https://managemyvault.com/errors/unauthorized"))
                .title("Authentication Required")
                .status(HttpStatus.UNAUTHORIZED.value())
                .detail("A valid authentication context is required for this request")
                .instance(URI.create(request.getRequestURI()))
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetails> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Access denied: {}", ex.getMessage());
        ProblemDetails problem = ProblemDetails.builder()
                .type(URI.create("https://managemyvault.com/errors/forbidden"))
                .title("Forbidden")
                .status(HttpStatus.FORBIDDEN.value())
                .detail(ex.getMessage())
                .instance(URI.create(request.getRequestURI()))
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(problem);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ProblemDetails> handleSpringAccessDenied(
            org.springframework.security.access.AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Spring Security access denied: {}", ex.getMessage());
        ProblemDetails problem = ProblemDetails.builder()
                .type(URI.create("https://managemyvault.com/errors/forbidden"))
                .title("Forbidden")
                .status(HttpStatus.FORBIDDEN.value())
                .detail("You do not have permission to perform this action")
                .instance(URI.create(request.getRequestURI()))
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(problem);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ProblemDetails> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {
        log.warn("Bad credentials attempt from: {}", request.getRemoteAddr());
        ProblemDetails problem = ProblemDetails.builder()
                .type(URI.create("https://managemyvault.com/errors/unauthorized"))
                .title("Authentication Failed")
                .status(HttpStatus.UNAUTHORIZED.value())
                .detail("Invalid email or password")
                .instance(URI.create(request.getRequestURI()))
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetails> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, Object> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }
        ProblemDetails problem = ProblemDetails.builder()
                .type(URI.create("https://managemyvault.com/errors/validation"))
                .title("Validation Failed")
                .status(HttpStatus.BAD_REQUEST.value())
                .detail("One or more fields failed validation")
                .instance(URI.create(request.getRequestURI()))
                .extensions(fieldErrors)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemDetails> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, Object> violations = new HashMap<>();
        ex.getConstraintViolations().forEach(v ->
                violations.put(v.getPropertyPath().toString(), v.getMessage())
        );
        ProblemDetails problem = ProblemDetails.builder()
                .type(URI.create("https://managemyvault.com/errors/validation"))
                .title("Constraint Violation")
                .status(HttpStatus.BAD_REQUEST.value())
                .detail("One or more constraints were violated")
                .instance(URI.create(request.getRequestURI()))
                .extensions(violations)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ProblemDetails> handleMaxUploadSize(
            MaxUploadSizeExceededException ex, HttpServletRequest request) {
        ProblemDetails problem = ProblemDetails.builder()
                .type(URI.create("https://managemyvault.com/errors/payload-too-large"))
                .title("File Too Large")
                .status(HttpStatus.PAYLOAD_TOO_LARGE.value())
                .detail("The uploaded file exceeds the maximum allowed size of 10MB")
                .instance(URI.create(request.getRequestURI()))
                .build();
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(problem);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetails> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        log.warn("Illegal argument: {}", ex.getMessage());
        ProblemDetails problem = ProblemDetails.builder()
                .type(URI.create("https://managemyvault.com/errors/bad-request"))
                .title("Bad Request")
                .status(HttpStatus.BAD_REQUEST.value())
                .detail(ex.getMessage())
                .instance(URI.create(request.getRequestURI()))
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetails> handleGeneral(
            Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        ProblemDetails problem = ProblemDetails.builder()
                .type(URI.create("https://managemyvault.com/errors/internal"))
                .title("Internal Server Error")
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .detail("An unexpected error occurred. Please try again later.")
                .instance(URI.create(request.getRequestURI()))
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }
}
