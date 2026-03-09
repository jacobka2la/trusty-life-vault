
-- When a user confirms their account, link them to any trusted_contacts that match their email
CREATE OR REPLACE FUNCTION public.link_trusted_contact_on_confirm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only run when email gets confirmed (email_confirmed_at changes from null to a value)
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) THEN
    UPDATE public.trusted_contacts
    SET invited_user_id = NEW.id
    WHERE email = NEW.email
      AND invited_user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
CREATE TRIGGER on_user_confirm_link_contact
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_trusted_contact_on_confirm();
