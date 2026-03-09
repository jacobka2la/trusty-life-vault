
ALTER TABLE public.trusted_contacts 
  ADD COLUMN invitation_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN invited_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Allow trusted contacts to view the vault owner's vault items
CREATE POLICY "Trusted contacts can view shared vault items"
ON public.vault_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trusted_contacts tc
    WHERE tc.invited_user_id = auth.uid()
    AND tc.user_id = vault_items.user_id
  )
);

-- Allow trusted contacts to view the vault owner's documents
CREATE POLICY "Trusted contacts can view shared documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trusted_contacts tc
    WHERE tc.invited_user_id = auth.uid()
    AND tc.user_id = documents.user_id
  )
);

-- Allow trusted contacts to view the vault owner's profile (for name display)
CREATE POLICY "Trusted contacts can view granter profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trusted_contacts tc
    WHERE tc.invited_user_id = auth.uid()
    AND tc.user_id = profiles.user_id
  )
);
