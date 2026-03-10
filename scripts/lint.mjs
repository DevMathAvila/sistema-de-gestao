import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const checks = [
  {
    label: 'legacy api endpoint disabled',
    run: async () => {
      const content = await readFile(new URL('../api/index.js', import.meta.url), 'utf8');
      return content.includes('API legada desativada');
    },
  },
  {
    label: 'legacy plaintext api files removed',
    run: async () => (
      !existsSync(new URL('../server/api/handler.js', import.meta.url))
      && !existsSync(new URL('../server/services/supabaseSecureService.js', import.meta.url))
      && !existsSync(new URL('../src/services/api/failuresService.js', import.meta.url))
      && !existsSync(new URL('../src/services/http/apiClient.js', import.meta.url))
    ),
  },
  {
    label: 'strict failure management policy present',
    run: async () => {
      const content = await readFile(new URL('../supabase/RLS_POLICIES.sql', import.meta.url), 'utf8');
      return content.includes('create or replace function public.can_manage_failures()')
        && content.includes('using (public.can_manage_failures())')
        && content.includes("public.current_user_role() <> 'runin_kiosk'");
    },
  },
];

const failures = [];

for (const check of checks) {
  const ok = await check.run();
  if (!ok) failures.push(check.label);
}

if (failures.length > 0) {
  console.error('Lint guardrails failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Lint guardrails passed (${checks.length} checks).`);
