-- V19__seed_demo_data.sql
-- ManageMyVault — Seed Data for Enterprise Command Center and Global Dashboard

-- 1. Organizations
INSERT INTO organizations (id, name, slug, description, industry, company_size, website, phone, email, status, health_score, timezone, created_by)
VALUES 
('b0000000-0000-0000-0000-000000000002', 'Initech Corporation', 'initech-corporation', 'A standard software consulting firm.', 'Technology', 'Medium', 'https://initech.example.com', '555-0199', 'info@initech.example.com', 'ACTIVE', 84, 'US/Central', 'a0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000003', 'Hooli Inc', 'hooli-inc', 'A multinational tech and search giant.', 'Telecommunications', 'Enterprise', 'https://hooli.example.com', '555-0200', 'contact@hooli.example.com', 'ACTIVE', 89, 'US/Pacific', 'a0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000004', 'Pied Piper', 'pied-piper', 'Next-generation peer-to-peer data compression.', 'Software', 'Small', 'https://piedpiper.example.com', '555-0300', 'compress@piedpiper.example.com', 'ACTIVE', 95, 'US/Pacific', 'a0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000005', 'Soylent Corporation', 'soylent-corp', 'High-nutrition food substitute manufacturers.', 'Manufacturing', 'Large', 'https://soylent.example.com', '555-0400', 'nutrition@soylent.example.com', 'SUSPENDED', 58, 'US/Eastern', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (slug) DO NOTHING;

-- 2. Organization Members
INSERT INTO organization_members (id, organization_id, email, password_hash, full_name, org_role, is_active, created_by)
VALUES 
('20000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'acme_admin@acme.com', '$2a$12$LJ3m4ys2Y6hVpGPvJZmKnOQIz9fPR5xVCxGz2yPZ0YwLQp7k.4G6C', 'Alice Cooper', 'ORG_ADMIN', true, 'a0000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'peter@initech.com', '$2a$12$LJ3m4ys2Y6hVpGPvJZmKnOQIz9fPR5xVCxGz2yPZ0YwLQp7k.4G6C', 'Peter Gibbons', 'ORG_ADMIN', true, 'a0000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'samir@initech.com', '$2a$12$LJ3m4ys2Y6hVpGPvJZmKnOQIz9fPR5xVCxGz2yPZ0YwLQp7k.4G6C', 'Samir Nagheenanajar', 'TECHNICIAN', true, 'a0000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'richard@hooli.com', '$2a$12$LJ3m4ys2Y6hVpGPvJZmKnOQIz9fPR5xVCxGz2yPZ0YwLQp7k.4G6C', 'Richard Hendricks', 'ORG_ADMIN', true, 'a0000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'jared@piedpiper.com', '$2a$12$LJ3m4ys2Y6hVpGPvJZmKnOQIz9fPR5xVCxGz2yPZ0YwLQp7k.4G6C', 'Jared Dunn', 'ORG_ADMIN', true, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (organization_id, email) DO NOTHING;

-- 3. Contacts
INSERT INTO contacts (id, organization_id, name, role, email, phone, is_active, created_by, first_name, last_name, primary_contact, emergency_contact, authorization_contact)
VALUES 
('30000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'Peter Gibbons', 'VP Product', 'peter@initech.com', '555-0201', true, 'a0000000-0000-0000-0000-000000000001', 'Peter', 'Gibbons', true, false, true),
('30000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'Milton Waddams', 'Clerk', 'milton@initech.com', '555-0202', true, 'a0000000-0000-0000-0000-000000000001', 'Milton', 'Waddams', false, true, false),
('30000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'Gavin Belson', 'CEO', 'gavin@hooli.com', '555-0301', true, 'a0000000-0000-0000-0000-000000000001', 'Gavin', 'Belson', true, false, true),
('30000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000004', 'Richard Hendricks', 'Founder', 'richard@piedpiper.com', '555-0401', true, 'a0000000-0000-0000-0000-000000000001', 'Richard', 'Hendricks', true, false, true),
('30000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004', 'Dinesh Chugtai', 'Lead Engineer', 'dinesh@piedpiper.com', '555-0402', true, 'a0000000-0000-0000-0000-000000000001', 'Dinesh', 'Chugtai', false, true, false);

-- 4. Locations (Sites)
INSERT INTO locations (id, organization_id, name, address, type, created_by, primary_location)
VALUES 
('40000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Initech Corporate Office', '4120 Freemont Ave, Austin, TX', 'Office', 'a0000000-0000-0000-0000-000000000001', true),
('40000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Hooli HQ Campus', '100 Hooli Way, Mountain View, CA', 'Headquarters', 'a0000000-0000-0000-0000-000000000001', true),
('40000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'Pied Piper Tech Incubator', '5230 Newell Rd, Palo Alto, CA', 'Workspace', 'a0000000-0000-0000-0000-000000000001', true),
('40000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'Pied Piper Main Server Room', '120 San Jose Blvd, San Jose, CA', 'Data Center', 'a0000000-0000-0000-0000-000000000001', false);

-- 5. Passwords
INSERT INTO passwords (id, organization_id, name, username, password_encrypted, iv, url, notes, strength, created_by, created_at, updated_at, updated_by)
VALUES 
-- Active/Secure
('50000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Main Domain Administrator', 'administrator', 'U2FsdGVkX195y1gXv7S3m/g0Bw==', 'iv1', 'https://domain.acme.com', 'Admin domain DC password', 'Strong', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 'a0000000-0000-0000-0000-000000000001'),
('50000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Active Directory Admin', 'admin_corp', 'U2FsdGVkX195y1gXv7S3m/g0Bw==', 'iv2', 'https://ad.initech.com', 'AD Admin password', 'Strong', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', 'a0000000-0000-0000-0000-000000000001'),
-- Weak
('50000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'Initech NAS login', 'admin', 'U2FsdGVkX193ZWFrUGFzc3dvcmQ=', 'iv3', 'https://nas.initech.com', 'NAS storage', 'Weak', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'a0000000-0000-0000-0000-000000000001'),
('50000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'Hooli Dev FTP', 'devftp', 'U2FsdGVkX193ZWFrUGFzc3dvcmQ=', 'iv4', 'ftp://ftp.hooli.com', 'Public test server', 'Weak', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'a0000000-0000-0000-0000-000000000001'),
-- Reused passwords (using identical password_encrypted field)
('50000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'Database Root Root', 'postgres', 'U2FsdGVkX19yZXVzZWRQYXNzMQ==', 'iv5', 'https://db.initech.com', 'Main DB Server', 'Medium', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', 'a0000000-0000-0000-0000-000000000001'),
('50000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'Database Staging Root', 'postgres', 'U2FsdGVkX19yZXVzZWRQYXNzMQ==', 'iv6', 'https://staging-db.initech.com', 'Staging server DB', 'Medium', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '31 days', NOW() - INTERVAL '31 days', 'a0000000-0000-0000-0000-000000000001'),
-- Expired (updated_at older than 90 days)
('50000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004', 'Pied Piper Root Router', 'admin', 'U2FsdGVkX19leHBpcmVkUGFzc3N3ZA==', 'iv7', 'https://router.piedpiper.com', 'Main office gateway router', 'Strong', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '100 days', NOW() - INTERVAL '100 days', 'a0000000-0000-0000-0000-000000000001');

-- 6. Documents
INSERT INTO documents (id, organization_id, title, content, category, updated_by, created_by, created_at, updated_at)
VALUES 
('60000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Network Topology and VPN Guide', 'This document maps the VPN connectivity for Acme Corporation.', 'Networking', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
('60000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Initech Employee Onboarding Manual', 'Standard onboarding procedures and system allocations.', 'Onboarding', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('60000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'Pied Piper Compression Protocol Architecture', 'Confidential architecture detailing the middle-out algorithm.', 'Architecture', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- 7. App Services (Vendors / Applications)
INSERT INTO app_services (id, organization_id, name, type, provider, license_key, url, notes, created_by)
VALUES 
('70000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Microsoft Office 365 Enterprise', 'vendors', 'Microsoft', 'O365-LIC-KEY-99201', 'https://admin.microsoft.com', 'Tenant global O365 licenses', 'a0000000-0000-0000-0000-000000000001'),
('70000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Salesforce CRM Professional', 'vendors', 'Salesforce Inc', 'SF-LIC-KEY-77812', 'https://login.salesforce.com', 'CRM seats for sales department', 'a0000000-0000-0000-0000-000000000001');

-- 8. Backup Solutions
INSERT INTO backup_solutions (id, organization_id, name, type, destination, frequency, retention_policy, status, notes, created_by)
VALUES 
('80000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Veeam Host Backup Job', 'VMware', 'Acme local NAS storage', 'Daily', '30 Days', 'Success', 'Veeam Backup & Replication agent', 'a0000000-0000-0000-0000-000000000001'),
-- Failed Backups
('80000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Initech SQL database AWS Backup', 'Database', 'AWS S3 Glacier', 'Hourly', '7 Years', 'Failed', 'AWS Backup Job failed due to IAM role policy restriction', 'a0000000-0000-0000-0000-000000000001'),
('80000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'Pied Piper Gitlab Backups', 'Code Repository', 'MinIO Bucket', 'Daily', '90 Days', 'Failed', 'MinIO cluster connection refused during backup write', 'a0000000-0000-0000-0000-000000000001');

-- 9. Trackers (SSL / Domains)
INSERT INTO trackers (id, organization_id, name, type, registrar_or_issuer, expiry_date, auto_renew, dns_or_strength, created_by)
VALUES 
('90000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'acme.com Domain Name', 'Domain', 'GoDaddy', CURRENT_DATE + INTERVAL '280 days', true, 'ns1.godaddy.com', 'a0000000-0000-0000-0000-000000000001'),
-- Expired Domain
('90000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'initech-staging.com', 'Domain', 'Namecheap', CURRENT_DATE - INTERVAL '15 days', false, 'ns1.namecheap.com', 'a0000000-0000-0000-0000-000000000001'),
-- Expired SSL Certificate
('90000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'hooli.xyz SSL Certificate', 'SSL', 'LetsEncrypt', CURRENT_DATE - INTERVAL '5 days', true, 'GlobalSSL Root CA', 'a0000000-0000-0000-0000-000000000001');

-- 10. Exception Entries
INSERT INTO exceptions (id, organization_id, title, type, status, justification, reviewer, due_date, priority, created_by)
VALUES 
('e1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Exemption from MFA on Legacy Linux Host', 'Security Control', 'Pending', 'Legacy build server does not support modern PAM-based MFA protocols.', 'System Administrator', CURRENT_DATE + INTERVAL '90 days', 'High', 'a0000000-0000-0000-0000-000000000001'),
('e1000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Weak password policy validation exception', 'Password Policy', 'Pending', 'Required for test domain controllers running ancient legacy apps.', 'System Administrator', CURRENT_DATE + INTERVAL '60 days', 'Medium', 'a0000000-0000-0000-0000-000000000001');

-- 11. Assets (Hardware Assets)
INSERT INTO assets (id, organization_id, name, type, ip_address, mac_address, serial_number, model, manufacturer, os_version, status, created_by)
VALUES 
('a1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Acme Primary DC', 'Server', '192.168.1.10', '00:1A:2B:3C:4D:5E', 'SN-ACME-991', 'PowerEdge R740', 'Dell', 'Windows Server 2022', 'Active', 'a0000000-0000-0000-0000-000000000001'),
('a1000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Initech Exchange Server', 'Server', '192.168.2.11', '00:1A:2B:3C:4D:6F', 'SN-INITECH-882', 'ProLiant DL360', 'HPE', 'Windows Server 2019', 'Active', 'a0000000-0000-0000-0000-000000000001'),
('a1000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'Richard Hendricks Workstation', 'Workstation', '10.0.1.20', '00:1A:2B:3C:4D:7A', 'SN-PIEDPIPER-772', 'Mac Studio M2 Ultra', 'Apple', 'macOS Sonoma', 'Active', 'a0000000-0000-0000-0000-000000000001');

-- 12. Networks (networks_mfa table)
INSERT INTO networks_mfa (id, organization_id, title, type, param1, param2, notes, created_by)
VALUES 
('c1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Acme Corporate VLAN', 'networks', '192.168.1.0/24', '192.168.1.1', 'Main employee VLAN', 'a0000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Initech Production Subnet', 'networks', '192.168.2.0/24', '192.168.2.1', 'Subnet containing active servers', 'a0000000-0000-0000-0000-000000000001');

-- 13. Activity Events
INSERT INTO activity_events (id, organization_id, entity_type, entity_id, action, user_id, timestamp, details)
VALUES 
('f1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'PASSWORD', '50000000-0000-0000-0000-000000000001', 'updated', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '5 minutes', 'Rotated password for Main Domain Administrator'),
('f1000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'DOCUMENT', '60000000-0000-0000-0000-000000000002', 'created', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 minutes', 'Created document: Initech Employee Onboarding Manual'),
('f1000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'ASSET', 'a1000000-0000-0000-0000-000000000003', 'created', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 hour', 'Registered hardware asset: Richard Hendricks Workstation'),
('f1000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'LOCATION', '40000000-0000-0000-0000-000000000002', 'updated', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 hours', 'Updated location address details for Initech Corporate Office');

-- 14. Attachments (for storage sizes check)
INSERT INTO attachments (id, organization_id, entity_type, entity_id, file_name, content_type, size, object_key, created_by, created_at)
VALUES 
('f2000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'DOCUMENT', '60000000-0000-0000-0000-000000000001', 'topology_diagram.png', 'image/png', 2048512, 'attachments/topology_diagram.png', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '12 days'),
('f2000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'DOCUMENT', '60000000-0000-0000-0000-000000000002', 'onboarding_checklists.pdf', 'application/pdf', 10452332, 'attachments/onboarding_checklists.pdf', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '5 days');
