-- ============================================================================
-- POSTGRESQL OPTIMIZATION GUIDE & PERFORMANCE INDEXES
-- Targets: 1M+ Users, 10M+ Posts, 1M+ Listings, 10M+ Messages
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CRITICAL PERFORMANCE INDEXES
-- Prevent Sequential Scans on frequently joined and filtered columns.
-- ----------------------------------------------------------------------------

-- Users & Profiles
CREATE INDEX IF NOT EXISTS idx_users_username_trgm ON "user" USING gin (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON "user" (role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profile (user_id);

-- Forums & Threads
CREATE INDEX IF NOT EXISTS idx_forums_slug ON forum (slug);
CREATE INDEX IF NOT EXISTS idx_forums_category_id ON forum (category_id);
CREATE INDEX IF NOT EXISTS idx_threads_slug ON thread (slug);
CREATE INDEX IF NOT EXISTS idx_threads_forum_id_created ON thread (forum_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_author_id ON thread (author_id);
CREATE INDEX IF NOT EXISTS idx_threads_status_visibility ON thread (status, visibility);

-- Posts
-- Indexing thread_id + created_at composite for sequential page rendering (Post #1, Post #2, etc.)
CREATE INDEX IF NOT EXISTS idx_posts_thread_id_created ON post (thread_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON post (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON post (status);

-- Tags
CREATE INDEX IF NOT EXISTS idx_thread_tags_tag ON thread_tag (tag);
CREATE INDEX IF NOT EXISTS idx_thread_tags_thread_id ON thread_tag (thread_id);

-- Private Messaging (Conversations)
CREATE INDEX IF NOT EXISTS idx_conv_messages_conv_id_created ON conversation_message (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_participants_user_id ON conversation_participant (user_id);

-- Notifications
-- Indexing recipient_id and read status for fast badge and unread inbox counts
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON notification (recipient_id, read_status) WHERE read_status = 'UNREAD';
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON notification (recipient_id, created_at DESC);

-- Marketplace Listings & Orders
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON marketplace_listing (seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status_category ON marketplace_listing (status, category_id);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON marketplace_listing (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders (seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- Financial & Audits
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transaction (order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created ON audit_log (action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_log (user_id);


-- ----------------------------------------------------------------------------
-- 2. PARTITIONING STRATEGY FOR MASSIVE TABLES (10M+ rows)
-- Implement PostgreSQL Declarative Partitioning for posts, notifications, and logs.
-- This splits large logical tables into smaller physical chunks based on a key.
-- ----------------------------------------------------------------------------

-- A. POSTS PARTITIONING BY RANGE (by year/month of creation)
-- Example:
/*
CREATE TABLE post_partitioned (
    id text NOT NULL,
    thread_id text NOT NULL,
    author_id text NOT NULL,
    content jsonb NOT NULL,
    status text DEFAULT 'PUBLISHED'::text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    PRIMARY KEY (id, created_at) -- Partition key MUST be part of primary key
) PARTITION BY RANGE (created_at);

-- Generate partitions:
CREATE TABLE post_y2026m01 PARTITION OF post_partitioned FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE post_y2026m02 PARTITION OF post_partitioned FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
*/

-- B. CONVERSATION MESSAGES PARTITIONING BY RANGE
-- Partitioning by range (created_at) ensures that old chats are archived seamlessly and current active queries are hot cached.

-- C. AUDIT LOGS / AI LOGS PARTITIONING BY RANGE
-- Perfect candidate for historical rolling partitions. Older partitions (e.g., > 90 days) can be detached and zipped into cold storage (AWS S3 Glacier / Cloudflare R2 archive) to minimize disk cost.


-- ----------------------------------------------------------------------------
-- 3. QUERY OPTIMIZATION RULES FOR DRIZZLE ORM
-- ----------------------------------------------------------------------------
-- Rule 1: Prevent N+1 Queries
-- Avoid looping over a result set and executing database queries. Use Drizzle's `with` relationships
-- which query in batches under-the-hood, or write joins explicitly:
--   ❌ BAD: Users list -> iterate -> fetch profile for each user
--   ✅ GOOD: db.query.users.findMany({ with: { profile: true } })

-- Rule 2: Prevent Sequential Scans
-- Always include indexed columns in the WHERE clauses. Check queries with EXPLAIN ANALYZE.

-- Rule 3: Avoid Overfetching
-- Only select columns you need.
--   ✅ GOOD: db.select({ id: users.id, name: users.displayName }).from(users)...

-- Rule 4: Read Replication Setup
-- Route heavy analytics queries and read-only paginated feeds to getReadDatabase() in `replica-client.ts`.
-- Direct all mutations (insert, update, delete) to getWriteDatabase().
