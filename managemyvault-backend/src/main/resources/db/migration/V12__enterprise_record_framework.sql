-- V12__enterprise_record_framework.sql
-- Database migrations for Site Summary, After Hours, Onsite Info, Attachments, Activity, and Revisions

-- 0. Drop old legacy tables
DROP TABLE IF EXISTS site_summaries CASCADE;
DROP TABLE IF EXISTS after_hours_info CASCADE;
DROP TABLE IF EXISTS onsite_info CASCADE;
DROP TABLE IF EXISTS after_hours_information CASCADE;
DROP TABLE IF EXISTS onsite_information CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS activity_events CASCADE;
DROP TABLE IF EXISTS entity_revisions CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;

-- 1. Create site_summaries table
CREATE TABLE site_summaries (
    id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    title                      VARCHAR(255) NOT NULL,
    timezone                   VARCHAR(100),
    business_hours             VARCHAR(255),
    notes                      TEXT,
    primary_contact_id         UUID REFERENCES contacts(id) ON DELETE SET NULL,
    emergency_contact_id       UUID REFERENCES contacts(id) ON DELETE SET NULL,
    authorization_contact_id   UUID REFERENCES contacts(id) ON DELETE SET NULL,
    active                     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                 UUID,
    updated_by                 UUID,
    version                    BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_site_summaries_organization ON site_summaries(organization_id);

-- 2. Create after_hours_information table
CREATE TABLE after_hours_information (
    organization_id            UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    alarm_codes                TEXT,
    after_hours_procedure      TEXT,
    emergency_phone            VARCHAR(50),
    escalation_procedure       TEXT,
    security_vendor            VARCHAR(255),
    notes                      TEXT,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                 UUID,
    updated_by                 UUID,
    version                    BIGINT NOT NULL DEFAULT 0
);

-- 3. Create onsite_information table
CREATE TABLE onsite_information (
    organization_id            UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    parking_instructions       TEXT,
    building_access            TEXT,
    server_room_access         TEXT,
    wifi_information           TEXT,
    key_locations              TEXT,
    notes                      TEXT,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                 UUID,
    updated_by                 UUID,
    version                    BIGINT NOT NULL DEFAULT 0
);

-- 4. Create attachments table
CREATE TABLE attachments (
    id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    entity_type                VARCHAR(100) NOT NULL,
    entity_id                  UUID NOT NULL,
    file_name                  VARCHAR(255) NOT NULL,
    content_type               VARCHAR(255) NOT NULL,
    size                       BIGINT NOT NULL,
    object_key                 VARCHAR(512) NOT NULL,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                 UUID,
    updated_by                 UUID,
    version                    BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_attachments_organization ON attachments(organization_id);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);

-- 5. Create activity_events table
CREATE TABLE activity_events (
    id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    entity_type                VARCHAR(100) NOT NULL,
    entity_id                  UUID NOT NULL,
    action                     VARCHAR(50) NOT NULL,
    user_id                    UUID NOT NULL,
    timestamp                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activity_events_organization ON activity_events(organization_id);
CREATE INDEX idx_activity_events_entity ON activity_events(entity_type, entity_id);

-- 6. Create entity_revisions table
CREATE TABLE entity_revisions (
    id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type                VARCHAR(100) NOT NULL,
    entity_id                  UUID NOT NULL,
    before_state               TEXT,
    after_state                TEXT,
    changed_by                 UUID NOT NULL,
    changed_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version                    BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_entity_revisions_entity ON entity_revisions(entity_type, entity_id);

-- 7. Create relationships table
CREATE TABLE relationships (
    id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    source_type                VARCHAR(100) NOT NULL,
    source_id                  UUID NOT NULL,
    target_type                VARCHAR(100) NOT NULL,
    target_id                  UUID NOT NULL,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                 UUID,
    version                    BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_relationships_organization ON relationships(organization_id);
CREATE INDEX idx_relationships_source ON relationships(source_type, source_id);
CREATE INDEX idx_relationships_target ON relationships(target_type, target_id);
