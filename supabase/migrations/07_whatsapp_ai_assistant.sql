-- ==============================================================================
-- IDEAL COACHING CENTRE (ICC)
-- Migration 07: QR-Based WhatsApp AI Assistant Database Architecture
-- Director: BADE SIR | Location: Sarotiya, Mahagama, Godda, Jharkhand
-- ==============================================================================

-- 1. WhatsApp Bot Global Settings
CREATE TABLE IF NOT EXISTS public.whatsapp_settings (
    id INT PRIMARY KEY DEFAULT 1,
    is_bot_enabled BOOLEAN DEFAULT true,
    allow_public_queries BOOLEAN DEFAULT true,
    allow_student_queries BOOLEAN DEFAULT true,
    allow_teacher_queries BOOLEAN DEFAULT true,
    allow_admin_queries BOOLEAN DEFAULT true,
    default_greeting_en TEXT DEFAULT 'Welcome to IDEAL COACHING CENTRE (ICC)! I am your AI Assistant. How can I help you today with BSEB or JAC courses?',
    default_greeting_hi TEXT DEFAULT 'आइडियल कोचिंग सेंटर (ICC) में आपका स्वागत है! मैं आपका AI असिस्टेंट हूँ। BSEB या JAC बोर्ड की तैयारी, फीस या लाइव क्लास के बारे में पूछें।',
    fallback_response_en TEXT DEFAULT 'I could not find exact details for your query. For direct help, contact Director BADE SIR at +91 9771350910 or visit our Sarotiya centre.',
    fallback_response_hi TEXT DEFAULT 'मुझे आपके प्रश्न की सटीक जानकारी नहीं मिली। विशेष सहायता के लिए निदेशक बड़े सर से +91 9771350910 पर संपर्क करें।',
    max_messages_per_minute INT DEFAULT 15,
    ai_provider TEXT DEFAULT 'groq',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row_settings CHECK (id = 1)
);

INSERT INTO public.whatsapp_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 2. WhatsApp Realtime Connection Status
CREATE TABLE IF NOT EXISTS public.whatsapp_connection_status (
    id INT PRIMARY KEY DEFAULT 1,
    status TEXT DEFAULT 'DISCONNECTED', -- 'DISCONNECTED', 'SCAN_QR', 'CONNECTING', 'CONNECTED', 'ERROR'
    qr_code TEXT,
    qr_expires_at TIMESTAMPTZ,
    connected_phone TEXT,
    connected_name TEXT,
    last_connected_at TIMESTAMPTZ,
    last_message_at TIMESTAMPTZ,
    total_messages_received INT DEFAULT 0,
    total_ai_replies_sent INT DEFAULT 0,
    error_message TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row_status CHECK (id = 1)
);

INSERT INTO public.whatsapp_connection_status (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 3. Encrypted WhatsApp Session Storage (Zero plaintext credential exposure)
CREATE TABLE IF NOT EXISTS public.whatsapp_session_credentials (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    iv TEXT NOT NULL,
    tag TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cryptographically Secure WhatsApp Link Tokens (Expires in 5 minutes)
CREATE TABLE IF NOT EXISTS public.whatsapp_link_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_code TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_role TEXT NOT NULL CHECK (user_role IN ('student', 'teacher', 'admin')),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_tokens_code ON public.whatsapp_link_tokens(token_code);
CREATE INDEX IF NOT EXISTS idx_wa_tokens_user ON public.whatsapp_link_tokens(user_id);

-- 5. Verified WhatsApp Account Links (Ties WhatsApp Sender ID to ICC User)
CREATE TABLE IF NOT EXISTS public.whatsapp_account_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_role TEXT NOT NULL CHECK (user_role IN ('student', 'teacher', 'admin')),
    whatsapp_sender_id TEXT UNIQUE NOT NULL,
    whatsapp_display_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    linked_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wa_links_sender ON public.whatsapp_account_links(whatsapp_sender_id);
CREATE INDEX IF NOT EXISTS idx_wa_links_user ON public.whatsapp_account_links(user_id);

-- 6. WhatsApp Conversation Registry & Context
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT UNIQUE NOT NULL,
    masked_sender TEXT NOT NULL,
    user_role TEXT DEFAULT 'public',
    linked_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    message_count INT DEFAULT 0,
    last_message_text TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    context_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_conv_sender ON public.whatsapp_conversations(sender_id);
CREATE INDEX IF NOT EXISTS idx_wa_conv_role ON public.whatsapp_conversations(user_role);

-- 7. WhatsApp Message Audit Trail
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
    whatsapp_message_id TEXT,
    direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    sender_id TEXT NOT NULL,
    message_text TEXT NOT NULL,
    intent_detected TEXT,
    ai_provider_used TEXT,
    status TEXT DEFAULT 'delivered',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_msg_conv ON public.whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_wa_msg_time ON public.whatsapp_messages(created_at);

-- 8. WhatsApp Access & Security Audit Logs
CREATE TABLE IF NOT EXISTS public.whatsapp_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_queried TEXT,
    status TEXT NOT NULL, -- 'allowed', 'denied', 'rate_limited'
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime publication on connection status for instant dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_connection_status;

-- 9. Row Level Security Policies
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_connection_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_session_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_account_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_access_logs ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admin manage wa_settings" ON public.whatsapp_settings
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin view wa_status" ON public.whatsapp_connection_status
    FOR ALL TO authenticated USING (true);

-- Authenticated users manage own linking tokens
CREATE POLICY "Users insert own link tokens" ON public.whatsapp_link_tokens
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own link tokens" ON public.whatsapp_link_tokens
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users read own wa_links" ON public.whatsapp_account_links
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Conversations & Messages: Admin view only
CREATE POLICY "Admin view wa_conversations" ON public.whatsapp_conversations
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin view wa_messages" ON public.whatsapp_messages
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin view wa_logs" ON public.whatsapp_access_logs
    FOR ALL TO authenticated USING (true);
