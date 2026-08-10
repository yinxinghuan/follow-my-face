import { useCallback, useEffect, useRef, useState } from 'react';
import { callAigramAPI, isInAigramNow, getTelegramId } from '@shared/runtime';
import type { Identity } from '../types';

type ProfileResponse = { data?: { name?: string; user_name?: string; head_url?: string } };
const params = new URLSearchParams(window.location.search);
const queryName = params.get('user_name')?.trim() || '';
const queryAvatar = params.get('avatar_url')?.trim() || '';
const fallbackAvatar = new URL('./alteru-default-avatar.jpg', document.baseURI).href;

export function useIdentity() {
  const serial = useRef(0);
  const [identity, setIdentity] = useState<Identity>({
    name: queryName || 'AlterU', avatarUrl: queryAvatar || fallbackAvatar,
    status: isInAigramNow() && !queryName && !queryAvatar ? 'loading' : 'ready',
  });

  const load = useCallback(async () => {
    if (!isInAigramNow() || !getTelegramId()! || queryName || queryAvatar) {
      setIdentity({ name: queryName || 'AlterU', avatarUrl: queryAvatar || fallbackAvatar, status: 'ready' });
      return;
    }
    const request = ++serial.current;
    try {
      const response = await callAigramAPI<ProfileResponse>(
        `/note/telegram/user/get/info/by/telegram_id?telegram_id=${encodeURIComponent(getTelegramId()!)}`, 'GET',
      );
      if (request !== serial.current) return;
      const name = response.data?.name?.trim() || response.data?.user_name?.trim();
      if (!name) throw new Error('missing name');
      setIdentity({ name, avatarUrl: response.data?.head_url?.trim() || fallbackAvatar, status: 'ready' });
    } catch {
      if (request !== serial.current) return;
      setIdentity({ name: 'AlterU', avatarUrl: fallbackAvatar, status: 'error' });
    }
  }, []);

  useEffect(() => { void load(); return () => { serial.current += 1; }; }, [load]);
  return identity;
}
