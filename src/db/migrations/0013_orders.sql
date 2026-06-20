-- Phase 13: Orders + Transactions + iTrader + Trust System

-- Order Status Enum
CREATE TYPE order_status AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'REFUNDED');

-- Orders Table
CREATE TABLE marketplace_order (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  seller_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  listing_id TEXT NOT NULL REFERENCES marketplace_listing(id) ON DELETE RESTRICT,
  package_id TEXT REFERENCES listing_package(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE,
  status order_status NOT NULL DEFAULT 'PENDING',
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  requirements TEXT,
  is_urgent INTEGER NOT NULL DEFAULT 0,
  cancelled_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  cancel_reason TEXT,
  cancelled_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX order_buyer_id_idx ON marketplace_order(buyer_id);
CREATE INDEX order_seller_id_idx ON marketplace_order(seller_id);
CREATE INDEX order_listing_id_idx ON marketplace_order(listing_id);
CREATE INDEX order_status_idx ON marketplace_order(status);
CREATE INDEX order_number_idx ON marketplace_order(order_number);
CREATE INDEX order_created_idx ON marketplace_order(created_at);

-- Order Messages
CREATE TABLE order_message (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES marketplace_order(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  content_json JSONB NOT NULL,
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX order_message_order_id_idx ON order_message(order_id);
CREATE INDEX order_message_sender_id_idx ON order_message(sender_id);
CREATE INDEX order_message_created_idx ON order_message(created_at);

-- Order Deliveries
CREATE TABLE order_delivery (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES marketplace_order(id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  delivery_message TEXT,
  attachments JSONB DEFAULT '[]',
  revision_count INTEGER NOT NULL DEFAULT 0,
  is_last_delivery INTEGER NOT NULL DEFAULT 0,
  delivered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX order_delivery_order_id_idx ON order_delivery(order_id);
CREATE INDEX order_delivery_seller_id_idx ON order_delivery(seller_id);

-- Order Revisions
CREATE TABLE order_revision (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES marketplace_order(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX order_revision_order_id_idx ON order_revision(order_id);

-- Transaction Types & Status
CREATE TYPE transaction_type AS ENUM ('PAYMENT', 'REFUND', 'ADJUSTMENT');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- Transactions Table
CREATE TABLE marketplace_transaction (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES marketplace_order(id) ON DELETE CASCADE,
  buyer_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  seller_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  type transaction_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'PENDING',
  gateway_reference TEXT,
  gateway_response TEXT,
  metadata TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX transaction_order_id_idx ON marketplace_transaction(order_id);
CREATE INDEX transaction_buyer_id_idx ON marketplace_transaction(buyer_id);
CREATE INDEX transaction_seller_id_idx ON marketplace_transaction(seller_id);
CREATE INDEX transaction_type_idx ON marketplace_transaction(type);
CREATE INDEX transaction_status_idx ON marketplace_transaction(status);

-- iTrader Rating Type
CREATE TYPE itrader_rating AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- iTrader Feedback
CREATE TABLE itrader_feedback (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES marketplace_order(id) ON DELETE CASCADE,
  from_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  to_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  rating itrader_rating NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX itrader_order_id_idx ON itrader_feedback(order_id);
CREATE INDEX itrader_from_user_id_idx ON itrader_feedback(from_user_id);
CREATE INDEX itrader_to_user_id_idx ON itrader_feedback(to_user_id);
CREATE INDEX itrader_rating_idx ON itrader_feedback(rating);

-- Seller Trust Profile
CREATE TABLE seller_trust_profile (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  positive_feedback INTEGER NOT NULL DEFAULT 0,
  neutral_feedback INTEGER NOT NULL DEFAULT 0,
  negative_feedback INTEGER NOT NULL DEFAULT 0,
  completed_orders INTEGER NOT NULL DEFAULT 0,
  disputed_orders INTEGER NOT NULL DEFAULT 0,
  cancelled_orders INTEGER NOT NULL DEFAULT 0,
  total_revenue INTEGER NOT NULL DEFAULT 0,
  refund_rate INTEGER NOT NULL DEFAULT 0,
  response_time INTEGER NOT NULL DEFAULT 0,
  repeat_buyers INTEGER NOT NULL DEFAULT 0,
  trust_score INTEGER NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX seller_trust_profile_seller_id_idx ON seller_trust_profile(seller_id);
CREATE INDEX seller_trust_profile_trust_score_idx ON seller_trust_profile(trust_score);
CREATE INDEX seller_trust_profile_completed_orders_idx ON seller_trust_profile(completed_orders);

-- Dispute Status
CREATE TYPE dispute_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- Disputes
CREATE TABLE marketplace_dispute (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES marketplace_order(id) ON DELETE CASCADE,
  buyer_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  seller_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  moderator_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status dispute_status NOT NULL DEFAULT 'OPEN',
  resolution TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX dispute_order_id_idx ON marketplace_dispute(order_id);
CREATE INDEX dispute_buyer_id_idx ON marketplace_dispute(buyer_id);
CREATE INDEX dispute_seller_id_idx ON marketplace_dispute(seller_id);
CREATE INDEX dispute_status_idx ON marketplace_dispute(status);

-- Dispute Messages
CREATE TABLE dispute_message (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id TEXT NOT NULL REFERENCES marketplace_dispute(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  is_mod_note INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX dispute_message_dispute_id_idx ON dispute_message(dispute_id);
CREATE INDEX dispute_message_sender_id_idx ON dispute_message(sender_id);

-- Buyer Reviews (separate from moderator reviews)
CREATE TABLE buyer_review (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE REFERENCES marketplace_order(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES marketplace_listing(id) ON DELETE CASCADE,
  buyer_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  seller_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  rating INTEGER NOT NULL,
  content TEXT NOT NULL,
  review_images JSONB DEFAULT '[]',
  is_verified_purchase INTEGER NOT NULL DEFAULT 1,
  is_public INTEGER NOT NULL DEFAULT 1,
  is_recommended INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX buyer_review_order_id_idx ON buyer_review(order_id);
CREATE INDEX buyer_review_listing_id_idx ON buyer_review(listing_id);
CREATE INDEX buyer_review_buyer_id_idx ON buyer_review(buyer_id);
CREATE INDEX buyer_review_seller_id_idx ON buyer_review(seller_id);
CREATE INDEX buyer_review_rating_idx ON buyer_review(rating);
CREATE INDEX buyer_review_verified_idx ON buyer_review(is_verified_purchase);

-- Add ORDER_COMPLETED and ITRADER_FEEDBACK to reputation transaction type
ALTER TYPE reputation_transaction_type ADD VALUE IF NOT EXISTS 'ORDER_COMPLETED';
ALTER TYPE reputation_transaction_type ADD VALUE IF NOT EXISTS 'ITRADER_FEEDBACK';
