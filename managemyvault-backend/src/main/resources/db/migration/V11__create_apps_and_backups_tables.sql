-- V11__create_apps_and_backups_tables.sql
-- Create tables for Apps & Services and Backup Solutions modules

CREATE TABLE app_services (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL,
    provider        VARCHAR(255),
    license_key     VARCHAR(500),
    url             VARCHAR(500),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE backup_solutions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    name             VARCHAR(255) NOT NULL,
    type             VARCHAR(50) NOT NULL,
    destination      VARCHAR(255),
    frequency        VARCHAR(50),
    retention_policy VARCHAR(255),
    status           VARCHAR(50) NOT NULL DEFAULT 'Active',
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by       UUID,
    updated_by       UUID,
    version          BIGINT NOT NULL DEFAULT 0
);

-- Performance Indexes
CREATE INDEX idx_app_services_organization ON app_services(organization_id);
CREATE INDEX idx_app_services_type ON app_services(type);
CREATE INDEX idx_backup_solutions_organization ON backup_solutions(organization_id);
CREATE INDEX idx_backup_solutions_type ON backup_solutions(type);
