-- ============================================
-- ALI NETWORK - COMPLETE DATABASE SCHEMA
-- ============================================
-- This file contains all database tables, functions, triggers, and initial data
-- Run this file once to set up the entire database
-- Template definitions now reside in application JSON configs; see src/lib/templates.

-- ============================================
-- EXTENSIONS & UTILITY FUNCTIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(150) NOT NULL,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    password_changed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS disabled for local PostgreSQL
-- Authentication is handled at the application layer
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ADMIN_SESSIONS TABLE
-- ============================================
CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    session_expires_at TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent TEXT,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_expires ON admin_sessions(session_token, session_expires_at DESC);

CREATE TRIGGER update_admin_sessions_updated_at
    BEFORE UPDATE ON admin_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS disabled for local PostgreSQL
-- Authentication is handled at the application layer
-- ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- View removed: unused in application

-- ============================================
-- LINKTREES TABLE
-- ============================================
CREATE TABLE linktrees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic information
    name VARCHAR(255) NOT NULL,
    subtitle TEXT, -- Subtitle/short description (new field)
    seo_name VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly slug
    uid VARCHAR(50) UNIQUE NOT NULL, -- Public unique identifier
    
    -- Visual customization
    image TEXT, -- Profile/image path (local: /images/upload/filename.jpg)
    background_color VARCHAR(50) DEFAULT '#ffffff', -- Background color (pure white default)
    template_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Dynamic template configuration
    
    -- Expiration
    expire_date TIMESTAMPTZ,
    
    -- Footer customization (new fields)
    footer_text TEXT, -- Footer text (e.g., "سپۆنسەر کراوە لەلایەن")
    footer_phone VARCHAR(20), -- Footer phone number (e.g., "9647504336180")
    footer_hidden BOOLEAN DEFAULT false, -- Hide footer entirely for this linktree
    
    -- Status (computed field, stored for convenience)
    status VARCHAR(20) DEFAULT 'Active', -- 'Active' or 'Expired' (computed from expire_date)
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT name_length CHECK (char_length(name) >= 3),
    CONSTRAINT seo_name_length CHECK (char_length(seo_name) >= 3),
    CONSTRAINT uid_length CHECK (char_length(uid) >= 3),
    CONSTRAINT uid_format CHECK (uid ~ '^[a-z0-9-]+$'), -- Only lowercase, numbers, and hyphens
    CONSTRAINT seo_name_format CHECK (seo_name ~ '^[a-z0-9-]+$'),
    CONSTRAINT status_check CHECK (status IN ('Active', 'Expired'))
);

-- Indexes for faster lookups
CREATE INDEX idx_linktrees_uid ON linktrees(uid);
CREATE INDEX idx_linktrees_seo_name ON linktrees(seo_name);
CREATE INDEX idx_linktrees_expire_date ON linktrees(expire_date);
CREATE INDEX IF NOT EXISTS idx_linktrees_status ON linktrees(status);
CREATE INDEX idx_linktrees_created_at ON linktrees(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_linktrees_template_config ON linktrees USING GIN (template_config);

-- ============================================
-- MIGRATION: Add new fields to existing linktrees table (if not already present)
-- ============================================
-- This section ensures backward compatibility with existing databases
-- It safely adds new columns if they don't exist

-- Add subtitle column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'linktrees' AND column_name = 'subtitle'
    ) THEN
        ALTER TABLE linktrees ADD COLUMN subtitle TEXT;
    END IF;
END $$;

-- Add footer_text column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'linktrees' AND column_name = 'footer_text'
    ) THEN
        ALTER TABLE linktrees ADD COLUMN footer_text TEXT;
    END IF;
END $$;

-- Add footer_phone column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'linktrees' AND column_name = 'footer_phone'
    ) THEN
        ALTER TABLE linktrees ADD COLUMN footer_phone VARCHAR(20);
    END IF;
END $$;

-- ============================================
-- MIGRATION: Dynamic Templates (New Method)
-- ============================================
-- Frontend sends template data → stored in linktrees.template_config
-- Database returns template data → consumers render directly
-- Each linktree owns its template metadata; legacy templates table is removed

-- Ensure template_config column exists and migrate legacy template data
DO $$
DECLARE
    has_template_key BOOLEAN := EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'linktrees' AND column_name = 'template_key'
    );
    has_template_style BOOLEAN := EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'linktrees' AND column_name = 'template_style'
    );
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'linktrees' AND column_name = 'template_config'
    ) THEN
        ALTER TABLE linktrees ADD COLUMN template_config JSONB DEFAULT '{}'::jsonb;
    END IF;

    UPDATE linktrees
    SET template_config = COALESCE(template_config, '{}'::jsonb);

    IF has_template_key THEN
        UPDATE linktrees
        SET template_config = jsonb_set(
            template_config,
            '{templateKey}',
            to_jsonb(COALESCE(NULLIF(template_key, ''), 'mobile-spotlight'))
        )
        WHERE (template_config ->> 'templateKey') IS NULL
           OR template_config ->> 'templateKey' = '';

        ALTER TABLE linktrees DROP CONSTRAINT IF EXISTS linktrees_template_key_fkey;
        ALTER TABLE linktrees DROP COLUMN template_key;
    END IF;

    IF has_template_style THEN
        UPDATE linktrees
        SET template_config = jsonb_set(
            template_config,
            '{templateKey}',
            to_jsonb(
                CASE COALESCE(template_style, '')
                    WHEN 'modern-glass' THEN 'mobile-spotlight'
                    WHEN 'panorama-split' THEN 'mobile-spotlight'
                    WHEN '' THEN 'mobile-spotlight'
                    ELSE template_style
                END
            )
        )
        WHERE (template_config ->> 'templateKey') IS NULL
           OR template_config ->> 'templateKey' = '';

        ALTER TABLE linktrees DROP COLUMN template_style;
    END IF;

    UPDATE linktrees
    SET template_config = jsonb_set(
        template_config,
        '{templateKey}',
            to_jsonb('mobile-spotlight'::text)
    )
    WHERE (template_config ->> 'templateKey') IS NULL
       OR template_config ->> 'templateKey' = '';

    ALTER TABLE linktrees ALTER COLUMN template_config SET DEFAULT '{}'::jsonb;
    ALTER TABLE linktrees ALTER COLUMN template_config SET NOT NULL;
    COMMENT ON COLUMN linktrees.template_config IS 'Stores dynamic template configuration/data sent from the application. Each linktree manages its own template settings.';
END $$;

-- Add status column and constraint (if not exists) - for backward compatibility
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'linktrees' AND column_name = 'status'
    ) THEN
        ALTER TABLE linktrees ADD COLUMN status VARCHAR(20) DEFAULT 'Active';
    END IF;
    -- Add constraint for status values (if not exists)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'status_check' AND table_name = 'linktrees'
    ) THEN
        ALTER TABLE linktrees ADD CONSTRAINT status_check CHECK (status IN ('Active', 'Expired'));
    END IF;
END $$;

-- Remove total_views and total_clicks columns if they exist (migration for existing databases)
-- These are duplicates - data is fetched directly from page_views and link_clicks tables
DO $$
BEGIN
    -- Drop total_views column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'linktrees' AND column_name = 'total_views'
    ) THEN
        ALTER TABLE linktrees DROP COLUMN total_views;
    END IF;
    
    -- Drop total_clicks column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'linktrees' AND column_name = 'total_clicks'
    ) THEN
        ALTER TABLE linktrees DROP COLUMN total_clicks;
    END IF;
END $$;

-- Update status for existing linktrees based on expire_date
UPDATE linktrees 
SET status = CASE 
    WHEN expire_date IS NULL THEN 'Active'
    WHEN expire_date > NOW() THEN 'Active'
    ELSE 'Expired'
END
WHERE status IS NULL OR (status = 'Active' AND expire_date IS NOT NULL AND expire_date <= NOW());

-- Update default linktree (ali) to ensure it always has correct settings and shows in admin
-- This ensures the root admin page always appears in grid and table views
UPDATE linktrees 
SET footer_text = COALESCE(footer_text, 'سپۆنسەر کراوە لەلایەن'),
    footer_phone = COALESCE(footer_phone, '9647504336180'),
    background_color = COALESCE(background_color, '#ffffff'),
    expire_date = '2100-01-01 00:00:00+00'::TIMESTAMPTZ, -- Always set expire_date to 2100 for root page
    status = 'Active', -- Always ensure status is Active
    template_config = COALESCE(
        CASE 
            WHEN template_config IS NULL OR template_config = '{}'::jsonb 
            THEN jsonb_build_object('templateKey', 'colorful-pills')
            ELSE template_config
        END,
        jsonb_build_object('templateKey', 'colorful-pills')
    )
WHERE uid = 'ali';

UPDATE linktrees
SET template_config = jsonb_set(
    template_config,
    '{templateKey}',
    to_jsonb('mobile-spotlight'::text)
    )
WHERE (template_config ->> 'templateKey') IS NULL
   OR template_config ->> 'templateKey' = '';

CREATE TRIGGER update_linktrees_updated_at 
    BEFORE UPDATE ON linktrees
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-EXPIRE LINKTREE TRIGGER
-- ============================================
-- Note: Expiration is now handled in application logic
-- The expire_date column is still used for filtering in queries

-- ============================================
-- ROW LEVEL SECURITY (RLS) - LINKTREES
-- ============================================
-- RLS disabled for local PostgreSQL
-- Access control is handled at the application layer
-- ALTER TABLE linktrees ENABLE ROW LEVEL SECURITY;

-- ============================================
-- LINKS TABLE
-- ============================================
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to linktree
    linktree_id UUID NOT NULL REFERENCES linktrees(id) ON DELETE CASCADE,
    
    -- Platform information
    platform VARCHAR(50) NOT NULL, -- whatsapp, telegram, instagram, etc.
    url TEXT NOT NULL, -- Full URL to the platform link
    
    -- Display information
    display_name VARCHAR(255), -- Custom button label/name (if not provided, uses platform name)
    description TEXT, -- Optional button description/tooltip
    default_message TEXT, -- Default message to send with messaging platforms (WhatsApp, Telegram, Viber)
    
    -- Display order
    display_order INTEGER NOT NULL DEFAULT 0, -- Order in which links appear
    
    -- Analytics (denormalized for performance)
    click_count INTEGER DEFAULT 0,
    
    -- Additional metadata (JSONB for flexible storage)
    -- Stores: original_input_value, country_code, custom_icon, custom_color, etc.
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT platform_not_empty CHECK (char_length(platform) > 0),
    CONSTRAINT url_not_empty CHECK (char_length(url) > 0),
    CONSTRAINT url_format CHECK (url ~ '^https?://|^tel:|^mailto:|^viber://'), -- Must start with http://, https://, tel:, mailto:, or viber://
    CONSTRAINT display_order_positive CHECK (display_order >= 0)
);

-- Indexes for faster lookups
CREATE INDEX idx_links_linktree_id ON links(linktree_id);
CREATE INDEX idx_links_platform ON links(platform);
-- Composite index for common queries (linktree_id + display_order for ordering)
CREATE INDEX idx_links_linktree_order ON links(linktree_id, display_order);
CREATE INDEX idx_links_created_at ON links(created_at DESC);

CREATE TRIGGER update_links_updated_at 
    BEFORE UPDATE ON links
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-REORDER DISPLAY ORDER TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION reorder_links_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Reorder links for the same linktree
    UPDATE links
    SET display_order = display_order - 1
    WHERE linktree_id = OLD.linktree_id 
        AND display_order > OLD.display_order;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reorder_links_on_delete
    AFTER DELETE ON links
    FOR EACH ROW
    EXECUTE FUNCTION reorder_links_after_delete();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - LINKS
-- ============================================
-- RLS disabled for local PostgreSQL
-- Access control is handled at the application layer
-- ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PAGE_VIEWS TABLE
-- ============================================
CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to linktree
    linktree_id UUID NOT NULL REFERENCES linktrees(id) ON DELETE CASCADE,
    
    -- Visitor information (for unique tracking)
    ip_address INET NOT NULL,
    
    -- Timestamp
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Session tracking (for deduplication)
    session_id VARCHAR(255),
    
    -- Constraints
    CONSTRAINT ip_address_not_null CHECK (ip_address IS NOT NULL)
);

-- Indexes for faster queries
-- Primary lookup: linktree_id + date
CREATE INDEX idx_page_views_linktree_date ON page_views(linktree_id, viewed_at DESC);
-- Session deduplication
CREATE INDEX idx_page_views_session_id ON page_views(session_id) WHERE session_id IS NOT NULL;
-- Unique views lookup
CREATE INDEX idx_page_views_linktree_session ON page_views(linktree_id, session_id) WHERE session_id IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY (RLS) - PAGE_VIEWS
-- ============================================
-- RLS disabled for local PostgreSQL
-- Access control is handled at the application layer
-- ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- ============================================
-- LINK_CLICKS TABLE
-- ============================================
CREATE TABLE link_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to link
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    
    -- Foreign key to linktree (denormalized for faster queries)
    linktree_id UUID NOT NULL REFERENCES linktrees(id) ON DELETE CASCADE,
    
    -- Visitor information (for unique tracking)
    ip_address INET NOT NULL,
    
    -- Timestamp
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Session tracking (for deduplication)
    session_id VARCHAR(255),
    
    -- Constraints
    CONSTRAINT ip_address_not_null CHECK (ip_address IS NOT NULL)
);

-- Indexes for faster queries
-- Primary lookup: linktree_id + date
CREATE INDEX idx_link_clicks_linktree_date ON link_clicks(linktree_id, clicked_at DESC);
-- Link-specific queries
CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
-- Session deduplication
CREATE INDEX idx_link_clicks_session_id ON link_clicks(session_id) WHERE session_id IS NOT NULL;
-- Unique clicks lookup
CREATE INDEX idx_link_clicks_linktree_session ON link_clicks(linktree_id, session_id) WHERE session_id IS NOT NULL;

-- View removed: unused typo view

-- ============================================
-- ROW LEVEL SECURITY (RLS) - LINK_CLICKS
-- ============================================
-- RLS disabled for local PostgreSQL
-- Access control is handled at the application layer
-- ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS - ADMINS
-- ============================================
-- Note: Removed unused functions: is_admin_locked, record_failed_login, record_successful_login
-- These are replaced by authenticate_and_create_session which handles everything in one call

-- Function to verify admin password
CREATE OR REPLACE FUNCTION verify_admin_password(
    p_username VARCHAR,
    p_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    stored_hash TEXT;
    is_valid BOOLEAN;
BEGIN
    -- Get stored password hash
    SELECT password_hash INTO stored_hash
    FROM admins
    WHERE username = p_username;
    
    -- If no user found, return false
    IF stored_hash IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verify password using crypt function
    -- crypt() compares the plain password with stored hash
    SELECT (crypt(p_password, stored_hash) = stored_hash) INTO is_valid;
    
    RETURN COALESCE(is_valid, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Optimized function: Authenticate and create session in single transaction
-- This reduces database round trips from 3 to 1, making login much faster
CREATE OR REPLACE FUNCTION authenticate_and_create_session(
    p_username VARCHAR,
    p_password TEXT,
    p_session_token TEXT,
    p_session_expires_at TIMESTAMPTZ,
    p_ip_address INET,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    admin_id UUID,
    username VARCHAR,
    name VARCHAR
) AS $$
DECLARE
    v_admin_id UUID;
    v_password_hash TEXT;
    v_admin_username VARCHAR;
    v_admin_name VARCHAR;
    v_password_valid BOOLEAN;
BEGIN
    -- Get admin data and password hash in single query
    SELECT 
        a.id,
        a.password_hash,
        a.username,
        a.name
    INTO 
        v_admin_id,
        v_password_hash,
        v_admin_username,
        v_admin_name
    FROM admins a
    WHERE a.username = p_username;
    
    -- If admin not found, return failure
    IF v_admin_id IS NULL OR v_password_hash IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR;
        RETURN;
    END IF;
    
    -- Verify password
    SELECT (crypt(p_password, v_password_hash) = v_password_hash) INTO v_password_valid;
    
    -- If password invalid, return failure
    IF NOT v_password_valid THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR;
        RETURN;
    END IF;
    
    -- Password valid - update admin record and create session in single transaction
    UPDATE admins
    SET 
        last_login_at = NOW(),
        last_login_ip = p_ip_address
    WHERE id = v_admin_id;
    
    -- Create session
    INSERT INTO admin_sessions (
        admin_id,
        session_token,
        session_expires_at,
        ip_address,
        user_agent,
        last_used_at
    ) VALUES (
        v_admin_id,
        p_session_token,
        p_session_expires_at,
        p_ip_address,
        p_user_agent,
        NOW()
    )
    ON CONFLICT (session_token) DO UPDATE SET
        session_expires_at = EXCLUDED.session_expires_at,
        last_used_at = NOW();
    
    -- Return success with admin data
    RETURN QUERY SELECT TRUE, v_admin_id, v_admin_username, v_admin_name;
END;
$$ LANGUAGE plpgsql;

-- Function to validate session (updated to use admin_sessions table)
CREATE OR REPLACE FUNCTION is_session_valid(session_tok TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    is_valid BOOLEAN;
BEGIN
    SELECT 
        CASE 
            WHEN session_token = session_tok 
                AND session_expires_at > NOW() 
            THEN TRUE
            ELSE FALSE
        END INTO is_valid
    FROM admin_sessions
    WHERE session_token = session_tok;
    
    RETURN COALESCE(is_valid, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to logout (updated to delete specific session from admin_sessions)
CREATE OR REPLACE FUNCTION logout_admin(session_tok TEXT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM admin_sessions
    WHERE session_token = session_tok;
END;
$$ LANGUAGE plpgsql;

-- Function removed: unused in application

-- Function to get admin by session token (updated to use admin_sessions)
CREATE OR REPLACE FUNCTION get_admin_by_session(session_tok TEXT)
RETURNS TABLE (
    admin_id UUID,
    username VARCHAR,
    name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.username,
        a.name
    FROM admins a
    INNER JOIN admin_sessions s ON a.id = s.admin_id
    WHERE s.session_token = session_tok
        AND s.session_expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Function removed: unused in application

-- Function to update admin password (invalidates all sessions for security)
CREATE OR REPLACE FUNCTION update_admin_password(
    p_admin_id UUID,
    p_new_password TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE admins
    SET 
        password_hash = crypt(p_new_password, gen_salt('bf', 10)),
        password_changed_at = NOW()
    WHERE id = p_admin_id;
    
    -- Invalidate all sessions when password is changed (security best practice)
    DELETE FROM admin_sessions
    WHERE admin_id = p_admin_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER FUNCTIONS - LINKTREES
-- ============================================
-- Note: Views and clicks are tracked via page_views and link_clicks tables directly

-- ============================================
-- HELPER FUNCTIONS - LINKS
-- ============================================
-- Note: Clicks are tracked via link_clicks table directly

-- Function to get next display order for a linktree
CREATE OR REPLACE FUNCTION get_next_display_order(p_linktree_id UUID)
RETURNS INTEGER AS $$
DECLARE
    max_order INTEGER;
BEGIN
    SELECT COALESCE(MAX(display_order), -1) + 1 INTO max_order
    FROM links
    WHERE linktree_id = p_linktree_id;
    
    RETURN max_order;
END;
$$ LANGUAGE plpgsql;

-- Function to reorder links (used by admin interface)
CREATE OR REPLACE FUNCTION reorder_links(
    p_linktree_id UUID,
    p_link_ids UUID[]
)
RETURNS VOID AS $$
DECLARE
    link_id UUID;
    new_order INTEGER := 0;
BEGIN
    -- Update display_order for each link in the provided order
    FOREACH link_id IN ARRAY p_link_ids
    LOOP
        UPDATE links
        SET display_order = new_order
        WHERE id = link_id AND linktree_id = p_linktree_id;
        
        new_order := new_order + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate link click counts from actual analytics data
-- Note: total_views and total_clicks removed from linktrees - use analytics functions instead
CREATE OR REPLACE FUNCTION recalculate_all_linktree_counts(p_linktree_id UUID)
RETURNS VOID AS $$
DECLARE
    v_link_id UUID;
    v_link_clicks INTEGER;
BEGIN
    -- Recalculate click_count for each link (only denormalized field still used)
    FOR v_link_id IN 
        SELECT id FROM links WHERE linktree_id = p_linktree_id
    LOOP
        SELECT COUNT(*)::INTEGER INTO v_link_clicks
        FROM link_clicks
        WHERE link_id = v_link_id;
        
        UPDATE links
        SET click_count = v_link_clicks
        WHERE id = v_link_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Templates table removed; dynamic configuration now stored on linktrees.template_config

-- Optimized function to get per-linktree analytics across the entire dataset
-- Returns unique counts for every linktree in a single query
CREATE OR REPLACE FUNCTION get_all_linktrees_analytics_optimized()
RETURNS TABLE (
    linktree_id UUID,
    unique_views BIGINT,
    unique_clicks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH view_stats AS (
        SELECT 
            pv.linktree_id,
            COUNT(DISTINCT pv.session_id)::BIGINT AS unique_views
        FROM page_views pv
        GROUP BY pv.linktree_id
    ),
    click_stats AS (
        SELECT 
            lc.linktree_id,
            COUNT(DISTINCT lc.session_id)::BIGINT AS unique_clicks
        FROM link_clicks lc
        GROUP BY lc.linktree_id
    )
    SELECT 
        lt.id AS linktree_id,
        COALESCE(vs.unique_views, 0)::BIGINT AS unique_views,
        COALESCE(cs.unique_clicks, 0)::BIGINT AS unique_clicks
    FROM linktrees lt
    LEFT JOIN view_stats vs ON lt.id = vs.linktree_id
    LEFT JOIN click_stats cs ON lt.id = cs.linktree_id;
END;
$$ LANGUAGE plpgsql;

-- Optimized function to get total analytics across all linktrees
-- Uses database aggregation for maximum performance
CREATE OR REPLACE FUNCTION get_total_analytics_optimized()
RETURNS TABLE (
    total_views BIGINT,
    unique_views BIGINT,
    total_clicks BIGINT,
    unique_clicks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH view_stats AS (
        SELECT 
            COUNT(*)::BIGINT as total_views,
            -- Unique views: Count DISTINCT IP addresses (same user visiting multiple times = 1 unique)
            -- Total views: Count ALL records (same user visiting multiple times = multiple totals)
            COUNT(DISTINCT ip_address)::BIGINT as unique_views
        FROM page_views
    ),
    click_stats AS (
        SELECT 
            COUNT(*)::BIGINT as total_clicks,
            -- Unique clicks: Count DISTINCT IP addresses (same user clicking multiple times = 1 unique)
            -- Total clicks: Count ALL records (same user clicking multiple times = multiple totals)
            COUNT(DISTINCT ip_address)::BIGINT as unique_clicks
        FROM link_clicks
    )
    SELECT 
        vs.total_views,
        vs.unique_views,
        cs.total_clicks,
        cs.unique_clicks
    FROM view_stats vs
    CROSS JOIN click_stats cs;
END;
$$ LANGUAGE plpgsql;

-- Optimized function to get analytics for a single linktree using database aggregation
CREATE OR REPLACE FUNCTION get_linktree_analytics_optimized(p_linktree_id UUID)
RETURNS TABLE (
    total_views BIGINT,
    unique_views BIGINT,
    total_clicks BIGINT,
    unique_clicks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH view_stats AS (
        SELECT 
            COUNT(*)::BIGINT as total_views,
            -- Unique views: Count DISTINCT IP addresses (same user visiting multiple times = 1 unique)
            -- Total views: Count ALL records (same user visiting multiple times = multiple totals)
            COUNT(DISTINCT ip_address)::BIGINT as unique_views
        FROM page_views
        WHERE linktree_id = p_linktree_id
    ),
    click_stats AS (
        SELECT 
            COUNT(*)::BIGINT as total_clicks,
            -- Unique clicks: Count DISTINCT IP addresses (same user clicking multiple times = 1 unique)
            -- Total clicks: Count ALL records (same user clicking multiple times = multiple totals)
            COUNT(DISTINCT ip_address)::BIGINT as unique_clicks
        FROM link_clicks
        WHERE linktree_id = p_linktree_id
    )
    SELECT 
        COALESCE(vs.total_views, 0)::BIGINT as total_views,
        COALESCE(vs.unique_views, 0)::BIGINT as unique_views,
        COALESCE(cs.total_clicks, 0)::BIGINT as total_clicks,
        COALESCE(cs.unique_clicks, 0)::BIGINT as unique_clicks
    FROM view_stats vs
    FULL OUTER JOIN click_stats cs ON true;
END;
$$ LANGUAGE plpgsql;

-- Simplified function - returns empty breakdowns since we only track unique views/clicks
CREATE OR REPLACE FUNCTION get_linktree_breakdowns_optimized(p_linktree_id UUID)
RETURNS TABLE (
    views_by_device JSONB,
    clicks_by_device JSONB,
    clicks_by_platform JSONB,
    views_by_referer JSONB,
    clicks_by_referer JSONB,
    views_by_os JSONB,
    clicks_by_os JSONB
) AS $$
BEGIN
    -- Return empty breakdowns - we only track unique views/clicks
    RETURN QUERY
    SELECT 
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANT EXECUTE PERMISSIONS FOR OPTIMIZED ANALYTICS FUNCTIONS
-- ============================================
-- Grants removed for local PostgreSQL
-- All functions are accessible to the database user (postgres)
-- Application layer handles access control

-- ============================================
-- INSERT DEFAULT ADMIN USER
-- ============================================
-- Username: ali
-- Password: ali.12345
-- Name: Ali Network

INSERT INTO admins (
    username,
    password_hash,
    name
) VALUES (
    'ali',
    crypt('ali.12345', gen_salt('bf', 10)),
    'Ali Network'
) ON CONFLICT (username) DO NOTHING;

-- ============================================
-- INSERT DEFAULT PAGE (Root Page)
-- ============================================
-- This creates the default Ali Network page at root (/)

INSERT INTO linktrees (
    name,
    subtitle,
    seo_name,
    uid,
    image,
    background_color,
    expire_date,
    footer_text,
    footer_phone,
    status,
    template_config
) VALUES (
    'Ali Network',
    'بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە',
    'ali',
    'ali',
    '/images/Logo.jpg',
    '#ffffff',
    '2100-01-01 00:00:00+00'::TIMESTAMPTZ, -- Expire date set to 2100
    'Ali Network',
    '9647504336180',
    'Active',
    jsonb_build_object('templateKey', 'colorful-pills')
) ON CONFLICT (uid) DO UPDATE SET
    name = EXCLUDED.name,
    subtitle = EXCLUDED.subtitle,
    image = EXCLUDED.image,
    footer_text = EXCLUDED.footer_text,
    footer_phone = EXCLUDED.footer_phone,
    status = EXCLUDED.status,
    background_color = EXCLUDED.background_color,
    expire_date = '2100-01-01 00:00:00+00'::TIMESTAMPTZ, -- Always set expire_date to 2100 for root page
    template_config = COALESCE(linktrees.template_config, '{}'::jsonb) || EXCLUDED.template_config;

-- Ensure root page (uid='ali') always has expire_date set to 2100 and status is Active
-- This ensures it always shows in admin grid and table views
UPDATE linktrees
SET expire_date = '2100-01-01 00:00:00+00'::TIMESTAMPTZ,
    status = 'Active'
WHERE uid = 'ali';

-- Get the linktree ID and insert links
DO $$
DECLARE
    v_linktree_id UUID;
    v_order INTEGER := 0;
BEGIN
    -- Get linktree ID
    SELECT id INTO v_linktree_id
    FROM linktrees
    WHERE uid = 'ali';
    
    IF v_linktree_id IS NULL THEN
        RAISE EXCEPTION 'Failed to create default linktree';
    END IF;
    
    -- Delete existing links for this linktree (in case of update)
    DELETE FROM links WHERE linktree_id = v_linktree_id;
    
    -- Insert WhatsApp link (phone number format: country code + number without + sign, with default message in URL)
    INSERT INTO links (linktree_id, platform, url, display_name, default_message, display_order, metadata)
    VALUES (v_linktree_id, 'whatsapp', 'https://wa.me/9647504336180?text=%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%DB%8C%DA%A9%D9%85%20%D8%A8%DB%95%D8%B1%DB%8E%D8%B2%20%D8%A8%DB%8E%20%D8%B2%DB%95%D8%AD%D9%85%DB%95%D8%AA%20%D9%86%D8%B1%D8%AE.', 'واتساپ', '', v_order, '{"original_input": "7504336180", "country_code": "964"}'::jsonb);
    v_order := v_order + 1;
    
    -- Insert Viber link (phone number format: country code + number without + sign)
    INSERT INTO links (linktree_id, platform, url, display_name, default_message, display_order, metadata)
    VALUES (v_linktree_id, 'viber', 'viber://chat?number=9647504336180', 'ڤایبەر', '', v_order, '{"original_input": "7504336180", "country_code": "964"}'::jsonb);
    v_order := v_order + 1;
    
    -- Insert Phone link (tel: format with + sign) - No default message for phone calls
    INSERT INTO links (linktree_id, platform, url, display_name, display_order, metadata)
    VALUES (v_linktree_id, 'phone', 'tel:+9647504336180', 'ژمارەی مۆبایل', v_order, '{"original_input": "7504336180", "country_code": "964"}'::jsonb);
    
    RAISE NOTICE 'Default page created successfully with ID: %', v_linktree_id;
END $$;

-- ============================================
-- IMAGE STORAGE (Local File System)
-- ============================================
-- Images are stored in the local file system at: public/images/upload/
-- Image paths in the database should reference: /images/upload/filename.jpg
-- The application handles file uploads and serves images from the public directory
-- No database storage tables needed for local PostgreSQL



