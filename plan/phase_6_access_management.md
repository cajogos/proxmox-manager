# Phase 6: Access Management Write Operations (Web UI) ✅ COMPLETE

**Priority: MEDIUM** — Current Access page is read-only. Adds create/delete for users, groups, and API tokens.

## Goal

Extend the Access page from a read-only view to a full management UI for users, groups, roles, and API tokens.

---

## Requirements

### Users Tab
- List: ID, Name, Email, Groups, Enabled
- Create user: Username, Realm (dropdown: pve, pam, …), Password, First/Last Name, Email, Groups, Enabled
- Delete user (confirmation dialog)
- Enable/Disable toggle

### Groups Tab
- List: Name, Comment, Members
- Create group: Name, Comment
- Delete group (confirmation)

### Roles Tab
- List: Name, Privileges
- Read-only (roles defined by Proxmox; custom role creation is lower priority — skip for now)

### API Tokens Tab
- List: Token ID, Comment, Expire, Privsep
- Create token: User ID (dropdown from users), Token name, Comment, Expire date, Privsep checkbox
- Delete token (confirmation)
- **Show generated secret once** after creation (copy-to-clipboard button, not retrievable again)

---

## Implementation Checklist

### API Routes (new)
- [ ] `POST /api/access/users` — create user
- [ ] `DELETE /api/access/users/:userid` — delete user
- [ ] `PUT /api/access/users/:userid` — update user (enable/disable)
- [ ] `POST /api/access/groups` — create group
- [ ] `DELETE /api/access/groups/:groupid` — delete group
- [ ] `POST /api/access/tokens` — create token (returns secret)
- [ ] `DELETE /api/access/tokens/:userid/:tokenid` — delete token
- [ ] Extend `src/server/routes/access.ts` with above endpoints

### Web
- [ ] `web/src/components/CreateUserDialog.tsx`
- [ ] `web/src/components/CreateGroupDialog.tsx`
- [ ] `web/src/components/CreateTokenDialog.tsx` — includes one-time secret display
- [ ] Update `web/src/pages/Access.tsx` — add action buttons and dialogs per tab
- [ ] `web/src/api/client.ts` — add mutation functions

### Reuse
- Services already exist: `src/services/access.ts` (7 service functions cover all these operations)
- API endpoints already exist: `src/api/endpoints/access.ts`

---

## Key Files

| File | Change |
|---|---|
| `src/services/access.ts` | Read-only — already complete |
| `src/server/routes/access.ts` | Add POST/PUT/DELETE handlers |
| `web/src/api/client.ts` | Add mutation calls |
| `web/src/pages/Access.tsx` | Add create/delete buttons + dialogs |
| `web/src/components/Create*Dialog.tsx` | New files |

---

## Verification

```bash
pnpm web:dev

# Users tab: create a test user, verify appears in list, delete it
# Groups tab: create group, verify, delete
# Tokens tab: create token for a user, copy secret, delete token
# Check audit log: all actions logged with source: 'web'
```
