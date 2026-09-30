-- ═══════════════════════════════════════════════════════════════
-- Wifitom – moderare recenzii
-- Rulează ÎNAINTE de deploy: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- 1. Coloana de aprobare (recenziile noi intră neaprobate)
alter table public.recenzii
  add column if not exists aprobat boolean not null default false;

-- 2. Recenziile care sunt deja pe site rămân vizibile
update public.recenzii set aprobat = true;

-- 3. Securitate (RLS)
alter table public.recenzii enable row level security;

-- Șterge politicile vechi, ca să nu mai lase pe oricine să citească tot
do $$
declare pol record;
begin
  for pol in select policyname from pg_policies
             where schemaname = 'public' and tablename = 'recenzii'
  loop
    execute format('drop policy %I on public.recenzii', pol.policyname);
  end loop;
end $$;

-- Vizitatorii văd DOAR recenziile aprobate
create policy "citire_doar_aprobate" on public.recenzii
  for select to anon
  using (aprobat = true);

-- Vizitatorii pot trimite recenzii, dar NU se pot auto-aproba
create policy "trimitere_recenzie" on public.recenzii
  for insert to anon
  with check (
    aprobat = false
    and char_length(nume) between 1 and 60
    and char_length(mesaj) between 10 and 400
    and rating between 1 and 5
  );

-- ═══════════════════════════════════════════════════════════════
-- CUM APROBI O RECENZIE:
-- Supabase → Table Editor → recenzii → bifezi „aprobat” = true la rândul respectiv.
-- Ca s-o ștergi: selectezi rândul → Delete.
-- ═══════════════════════════════════════════════════════════════
