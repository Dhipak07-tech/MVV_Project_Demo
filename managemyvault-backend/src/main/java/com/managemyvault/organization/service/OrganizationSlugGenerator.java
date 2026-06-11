package com.managemyvault.organization.service;

import com.managemyvault.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Generates URL-safe unique slugs for organizations.
 */
@Component
@RequiredArgsConstructor
public class OrganizationSlugGenerator {

    private final OrganizationRepository organizationRepository;

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    /**
     * Generate a unique slug from an organization name.
     * Handles duplicates by appending a numeric suffix.
     */
    public String generateUniqueSlug(String name) {
        String baseSlug = slugify(name);
        String slug = baseSlug;
        int counter = 1;

        while (organizationRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }

    /**
     * Convert a string to a URL-safe slug.
     */
    private String slugify(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String slug = WHITESPACE.matcher(normalized).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = slug.toLowerCase(Locale.ENGLISH);
        slug = slug.replaceAll("-{2,}", "-");
        slug = slug.replaceAll("^-|-$", "");

        // Ensure slug is not empty and not too long
        if (slug.isEmpty()) {
            slug = "org-" + System.currentTimeMillis();
        }
        if (slug.length() > 100) {
            slug = slug.substring(0, 100);
        }

        return slug;
    }
}
