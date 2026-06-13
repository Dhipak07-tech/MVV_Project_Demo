-- V18__complete_site_summary_module.sql
-- ManageMyVault — Complete Site Summary Module database changes

-- Drop existing site_summaries table and recreate with new columns
DROP TABLE IF EXISTS site_summaries CASCADE;

CREATE TABLE site_summaries (
    id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    title                      VARCHAR(255) NOT NULL,
    timezone                   VARCHAR(100),
    hours_of_operation         VARCHAR(255),
    notes                      TEXT,
    primary_contact_id         UUID REFERENCES contacts(id) ON DELETE SET NULL,
    emergency_contact_1_id     UUID REFERENCES contacts(id) ON DELETE SET NULL,
    emergency_contact_2_id     UUID REFERENCES contacts(id) ON DELETE SET NULL,
    authorization_contact_id   UUID REFERENCES contacts(id) ON DELETE SET NULL,
    is_archived                BOOLEAN NOT NULL DEFAULT FALSE,
    archived_at                TIMESTAMPTZ,
    archived_by                UUID,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                 UUID,
    updated_by                 UUID,
    version                    BIGINT NOT NULL DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_site_summaries_organization_id ON site_summaries(organization_id);
CREATE INDEX idx_site_summaries_title ON site_summaries(title);
CREATE INDEX idx_site_summaries_is_archived ON site_summaries(is_archived);

-- Create site_summary_revisions table
CREATE TABLE site_summary_revisions (
    id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_summary_id            UUID NOT NULL REFERENCES site_summaries(id) ON DELETE CASCADE,
    before_state               TEXT,
    after_state                TEXT,
    changed_by                 UUID,
    changed_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version                    BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_site_summary_revisions_site_summary_id ON site_summary_revisions(site_summary_id);
