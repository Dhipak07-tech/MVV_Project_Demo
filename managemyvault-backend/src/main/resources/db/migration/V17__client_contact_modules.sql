-- V17__client_contact_modules.sql
-- Database schema changes for Contacts, Locations, and Legacy Site Summary

-- 1. Create legacy_site_summaries table
CREATE TABLE legacy_site_summaries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    content         TEXT,
    archived        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_legacy_site_summaries_org ON legacy_site_summaries(organization_id);

-- 2. Alter contacts table
ALTER TABLE contacts ADD COLUMN first_name VARCHAR(255);
ALTER TABLE contacts ADD COLUMN last_name VARCHAR(255);
ALTER TABLE contacts ADD COLUMN mobile VARCHAR(255);
ALTER TABLE contacts ADD COLUMN department VARCHAR(255);
ALTER TABLE contacts ADD COLUMN primary_contact BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN emergency_contact BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN authorization_contact BOOLEAN NOT NULL DEFAULT FALSE;

-- Set default values for first/last name based on existing name if any
UPDATE contacts SET 
    first_name = split_part(name, ' ', 1), 
    last_name = CASE WHEN position(' ' in name) > 0 THEN substring(name from position(' ' in name) + 1) ELSE '' END 
WHERE name IS NOT NULL AND first_name IS NULL;

-- 3. Alter locations table
ALTER TABLE locations ADD COLUMN state VARCHAR(255);
ALTER TABLE locations ADD COLUMN zip VARCHAR(50);
ALTER TABLE locations ADD COLUMN phone VARCHAR(255);
ALTER TABLE locations ADD COLUMN timezone VARCHAR(255);
ALTER TABLE locations ADD COLUMN primary_location BOOLEAN NOT NULL DEFAULT FALSE;
