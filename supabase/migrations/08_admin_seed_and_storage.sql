-- ==============================================================================
-- IDEAL COACHING CENTRE (ICC) — ADMIN & STORAGE MASTER MIGRATION
-- Migration: 08_admin_seed_and_storage.sql
-- Director: BADE SIR (icckeguruji@gmail.com) | Mobile: 9771350910
-- Sarotiya, Mahagama, Godda (JH) 814165
-- ==============================================================================

-- 1. Ensure Storage Buckets exist (for avatars, course thumbnails & study materials)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('thumbnails', 'thumbnails', true),
    ('study-materials', 'study-materials', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Public read access for avatars & thumbnails
CREATE POLICY "Public Read Avatars" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'avatars');

CREATE POLICY "Public Read Thumbnails" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'thumbnails');

-- Authenticated upload access
CREATE POLICY "Auth Insert Avatars" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Auth Insert Thumbnails" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'thumbnails');

CREATE POLICY "Auth Upload Materials" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'study-materials');

-- 2. Seed Super Admin User Profile in public.profiles
-- Supports 3-Way Authentication via:
--   a) Email: icckeguruji@gmail.com
--   b) Mobile: 9771350910
--   c) Username: badesir or admin
INSERT INTO public.profiles (
    id,
    username,
    full_name,
    mobile_number,
    email,
    board_code,
    district,
    school_name,
    preferred_language,
    avatar_url,
    is_active,
    created_at,
    updated_at
) VALUES (
    'adm00000-0000-0000-0000-000000000001',
    'badesir',
    'BADE SIR (Director)',
    '9771350910',
    'icckeguruji@gmail.com',
    'BSEB',
    'Godda',
    'IDEAL COACHING CENTRE Main Campus',
    'en',
    '/logo.png',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    mobile_number = EXCLUDED.mobile_number,
    is_active = true,
    updated_at = NOW();

-- Also ensure user_roles mapping exists
INSERT INTO public.user_roles (id, user_id, role, created_at)
VALUES (
    'rol00000-0000-0000-0000-000000000001',
    'adm00000-0000-0000-0000-000000000001',
    'admin',
    NOW()
)
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (id, user_id, role, created_at)
VALUES (
    'rol00000-0000-0000-0000-000000000002',
    'adm00000-0000-0000-0000-000000000001',
    'super_admin',
    NOW()
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Dedicated RPC to securely update profile details
CREATE OR REPLACE FUNCTION public.update_user_profile_details(
    p_user_id UUID,
    p_full_name TEXT,
    p_mobile TEXT,
    p_district TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_guardian_name TEXT DEFAULT NULL,
    p_guardian_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    UPDATE public.profiles
    SET full_name = coalesce(p_full_name, full_name),
        mobile_number = coalesce(p_mobile, mobile_number),
        district = coalesce(p_district, district),
        avatar_url = coalesce(p_avatar_url, avatar_url),
        guardian_name = coalesce(p_guardian_name, guardian_name),
        guardian_phone = coalesce(p_guardian_phone, guardian_phone),
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'message', 'Profile updated successfully');
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_profile_details(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;
