-- V13__search_analytics_logs.sql
-- Create search logs table for global search analytics

CREATE TABLE search_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    query           TEXT NOT NULL,
    result_count    INT NOT NULL DEFAULT 0,
    executed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_search_logs_organization ON search_logs(organization_id);
CREATE INDEX idx_search_logs_executed_at ON search_logs(executed_at);
