-- V4__seed_platform_admin.sql
-- ManageMyVault — Seed Ultra Super Admin
-- Password: Admin@123 (BCrypt hashed)
-- IMPORTANT: Change this password immediately in production.

INSERT INTO platform_users (id, email, password_hash, full_name, platform_role, is_active, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@managemyvault.com',
    '$2a$12$LJ3m4ys2Y6hVpGPvJZmKnOQIz9fPR5xVCxGz2yPZ0YwLQp7k.4G6C',
    'System Administrator',
    'ULTRA_SUPER_ADMIN',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;
