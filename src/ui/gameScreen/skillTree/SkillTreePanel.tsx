import { useState } from 'react'
import { TECHNIQUES } from '../../../content'
import { getSkillNode } from '../../../content/skill-tree'
import type { Action, GameState, Locale } from '../../../engine'
import { REALM_STAGES } from '../constants'
import { itemName, localized, word } from '../helpers'
import { deriveSkillTree, type LockReason, type SkillBranchId, type SkillNodeView, type SkillTreeView } from './model'

/* =========================================================================
 *  Issue #33 — the skill tree panel.
 *
 *  The 100 nodes + 1 secret existed in content and in the engine
 *  (`unlock_skill`) but had no UI at all, so every skill point earned by a
 *  breakthrough was invisible and unspendable. This is the whole surface:
 *  one branch at a time (six chips, twenty rows), a reason for every locked
 *  node, and an enabled affordance only when the engine would accept it.
 *
 *  Honesty (deliverable 4): `skillUnlockGate` + `doUnlockSkill` charge the
 *  cost and record the node for ALL 101 nodes, but src/engine/skills.ts only
 *  reads attack / defense-guard buff / dodge / onHit-onKill heal into combat.
 *  `model.effectHonoured` derives the rest and they carry a "no effect yet"
 *  badge instead of promising a number the engine ignores.
 * ========================================================================= */

/** Branch display names — content stores the id only; the seed comments in
 *  skill-tree.ts name the themes (Kiếm/Khí/Dược/Ẩn/Lôi). */
const BRANCH_NAMES: Record<SkillBranchId, [string, string, string]> = {
  sword: ['劍', 'Kiếm', 'Blade'],
  aura: ['氣', 'Khí', 'Aura'],
  herbal: ['藥', 'Dược', 'Herbal'],
  shadow: ['隱', 'Ẩn', 'Shadow'],
  thunder: ['雷', 'Lôi', 'Thunder'],
}

/** Why unlock_skill would die before the skill gate is ever consulted
 *  (execAction in reducer.ts). Null = nothing outside the tree blocks it. */
export function actionBlockedReason(game: GameState, locale: Locale): string | null {
  if (game.terminal || !game.player.alive) return word(locale, 'Kiếp này đã tận', 'This life has ended')
  if (game.encounter !== null) return word(locale, 'Đang giao chiến — lui đã rồi hãy ngộ', 'In combat — retreat first')
  if (game.player.pendingAttributePoints > 0) {
    return word(locale, `Còn ${String(game.player.pendingAttributePoints)} điểm thuộc tính chưa chia`, `${String(game.player.pendingAttributePoints)} attribute point${game.player.pendingAttributePoints === 1 ? '' : 's'} unspent`)
  }
  return null
}

function reasonText(reason: LockReason, view: SkillNodeView, game: GameState, locale: Locale): string {
  switch (reason) {
    case 'already':
      return word(locale, 'Đã lĩnh ngộ', 'Learned')
    case 'conflict': {
      const rival = (view.node.conflictsWith ?? []).map((id) => getSkillNode(id)).find((n) => n !== undefined)
      return rival === undefined
        ? word(locale, 'Xung đột đường đã chọn', 'Conflicts with your path')
        : word(locale, `Xung đột với “${localized(locale, rival)}”`, `Conflicts with "${localized(locale, rival)}"`)
    }
    case 'stage': {
      const stage = REALM_STAGES[view.node.require.stage] ?? REALM_STAGES[0]!
      return word(locale, `Cần ${stage.vi} ${stage.seal}`, `Needs ${stage.en} ${stage.seal}`)
    }
    case 'technique': {
      const wanted = (view.node.require.techniques ?? [])
        .filter((id) => (game.techniques[id] ?? 0) <= 0)
        .map((id) => TECHNIQUES.find((t) => t.id === id))
        .find((t) => t !== undefined)
      return wanted === undefined
        ? word(locale, 'Chưa đủ căn cơ', 'Foundation not ready')
        : word(locale, `Cần công pháp “${localized(locale, wanted)}”`, `Needs the "${localized(locale, wanted)}" technique`)
    }
    case 'tier': {
      const prev = getSkillNode(`${view.branch}_t${String(view.tier - 1)}`)
      return prev === undefined
        ? word(locale, 'Chưa mở tầng trước', 'Previous tier still sealed')
        : word(locale, `Sau “${localized(locale, prev)}”`, `After "${localized(locale, prev)}"`)
    }
    case 'points': {
      const missing = view.cost.skillPoints - (game.player.skillPoints ?? 0)
      return word(locale, `Thiếu ${String(missing)} điểm kỹ năng`, `${String(missing)} more skill point${missing === 1 ? '' : 's'} needed`)
    }
    case 'gold': {
      const missing = (view.cost.gold ?? 0) - game.player.gold
      return word(locale, `Thiếu ${String(missing)} lượng`, `${String(missing)} more gold needed`)
    }
    case 'item':
      return view.cost.item === undefined
        ? word(locale, 'Thiếu linh tài', 'Missing material')
        : word(locale, `Cần mang ${itemName(view.cost.item, locale)}`, `Carry ${itemName(view.cost.item, locale)} first`)
    case 'progression':
      return word(locale, 'Chưa thể lĩnh ngộ', 'Not available yet')
  }
}

function CostLine({ view, locale }: { view: SkillNodeView; locale: Locale }): JSX.Element {
  const parts = [word(locale, `${String(view.cost.skillPoints)} điểm kỹ năng`, `${String(view.cost.skillPoints)} skill pt`)]
  if (view.cost.gold !== undefined) parts.push(`${String(view.cost.gold)}◎`)
  if (view.cost.item !== undefined) parts.push(itemName(view.cost.item, locale))
  return <span className="st-cost">{parts.join(' + ')}</span>
}

function SkillRow({ view, game, locale, blocked, onAction }: { view: SkillNodeView; game: GameState; locale: Locale; blocked: string | null; onAction: (action: Action) => void }): JSX.Element {
  const vi = locale === 'vi'
  const openable = view.legal && blocked === null
  const status = view.unlocked
    ? word(locale, 'Đã lĩnh ngộ', 'Learned')
    : blocked !== null
      ? blocked
      : view.reason === null
        ? word(locale, 'Chưa lĩnh ngộ', 'Not learned')
        : reasonText(view.reason, view, game, locale)
  return (
    <li
      className={`st-row ${view.unlocked ? 'is-unlocked' : ''} ${openable ? 'is-legal' : 'is-locked'}`}
      data-testid={`skill-node-${view.id}`}
      data-legal={openable ? '1' : '0'}
    >
      <span className="st-tier" aria-hidden="true">{view.tier}</span>
      <span className="st-copy">
        <strong>{localized(locale, view.node)}</strong>
        <em className="st-desc">{vi ? view.node.descVi : view.node.descEn}</em>
        <span className="st-meta">
          <CostLine view={view} locale={locale} />
          {view.inert && (
            <span className="st-inert" data-testid={`skill-inert-${view.id}`} title={word(locale, 'Engine chưa đưa hiệu quả này vào combat', 'The engine does not apply this effect in combat yet')}>
              {word(locale, 'chưa có hiệu lực', 'no effect yet')}
            </span>
          )}
        </span>
      </span>
      {/* The affordance exists only when the engine would take the action: no
          disabled button to click into an ERROR the panel already predicted. */}
      {openable ? (
        <button
          type="button"
          className="st-unlock"
          data-testid={`skill-unlock-${view.id}`}
          onClick={() => onAction({ kind: 'unlock_skill', nodeId: view.id })}
        >
          {word(locale, 'Lĩnh ngộ', 'Unlock')}
        </button>
      ) : (
        <em className="st-status" data-testid={`skill-lock-${view.id}`}>{status}</em>
      )}
    </li>
  )
}

export interface SkillTreePanelProps {
  game: GameState
  locale: Locale
  onAction: (action: Action) => void
  onClose: () => void
}

/** One branch at a time: six chips above, twenty scrollable rows below.
 *  The chips are plain buttons with aria-pressed rather than role="tab", so
 *  the list keeps one label and no tabpanel wiring is needed. */
export function SkillTreePanel({ game, locale, onAction, onClose }: SkillTreePanelProps): JSX.Element {
  const tree: SkillTreeView = deriveSkillTree(game)
  // SKILL_BRANCHES is a fixed non-empty table, so branches[0] always exists;
  // noUncheckedIndexedAccess cannot see that, hence the belt-and-braces cast.
  const [firstBranch] = tree.branches
  const [activeBranch, setActiveBranch] = useState<SkillBranchId | 'secret'>(firstBranch?.branch ?? 'sword')
  const vi = locale === 'vi'
  const blocked = actionBlockedReason(game, locale)
  const current = tree.branches.find((b) => b.branch === activeBranch)
  const rows = current === undefined ? tree.special : current.nodes
  const handleBackdrop = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) onClose()
  }
  return (
    <div className="proto-modal-backdrop show st-backdrop" role="dialog" aria-modal="true" data-testid="skill-tree-panel" aria-label={word(locale, 'Cây công pháp', 'Skill tree')} onClick={handleBackdrop}>
      <div className="proto-modal skill-tree" data-od-id="skill-tree">
        <button className="x" type="button" onClick={onClose} aria-label={word(locale, 'Đóng', 'Close')} data-testid="skill-tree-close">✕</button>
        <header className="st-head">
          <h2>{word(locale, 'Cây Công Pháp', 'Skill Tree')}</h2>
          <p className="st-balance" data-testid="skill-point-balance">
            {word(locale, 'Điểm kỹ năng', 'Skill points')} <span className="v">{tree.skillPoints}</span>
          </p>
          <p className="st-legend" data-testid="skill-tree-legend">
            {word(
              locale,
              `${String(tree.unlockedCount)}/${String(tree.total)} đã lĩnh ngộ · ${String(tree.legalCount)} mở được ngay · ${String(tree.honouredTotal)} có hiệu lực thật`,
              `${String(tree.unlockedCount)}/${String(tree.total)} learned · ${String(tree.legalCount)} unlockable now · ${String(tree.honouredTotal)} with live effects`,
            )}
          </p>
          {blocked !== null && (
            <p className="st-blocked" data-testid="skill-tree-blocked">{word(locale, `Chưa mở được: ${blocked}`, `Cannot unlock yet: ${blocked}`)}</p>
          )}
        </header>
        <nav className="st-tabs" aria-label={word(locale, 'Ngành công pháp', 'Skill branches')} data-testid="skill-tree-tabs">
          {tree.branches.map((branch) => {
            const [seal, nameVi, nameEn] = BRANCH_NAMES[branch.branch]
            return (
              <button
                key={branch.branch}
                type="button"
                className={activeBranch === branch.branch ? 'active' : ''}
                data-testid={`skill-branch-${branch.branch}`}
                aria-pressed={activeBranch === branch.branch}
                onClick={() => setActiveBranch(branch.branch)}
              >
                <span className="seal" aria-hidden="true">{seal}</span>
                <span>{vi ? nameVi : nameEn}</span>
                <em className="count">{String(branch.unlockedCount)}/20</em>
              </button>
            )
          })}
          <button
            type="button"
            className={activeBranch === 'secret' ? 'active' : ''}
            data-testid="skill-branch-secret"
            aria-pressed={activeBranch === 'secret'}
            onClick={() => setActiveBranch('secret')}
          >
            <span className="seal" aria-hidden="true">祕</span>
            <span>{word(locale, 'Bí truyền', 'Secret')}</span>
            <em className="count">{String(tree.special.filter((v) => v.unlocked).length)}/{String(tree.special.length)}</em>
          </button>
        </nav>
        <ul className="st-list" aria-label={word(locale, 'Các tầng công pháp', 'Skill tiers')} data-testid="skill-tree-list">
          {rows.map((view) => (
            <SkillRow key={view.id} view={view} game={game} locale={locale} blocked={blocked} onAction={onAction} />
          ))}
        </ul>
        <footer className="st-foot">
          {word(
            locale,
            'Mỗi lần đề thăng cho 1 điểm kỹ năng. Điểm chỉ đổi được tầng kế tiếp trong ngành đã mở.',
            'Each breakthrough grants 1 skill point. A point unlocks the next tier of a branch you have opened.',
          )}
        </footer>
      </div>
    </div>
  )
}
