-- V9__create_assets_and_networking_tables.sql
-- Create hardware assets and networking assets tables

CREATE TABLE assets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL,
    ip_address      VARCHAR(255),
    mac_address     VARCHAR(255),
    serial_number   VARCHAR(255),
    model           VARCHAR(255),
    manufacturer    VARCHAR(255),
    os_version      VARCHAR(255),
    status          VARCHAR(50) NOT NULL DEFAULT 'Active',
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE networking_assets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL,
    subnet_cidr     VARCHAR(255),
    gateway         VARCHAR(255),
    vlan_id         VARCHAR(50),
    details         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

-- Performance Indexes
CREATE INDEX idx_assets_organization ON assets(organization_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_networking_assets_organization ON networking_assets(organization_id);
CREATE INDEX idx_networking_assets_type ON networking_assets(type);
