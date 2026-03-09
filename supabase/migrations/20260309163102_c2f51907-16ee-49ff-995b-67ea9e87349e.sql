
-- shared_access table: granular per-item sharing
CREATE TABLE public.shared_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  viewer_user_id uuid NOT NULL,
  vault_item_id uuid REFERENCES public.vault_items(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
  permission_level text NOT NULL DEFAULT 'read_only',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shared_access_has_item CHECK (vault_item_id IS NOT NULL OR document_id IS NOT NULL)
);

ALTER TABLE public.shared_access ENABLE ROW LEVEL SECURITY;

-- Owners can manage their shared_access rows
CREATE POLICY "Owners can insert shared_access"
  ON public.shared_access FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can delete shared_access"
  ON public.shared_access FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can view own shared_access"
  ON public.shared_access FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_user_id);

-- Viewers can see shared_access rows where they are the viewer
CREATE POLICY "Viewers can view their shared_access"
  ON public.shared_access FOR SELECT
  TO authenticated
  USING (auth.uid() = viewer_user_id);

-- Update vault_items RLS: viewers can only see items explicitly shared with them
DROP POLICY IF EXISTS "Trusted contacts can view shared vault items" ON public.vault_items;
CREATE POLICY "Viewers can view explicitly shared vault items"
  ON public.vault_items FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.shared_access sa
      WHERE sa.vault_item_id = vault_items.id
        AND sa.viewer_user_id = auth.uid()
    )
  );

-- Update documents RLS: viewers can only see documents explicitly shared with them
DROP POLICY IF EXISTS "Trusted contacts can view shared documents" ON public.documents;
CREATE POLICY "Viewers can view explicitly shared documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.shared_access sa
      WHERE sa.document_id = documents.id
        AND sa.viewer_user_id = auth.uid()
    )
  );

-- Trusted contacts should still be viewable by the invited user (for the shared page)
CREATE POLICY "Invited users can view their contact entry"
  ON public.trusted_contacts FOR SELECT
  TO authenticated
  USING (invited_user_id = auth.uid());

-- Profiles: viewers need to see owner's name
DROP POLICY IF EXISTS "Trusted contacts can view granter profile" ON public.profiles;
CREATE POLICY "Shared viewers can view owner profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.trusted_contacts tc
      WHERE tc.invited_user_id = auth.uid()
        AND tc.user_id = profiles.user_id
    )
  );
