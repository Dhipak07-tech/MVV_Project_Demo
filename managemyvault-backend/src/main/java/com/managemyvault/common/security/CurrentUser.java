package com.managemyvault.common.security;

import java.lang.annotation.*;

/**
 * Custom annotation to inject the current authenticated user
 * into controller method parameters.
 *
 * Usage: public ResponseEntity<?> endpoint(@CurrentUser UserPrincipal user)
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CurrentUser {
}
