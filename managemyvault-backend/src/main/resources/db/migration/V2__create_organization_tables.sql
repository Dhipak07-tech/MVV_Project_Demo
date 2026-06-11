-- V2__create_organization_tables.sql
-- ManageMyVault — Organization Module Tables
-- ROOT bounded context. All future modules reference organizations(id).

CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    industry        VARCHAR(100),
    company_size    VARCHAR(50),
    website         VARCHAR(500),
    phone           VARCHAR(50),
    email           VARCHAR(255),
    logo_url        VARCHAR(1000),
    logo_storage_key VARCHAR(500),
    status          org_status NOT NULL DEFAULT 'ACTIVE',
    health_score    INTEGER CHECK (health_score BETWEEN 0 AND 100) DEFAULT 100,
    timezone        VARCHAR(100) NOT NULL DEFAULT 'UTC',
    country_code    VARCHAR(10),
    address_line1   VARCHAR(255),
    address_line2   VARCHAR(255),
    city            VARCHAR(100),
    state_province  VARCHAR(100),
    postal_code     VARCHAR(20),
    metadata        JSONB NOT NULL DEFAULT '{}',
    settings        JSONB NOT NULL DEFAULT '{}',
    is_deleted      BOOLEAN NOT NULL DEFAULT false,
    deleted_at      TIMESTAMPTZ,
    deleted_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID NOT NULL,
    updated_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

-- Organization members (users scoped to a specific org)
CREATE TABLE organization_members (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    avatar_url      VARCHAR(1000),
    org_role        org_role NOT NULL DEFAULT 'READ_ONLY',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    mfa_enabled     BOOLEAN NOT NULL DEFAULT false,
    mfa_secret      VARCHAR(255),
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID NOT NULL,
    version         BIGINT NOT NULL DEFAULT 0,
    UNIQUE (organization_id, email)
);

-- Performance indexes
CREATE INDEX idx_orgs_status ON organizations(status) WHERE is_deleted = false;
CREATE INDEX idx_orgs_slug ON organizations(slug);
CREATE INDEX idx_orgs_name ON organizations(name) WHERE is_deleted = false;
CREATE INDEX idx_orgs_industry ON organizations(industry) WHERE is_deleted = false;
CREATE INDEX idx_orgs_created ON organizations(created_at DESC);
CREATE INDEX idx_members_org ON organization_members(organization_id);
CREATE INDEX idx_members_email ON organization_members(email);
CREATE INDEX idx_members_org_role ON organization_members(organization_id, org_role);
