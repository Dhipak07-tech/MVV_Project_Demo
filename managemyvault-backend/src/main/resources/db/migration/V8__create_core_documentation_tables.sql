-- V8__create_core_documentation_tables.sql
-- Create core documentation domain tables (passwords, documents, exceptions, trackers, networks_mfa)

CREATE TABLE passwords (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    name               VARCHAR(255) NOT NULL,
    username           VARCHAR(255) NOT NULL,
    password_encrypted VARCHAR(1000) NOT NULL,
    iv                 VARCHAR(255),
    url                VARCHAR(255),
    otp_secret         VARCHAR(255),
    notes              TEXT,
    strength           VARCHAR(50),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by         UUID,
    version            BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    title           VARCHAR(255) NOT NULL,
    content         TEXT,
    category        VARCHAR(255) NOT NULL,
    updated_by      VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE exceptions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    title           VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL,
    status          VARCHAR(50) NOT NULL,
    justification   TEXT,
    reviewer        VARCHAR(255),
    due_date        DATE,
    priority        VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE trackers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    name                VARCHAR(255) NOT NULL,
    type                VARCHAR(50) NOT NULL,
    registrar_or_issuer VARCHAR(255),
    expiry_date         DATE,
    auto_renew          BOOLEAN NOT NULL DEFAULT true,
    dns_or_strength     VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE networks_mfa (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    title           VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL,
    param1          VARCHAR(255),
    param2          VARCHAR(255),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

-- Performance Indexes
CREATE INDEX idx_passwords_organization ON passwords(organization_id);
CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_exceptions_organization ON exceptions(organization_id);
CREATE INDEX idx_trackers_organization ON trackers(organization_id);
CREATE INDEX idx_networks_mfa_organization ON networks_mfa(organization_id);
