-- V7__create_client_contact_tables.sql
-- Create client contact domain tables (contacts, locations, site_summaries, after_hours, onsite_info)

CREATE TABLE contacts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(255) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(255),
    notes           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE locations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    name            VARCHAR(255) NOT NULL,
    address         VARCHAR(255) NOT NULL,
    type            VARCHAR(255) NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE site_summaries (
    organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE after_hours_info (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    title           VARCHAR(255) NOT NULL,
    details         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE onsite_info (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    title           VARCHAR(255) NOT NULL,
    details         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

-- Performance Indexes
CREATE INDEX idx_contacts_organization ON contacts(organization_id);
CREATE INDEX idx_locations_organization ON locations(organization_id);
CREATE INDEX idx_after_hours_organization ON after_hours_info(organization_id);
CREATE INDEX idx_onsite_info_organization ON onsite_info(organization_id);
