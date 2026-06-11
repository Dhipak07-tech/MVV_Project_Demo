-- V1__create_platform_tables.sql
-- ManageMyVault — Platform-Level Tables (No organization_id)
-- These tables exist outside tenant scope.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Platform roles enum
CREATE TYPE platform_role AS ENUM (
    'ULTRA_SUPER_ADMIN',
    'SUPER_ADMIN'
);

-- Organization roles enum
CREATE TYPE org_role AS ENUM (
    'ORG_ADMIN',
    'TECHNICIAN',
    'AUDITOR',
    'READ_ONLY'
);

-- Organization status enum
CREATE TYPE org_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'ARCHIVED',
    'PENDING'
);

-- Platform users (Ultra Super Admin, Super Admin only)
CREATE TABLE platform_users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    platform_role   platform_role NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    mfa_enabled     BOOLEAN NOT NULL DEFAULT false,
    mfa_secret      VARCHAR(255),
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    version         BIGINT NOT NULL DEFAULT 0
);

-- Index for email lookups
CREATE INDEX idx_platform_users_email ON platform_users(email);
CREATE INDEX idx_platform_users_role ON platform_users(platform_role);
