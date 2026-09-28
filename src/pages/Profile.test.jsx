import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { userServiceMock, authUser } = vi.hoisted(() => ({
  userServiceMock: { me: vi.fn(), updateMyUserData: vi.fn() },
  // Stable identity, like the memoized value AuthProvider hands out; a fresh
  // object per render would re-fire Profile's [user] effect forever.
  authUser: { id: 'user-1', email: 'me@example.com' },
}));

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({ user: authUser }),
}));
vi.mock('@/services/users', () => ({ User: userServiceMock }));
vi.mock('@/components/ui/use-toast', () => ({ toast: vi.fn() }));

import Profile from './Profile';

// Radix's Switch measures itself with ResizeObserver, which jsdom lacks.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const profile = (overrides = {}) => ({
  id: 'user-1',
  business_name: 'Acme',
  brand_voice: 'professional',
  content_preferences: { preferred_length: 'medium', include_images: true, seo_focused: true },
  timezone: 'UTC',
  openrouter_api_key: null,
  ...overrides,
});

describe('Profile', () => {
  beforeEach(() => {
    userServiceMock.me.mockReset();
    userServiceMock.updateMyUserData.mockReset().mockResolvedValue({});
  });

  it('loads the saved profile row into the form', async () => {
    userServiceMock.me.mockResolvedValue(profile());
    render(<Profile />);

    expect(await screen.findByDisplayValue('Acme')).toBeInTheDocument();
  });

  it('shows that a key is saved without ever rendering it', async () => {
    userServiceMock.me.mockResolvedValue(profile({ openrouter_api_key: 'sk-or-secret' }));
    const { container } = render(<Profile />);

    expect(await screen.findByText('OpenRouter key saved')).toBeInTheDocument();
    expect(screen.queryByLabelText('OpenRouter API key')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain('sk-or-secret');
  });

  it('saves a newly entered key with the profile', async () => {
    const user = userEvent.setup();
    userServiceMock.me.mockResolvedValue(profile());
    render(<Profile />);

    await user.type(await screen.findByLabelText('OpenRouter API key'), '  sk-or-new  ');
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() =>
      expect(userServiceMock.updateMyUserData).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ business_name: 'Acme', openrouter_api_key: 'sk-or-new' })
      )
    );
    expect(await screen.findByText('OpenRouter key saved')).toBeInTheDocument();
  });

  it('keeps the stored key when the key field is left empty', async () => {
    const user = userEvent.setup();
    userServiceMock.me.mockResolvedValue(profile({ openrouter_api_key: 'sk-or-secret' }));
    render(<Profile />);

    await screen.findByText('OpenRouter key saved');
    await user.click(screen.getByRole('button', { name: 'Replace' }));
    await user.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => expect(userServiceMock.updateMyUserData).toHaveBeenCalled());
    const [, updates] = userServiceMock.updateMyUserData.mock.calls[0];
    expect(updates).not.toHaveProperty('openrouter_api_key');
  });
});
