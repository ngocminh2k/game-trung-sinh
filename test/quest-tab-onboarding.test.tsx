// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { newGame } from '../src/engine'
import type { GameState } from '../src/engine/types'
import { LeftRailTabContent } from '../src/ui/LeftRailTabContent'

vi.mock('../src/ai/system', () => ({
  requestSystemReply: vi.fn().mockResolvedValue({ kind: 'idle', textVi: '', textEn: '' }),
}))

function createFixture(): GameState {
  const base = newGame('test-player')
  return {
    ...base,
    player: {
      ...base.player,
      locationId: 'village',
    },
    quests: {
      q_main_letter: { status: 'available' },
      q_herb_delivery: { status: 'available' },
    },
  }
}

afterEach(() => cleanup())

describe('Quest Tab - Onboarding Guide & Categorization (Second Brain MDA & Schell)', () => {
  it('renders the FTUE beginner guide card by default', () => {
    render(<LeftRailTabContent tab="quest" game={createFixture()} locale="vi" onAction={vi.fn()} />)
    expect(screen.getByTestId('quest-onboarding-guide')).toBeTruthy()
    expect(screen.getByText('📜 Chỉ Dẫn Nhập Môn Tu Tiên')).toBeTruthy()
    expect(screen.getByText(/Khám Phá/)).toBeTruthy()
    expect(screen.getByText(/Trò Chuyện/)).toBeTruthy()
  })

  it('can dismiss and reopen the beginner guide card', () => {
    render(<LeftRailTabContent tab="quest" game={createFixture()} locale="vi" onAction={vi.fn()} />)
    const dismissBtn = screen.getByRole('button', { name: 'Thu gọn chỉ dẫn' })
    fireEvent.click(dismissBtn)

    expect(screen.queryByTestId('quest-onboarding-guide')).toBeNull()
    const reopenBtn = screen.getByRole('button', { name: '📜 Xem lại Chỉ Dẫn Nhập Môn' })
    expect(reopenBtn).toBeTruthy()

    fireEvent.click(reopenBtn)
    expect(screen.getByTestId('quest-onboarding-guide')).toBeTruthy()
  })

  it('separates quests into categorized groups (Chính Tuyến & Chi Tuyến)', () => {
    const { container } = render(<LeftRailTabContent tab="quest" game={createFixture()} locale="vi" onAction={vi.fn()} />)
    expect(screen.getByText(/🏯 Chính Tuyến Khả Dụng/)).toBeTruthy()
    expect(screen.getByText(/📜 Chi Tuyến Khả Dụng/)).toBeTruthy()

    const mainBadges = container.querySelectorAll('.proto-quest-tab__badge--main')
    const sideBadges = container.querySelectorAll('.proto-quest-tab__badge--side')
    expect(mainBadges.length).toBeGreaterThan(0)
    expect(sideBadges.length).toBeGreaterThan(0)
  })

  it('shows diegetic NPC dialogue hint for quests with giver at the current location', () => {
    render(<LeftRailTabContent tab="quest" game={createFixture()} locale="vi" onAction={vi.fn()} />)
    const hints = screen.getAllByText(/Có thể nhận trực tiếp khi trò chuyện với Cụ Mai Hoa/)
    expect(hints.length).toBeGreaterThan(0)
  })

  it('filters quests when selecting category filter chips', () => {
    render(<LeftRailTabContent tab="quest" game={createFixture()} locale="vi" onAction={vi.fn()} />)
    const sideFilterBtn = screen.getByRole('button', { name: 'Chi tuyến' })
    fireEvent.click(sideFilterBtn)

    // Main quest group title should not be rendered
    expect(screen.queryByText(/🏯 Chính Tuyến Khả Dụng/)).toBeNull()
    // Side quest should be visible
    expect(screen.getByText('Lọ thuốc cho cụ Mai Hoa')).toBeTruthy()
  })
})
